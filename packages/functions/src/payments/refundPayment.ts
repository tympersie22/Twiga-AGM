import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FlutterwaveAPI } from '../lib/flutterwave-api';

export const refundPayment = functions.https.onCall(
  async (data: { paymentId: string; reason: string }, context) => {
    const db = admin.firestore();
    const flutterwave = new FlutterwaveAPI(process.env.FLUTTERWAVE_SECRET_KEY || '');

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { paymentId, reason } = data;
    const paymentsSnap = await db.collectionGroup('payments').where('id', '==', paymentId).limit(1).get();
    if (paymentsSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentDoc = paymentsSnap.docs[0];
    const paymentData = paymentDoc.data();
    if (paymentData.status !== 'confirmed') {
      throw new functions.https.HttpsError('invalid-argument', 'Can only refund confirmed payments');
    }

    await flutterwave.refundPayment(paymentData.flutterwaveRef, paymentData.amount);
    await paymentDoc.ref.update({
      status: 'refunded',
      failureReason: reason,
      updatedAt: Date.now(),
    });

    const bookingId = paymentData.bookingId;
    const bookingSnap = await db.collectionGroup('bookings').where('id', '==', bookingId).limit(1).get();
    if (!bookingSnap.empty) {
      await bookingSnap.docs[0].ref.update({
        status: 'cancelled',
        cancelReason: `Refunded: ${reason}`,
        cancelledAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true, message: 'Refund processed successfully' };
  }
);
