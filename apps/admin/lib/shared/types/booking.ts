export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'pay_on_arrival'
  | 'cancelled'
  | 'completed';

export type BookingSource = 'direct' | 'airbnb' | 'booking_com';

export interface TwigaBooking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: number;
  checkOut: number;
  pickupTime?: string;
  numberOfGuests: number;
  totalNights: number;
  roomPrice: number;
  totalPrice: number;
  paymentId: string;
  source: BookingSource;
  status: BookingStatus;
  notes?: string;
  specialRequests?: string;
  createdAt: number;
  updatedAt: number;
  cancelledAt?: number;
  cancelReason?: string;
  checkInCompleted?: boolean;
  checkInCompletedAt?: number;
}

export interface BookingCreateInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: number;
  checkOut: number;
  numberOfGuests: number;
  specialRequests?: string;
  source: BookingSource;
}
