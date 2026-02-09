import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { calculateNights } from '@twiga/shared';

export interface InitiatePaymentRequest {
  booking: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    roomId: string;
    checkIn: number;
    checkOut: number;
    numberOfGuests: number;
    specialRequests?: string;
    source: 'direct' | 'airbnb' | 'booking_com';
  };
  depositPercentage: number;
  roomPrice: number;
  paymentMethod: 'mobile_money' | 'card' | 'pay_on_arrival';
  mobileProvider?: string;
  phoneNumber?: string;
}

const COMPANY_ID = 'twiga-agm';
const PROPERTY_ID = 'twiga-residence';

function generateBookingId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${ts}-${rand}`;
}

function generatePaymentId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${ts}-${rand}`;
}

export const paymentService = {
  async initiatePayment(data: InitiatePaymentRequest) {
    const bookingId = generateBookingId();
    const paymentId = generatePaymentId();
    const now = Date.now();
    const nights = calculateNights(data.booking.checkIn, data.booking.checkOut);
    const totalPrice = data.roomPrice * nights;
    const depositAmount = Math.ceil((totalPrice * data.depositPercentage) / 100);

    // Determine statuses based on payment method
    const isPayOnArrival = data.paymentMethod === 'pay_on_arrival';
    const bookingStatus = isPayOnArrival ? 'pay_on_arrival' : 'confirmed';
    const paymentStatus = isPayOnArrival ? 'initiated' : 'confirmed';

    // Build booking document (no undefined values — Firestore rejects them)
    const bookingDoc: Record<string, unknown> = {
      id: bookingId,
      propertyId: PROPERTY_ID,
      guestName: data.booking.guestName,
      guestEmail: data.booking.guestEmail,
      guestPhone: data.booking.guestPhone,
      roomId: data.booking.roomId,
      checkIn: data.booking.checkIn,
      checkOut: data.booking.checkOut,
      numberOfGuests: data.booking.numberOfGuests,
      totalNights: nights,
      roomPrice: data.roomPrice,
      totalPrice: totalPrice,
      paymentId: paymentId,
      source: data.booking.source || 'direct',
      status: bookingStatus,
      createdAt: now,
      updatedAt: now,
    };

    // Only add optional fields if they have values
    if (data.booking.specialRequests) {
      bookingDoc.specialRequests = data.booking.specialRequests;
    }

    // Build payment document
    const paymentDoc: Record<string, unknown> = {
      id: paymentId,
      bookingId: bookingId,
      propertyId: PROPERTY_ID,
      amount: isPayOnArrival ? 0 : depositAmount,
      currency: 'TZS',
      method: data.paymentMethod,
      flutterwaveRef: '',
      idempotencyKey: `${bookingId}-${paymentId}`,
      status: paymentStatus,
      stkPushAttempts: data.paymentMethod === 'mobile_money' ? 1 : 0,
      webhookReceived: false,
      createdAt: now,
      metadata: {
        stkPromptSent: data.paymentMethod === 'mobile_money',
        pollingAttempts: 0,
      },
    };

    // Add optional payment fields
    if (data.mobileProvider) {
      paymentDoc.mobileProvider = data.mobileProvider;
    }
    if (data.phoneNumber) {
      paymentDoc.phoneNumber = data.phoneNumber;
    }
    if (paymentStatus === 'confirmed') {
      paymentDoc.confirmedAt = now;
    }

    // Write booking to Firestore
    const bookingRef = doc(
      db,
      'companies', COMPANY_ID,
      'properties', PROPERTY_ID,
      'bookings', bookingId
    );
    await setDoc(bookingRef, bookingDoc);

    // Write payment to Firestore (subcollection of booking)
    const paymentRef = doc(
      db,
      'companies', COMPANY_ID,
      'properties', PROPERTY_ID,
      'bookings', bookingId,
      'payments', paymentId
    );
    await setDoc(paymentRef, paymentDoc);

    console.info(`[Firestore] Booking ${bookingId} created with status: ${bookingStatus}`);

    return {
      bookingId,
      status: isPayOnArrival ? 'pending_approval' : 'confirmed',
      message: isPayOnArrival
        ? `Booking ${bookingId} created. Pay on arrival confirmed.`
        : `Booking ${bookingId} confirmed. Payment processed.`,
    };
  },

  async pollPaymentStatus(_bookingId: string, _paymentId: string) {
    // Payments are confirmed immediately (no Flutterwave webhook in this mode)
    return { status: 'confirmed', attempt: 1, message: 'Payment confirmed' };
  },
};
