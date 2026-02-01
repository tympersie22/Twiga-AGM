import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

async function blockAvailability(
  db: admin.firestore.Firestore,
  companyId: string,
  propertyId: string,
  roomId: string,
  checkIn: number,
  checkOut: number
) {
  const propertyRef = db
    .collection('companies')
    .doc(companyId)
    .collection('properties')
    .doc(propertyId);
  let current = new Date(checkIn);
  const end = new Date(checkOut);
  while (current < end) {
    const dateStr = current.toISOString().split('T')[0];
    const docRef = propertyRef.collection('availability').doc(dateStr);
    await docRef.set(
      { [`rooms.${roomId}`]: 'blocked', updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    current.setDate(current.getDate() + 1);
  }
}

export const onBookingConfirmed = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}/bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before?.status === after?.status || after?.status !== 'confirmed') return;

    const db = admin.firestore();
    const { propertyId, bookingId } = context.params;

    try {
      await blockAvailability(
        db,
        'twiga-agm',
        propertyId,
        after.roomId,
        after.checkIn,
        after.checkOut
      );
      console.log('Booking confirmed and availability blocked:', bookingId);
    } catch (error) {
      console.error('Confirm booking error:', error);
    }
  });
