import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const cancelBooking = functions.https.onCall(
  async (data: { bookingId: string; reason: string }, context) => {
    const db = admin.firestore();
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { bookingId, reason } = data;
    const bookingSnap = await db.collectionGroup('bookings').where('id', '==', bookingId).limit(1).get();
    if (bookingSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const bookingDoc = bookingSnap.docs[0];
    const bookingData = bookingDoc.data();
    await bookingDoc.ref.update({
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    const propertyRef = bookingDoc.ref.parent.parent;
    if (propertyRef) {
      let current = new Date(bookingData.checkIn);
      const end = new Date(bookingData.checkOut);
      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        await propertyRef.collection('availability').doc(dateStr).update({
          [`rooms.${bookingData.roomId}`]: 'available',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        current.setDate(current.getDate() + 1);
      }
    }

    return { success: true, message: 'Booking cancelled and availability released' };
  }
);
