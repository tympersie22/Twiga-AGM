import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FlutterwaveAPI } from '../lib/flutterwave-api';

export const pollPaymentStatus = functions.https.onCall(
  async (data: { bookingId: string; paymentId: string }, context) => {
    const db = admin.firestore();
    const flutterwave = new FlutterwaveAPI(process.env.FLUTTERWAVE_SECRET_KEY || '');

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { bookingId, paymentId } = data;
    const paymentsSnap = await db.collectionGroup('payments').where('id', '==', paymentId).limit(1).get();
    if (paymentsSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentDoc = paymentsSnap.docs[0];
    const paymentData = paymentDoc.data();
    if (paymentData.status === 'confirmed') {
      return { status: 'confirmed', message: 'Payment already confirmed' };
    }

    const maxAttempts = 3;
    const delayMs = 30000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      try {
        const verifyResponse = await flutterwave.checkTransactionStatus(paymentData.flutterwaveRef);
        const txStatus = verifyResponse.data?.status;
        if (txStatus === 'successful') {
          await paymentDoc.ref.update({
            status: 'confirmed',
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: Date.now(),
            'metadata.pollingAttempts': attempt + 1,
          });
          const bookingSnap = await db
            .collectionGroup('bookings')
            .where('id', '==', bookingId)
            .limit(1)
            .get();
          if (!bookingSnap.empty) {
            await bookingSnap.docs[0].ref.update({ status: 'confirmed', updatedAt: Date.now() });
          }
          return { status: 'confirmed', attempt: attempt + 1, message: 'Payment confirmed after polling' };
        }
        if (txStatus === 'failed') {
          await paymentDoc.ref.update({
            status: 'failed',
            failureReason: 'Payment declined',
            updatedAt: Date.now(),
            'metadata.pollingAttempts': attempt + 1,
          });
          return { status: 'failed', attempt: attempt + 1, message: 'Payment was declined' };
        }
      } catch (e) {
        console.warn('Poll attempt failed:', e);
      }
    }

    await paymentDoc.ref.update({
      'metadata.pollingAttempts': maxAttempts,
      'metadata.lastPollingTime': Date.now(),
    });
    return {
      status: 'pending',
      attempt: maxAttempts,
      message: 'Payment status still pending. Please wait or contact support.',
    };
  }
);
