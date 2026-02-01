import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FlutterwaveAPI } from '../lib/flutterwave-api';
import { nanoid } from 'nanoid';

interface BookingCreateInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: number;
  checkOut: number;
  numberOfGuests: number;
  specialRequests?: string;
  source: 'direct' | 'airbnb' | 'booking_com';
}

interface InitiatePaymentRequest {
  booking: BookingCreateInput;
  depositPercentage: number;
  roomPrice: number;
  paymentMethod: 'mobile_money' | 'card' | 'pay_on_arrival';
  mobileProvider?: string;
  phoneNumber?: string;
}

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  return `+${cleaned.slice(0, 3)}${'X'.repeat(cleaned.length - 5)}${cleaned.slice(-2)}`;
}

function validatePaymentAmount(amount: number, min: number): { valid: boolean; error?: string } {
  if (amount < min) return { valid: false, error: `Minimum deposit is ${min / 100} TZS` };
  if (amount <= 0) return { valid: false, error: 'Amount must be greater than 0' };
  return { valid: true };
}

export const initiatePayment = functions.https.onCall(async (data: InitiatePaymentRequest, context) => {
  const db = admin.firestore();
  const flutterwave = new FlutterwaveAPI(process.env.FLUTTERWAVE_SECRET_KEY || '');

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { booking, depositPercentage, roomPrice, paymentMethod, mobileProvider, phoneNumber } = data;
  const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
  const totalPrice = roomPrice * nights;
  const depositAmount = Math.ceil((totalPrice * depositPercentage) / 100);

  const validation = validatePaymentAmount(depositAmount, 50000);
  if (!validation.valid) {
    throw new functions.https.HttpsError('invalid-argument', validation.error);
  }

  const bookingsRef = db
    .collection('companies')
    .doc('twiga-agm')
    .collection('properties')
    .doc('twiga-residence')
    .collection('bookings');
  const bookingRef = bookingsRef.doc();
  const idempotencyKey = `TWIGA-${bookingRef.id}-${Date.now()}`;
  const paymentId = nanoid();

  const newBooking = {
    id: bookingRef.id,
    propertyId: 'twiga-residence',
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    roomId: booking.roomId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    numberOfGuests: booking.numberOfGuests,
    totalNights: nights,
    roomPrice: roomPrice,
    totalPrice: totalPrice,
    paymentId,
    source: booking.source,
    status: 'pending_payment',
    notes: booking.specialRequests || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const newPayment = {
    id: paymentId,
    bookingId: bookingRef.id,
    propertyId: 'twiga-residence',
    amount: depositAmount,
    currency: 'TZS',
    method: paymentMethod,
    flutterwaveRef: idempotencyKey,
    idempotencyKey,
    status: 'initiated',
    mobileProvider: mobileProvider || null,
    phoneNumber: phoneNumber ? maskPhone(phoneNumber) : undefined,
    stkPushAttempts: 0,
    webhookReceived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: { stkPromptSent: false, pollingAttempts: 0 },
  };

  await bookingRef.set(newBooking);
  await bookingRef.collection('payments').doc(paymentId).set(newPayment);

  if (paymentMethod === 'pay_on_arrival') {
    return {
      success: true,
      bookingId: bookingRef.id,
      paymentId,
      amount: depositAmount,
      status: 'pending_approval',
      message: 'Booking created. Awaiting admin approval.',
    };
  }

  const webUrl = process.env.WEB_URL || 'https://twiga-residence.com';
  const payload = {
    tx_ref: idempotencyKey,
    amount: depositAmount / 100,
    currency: 'TZS',
    payment_options: 'mobilemoney,card',
    customer: {
      email: booking.guestEmail,
      phonenumber: booking.guestPhone,
      name: booking.guestName,
    },
    customizations: {
      title: 'Twiga Residence - Room Booking',
      description: `${booking.numberOfGuests} guests, ${nights} nights`,
      logo: 'https://twiga-agm.com/logo.png',
    },
    meta: { propertyId: 'twiga-residence', bookingId: bookingRef.id, roomId: booking.roomId },
    redirect_url: `${webUrl}/booking/${bookingRef.id}/confirm`,
  };

  try {
    const fwResponse = await flutterwave.initializePayment(payload);
    if (fwResponse.status !== 'success' || !fwResponse.data?.link) {
      throw new Error('Failed to initialize Flutterwave payment');
    }
    await bookingRef.collection('payments').doc(paymentId).update({
      status: 'processing',
      'metadata.stkPromptSent': true,
      updatedAt: Date.now(),
    });
    return {
      success: true,
      bookingId: bookingRef.id,
      paymentId,
      amount: depositAmount,
      paymentLink: fwResponse.data.link,
      idempotencyKey,
      message: 'Payment initialized. Redirecting to Flutterwave...',
    };
  } catch (error) {
    console.error('Initiate payment error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initiate payment');
  }
});
