import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FlutterwaveAPI } from '../lib/flutterwave-api';

interface FlutterwaveWebhookEvent {
  event: 'charge.completed' | 'charge.failed';
  data: {
    tx_ref: string;
    status: 'successful' | 'failed' | 'pending';
  };
}

export const handleFlutterwaveWebhook = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const flutterwave = new FlutterwaveAPI(process.env.FLUTTERWAVE_SECRET_KEY || '');

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const signature = (req.headers['verif-hash'] || req.headers['verificationhash']) as string;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (signature && !flutterwave.verifyWebhookSignature(rawBody, signature)) {
      console.warn('Invalid webhook signature');
      res.status(403).json({ error: 'Invalid signature' });
      return;
    }

    const event: FlutterwaveWebhookEvent = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);

    await db.collection('companies').doc('twiga-agm').collection('webhookLogs').add({
      event: event.event,
      txRef: event.data.tx_ref,
      status: event.data.status,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      rawData: event.data,
    });

    if (event.event !== 'charge.completed') {
      res.status(200).json({ success: true });
      return;
    }

    const txRef = event.data.tx_ref;
    const txStatus = event.data.status;

    const paymentsSnap = await db.collectionGroup('payments').where('flutterwaveRef', '==', txRef).limit(1).get();
    if (paymentsSnap.empty) {
      console.warn('Payment not found for tx_ref:', txRef);
      res.status(200).json({ success: true });
      return;
    }

    const paymentDoc = paymentsSnap.docs[0];
    const paymentData = paymentDoc.data();
    if (paymentData.webhookReceived === true) {
      res.status(200).json({ success: true });
      return;
    }

    const bookingId = paymentData.bookingId;
    const propertyId = paymentData.propertyId;

    if (txStatus === 'successful') {
      await paymentDoc.ref.update({
        status: 'confirmed',
        webhookReceived: true,
        webhookAt: admin.firestore.FieldValue.serverTimestamp(),
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: Date.now(),
      });
      const bookingRef = db
        .collection('companies')
        .doc('twiga-agm')
        .collection('properties')
        .doc(propertyId)
        .collection('bookings')
        .doc(bookingId);
      await bookingRef.update({ status: 'confirmed', updatedAt: Date.now() });
      console.log('Payment confirmed for booking:', bookingId);
    } else if (txStatus === 'failed') {
      await paymentDoc.ref.update({
        status: 'failed',
        webhookReceived: true,
        webhookAt: admin.firestore.FieldValue.serverTimestamp(),
        failureReason: event.data.status,
        updatedAt: Date.now(),
      });
      const bookingRef = db
        .collection('companies')
        .doc('twiga-agm')
        .collection('properties')
        .doc(propertyId)
        .collection('bookings')
        .doc(bookingId);
      await bookingRef.update({
        status: 'cancelled',
        cancelReason: 'Payment failed',
        cancelledAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
