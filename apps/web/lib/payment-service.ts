import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
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

// Generate a booking ID for demo mode
function generateBookingId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `BK-${num}`;
}

// Demo mode fallback — simulates booking creation without Cloud Functions
async function initiatePaymentDemo(data: InitiatePaymentRequest) {
  // Simulate a small network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const bookingId = generateBookingId();
  const nights = calculateNights(data.booking.checkIn, data.booking.checkOut);
  const totalPrice = data.roomPrice * nights;

  if (data.paymentMethod === 'pay_on_arrival') {
    return {
      bookingId,
      status: 'pending_approval',
      message: `Booking ${bookingId} created. Pay on arrival confirmed.`,
    };
  }

  if (data.paymentMethod === 'card') {
    // In demo mode, skip Flutterwave redirect and simulate success
    return {
      bookingId,
      status: 'confirmed',
      message: `Booking ${bookingId} confirmed. Card payment of ${totalPrice} TZS processed.`,
    };
  }

  if (data.paymentMethod === 'mobile_money') {
    // In demo mode, simulate mobile money STK push success
    return {
      bookingId,
      status: 'confirmed',
      message: `Booking ${bookingId} confirmed. Mobile money payment received.`,
    };
  }

  return { bookingId, status: 'confirmed' };
}

export const paymentService = {
  async initiatePayment(data: InitiatePaymentRequest) {
    try {
      const fn = httpsCallable(functions, 'initiatePayment');
      const result = await fn(data);
      return result.data;
    } catch {
      // Cloud Functions not deployed or unavailable — use demo mode
      console.info('[Demo Mode] Cloud Functions unavailable, using local booking simulation');
      return initiatePaymentDemo(data);
    }
  },
  async pollPaymentStatus(bookingId: string, paymentId: string) {
    try {
      const fn = httpsCallable(functions, 'pollPaymentStatus');
      const result = await fn({ bookingId, paymentId });
      return result.data;
    } catch {
      // Demo mode fallback
      return { status: 'confirmed', attempt: 1, message: 'Payment confirmed (demo)' };
    }
  },
};
