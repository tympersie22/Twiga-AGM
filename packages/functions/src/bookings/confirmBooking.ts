import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendBookingConfirmationEmail } from '../notifications/sendEmail';
import { sendBookingConfirmationSms } from '../notifications/sendSms';

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

async function getRoomName(
  db: admin.firestore.Firestore,
  companyId: string,
  propertyId: string,
  roomId: string
): Promise<string> {
  try {
    const roomDoc = await db
      .collection('companies')
      .doc(companyId)
      .collection('properties')
      .doc(propertyId)
      .collection('rooms')
      .doc(roomId)
      .get();
    return roomDoc.data()?.name || roomId;
  } catch {
    return roomId;
  }
}

export const onBookingConfirmed = functions.firestore
  .document('companies/{companyId}/properties/{propertyId}/bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before?.status === after?.status || after?.status !== 'confirmed') return;

    const db = admin.firestore();
    const { companyId, propertyId, bookingId } = context.params;

    try {
      // Block room availability
      await blockAvailability(
        db,
        companyId,
        propertyId,
        after.roomId,
        after.checkIn,
        after.checkOut
      );
      functions.logger.info('Booking confirmed and availability blocked:', bookingId);

      // Get room name for notifications
      const roomName = await getRoomName(db, companyId, propertyId, after.roomId);
      const depositAmount = Math.ceil((after.totalPrice * 50) / 100);

      // Send email notification
      try {
        await sendBookingConfirmationEmail({
          guestName: after.guestName,
          guestEmail: after.guestEmail,
          bookingId,
          roomName,
          checkIn: after.checkIn,
          checkOut: after.checkOut,
          totalNights: after.totalNights,
          totalPrice: after.totalPrice,
          depositAmount,
        });
        functions.logger.info('Confirmation email sent to:', after.guestEmail);
      } catch (emailErr) {
        functions.logger.error('Failed to send confirmation email:', emailErr);
      }

      // Send SMS notification
      try {
        await sendBookingConfirmationSms({
          guestPhone: after.guestPhone,
          guestName: after.guestName,
          bookingId,
          checkIn: after.checkIn,
          totalNights: after.totalNights,
        });
        functions.logger.info('Confirmation SMS sent to:', after.guestPhone);
      } catch (smsErr) {
        functions.logger.error('Failed to send confirmation SMS:', smsErr);
      }
    } catch (error) {
      functions.logger.error('Confirm booking error:', error);
    }
  });
