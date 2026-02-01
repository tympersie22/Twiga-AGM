import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

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

export const paymentService = {
  async initiatePayment(data: InitiatePaymentRequest) {
    const fn = httpsCallable(functions, 'initiatePayment');
    const result = await fn(data);
    return result.data;
  },
  async pollPaymentStatus(bookingId: string, paymentId: string) {
    const fn = httpsCallable(functions, 'pollPaymentStatus');
    const result = await fn({ bookingId, paymentId });
    return result.data;
  },
};
