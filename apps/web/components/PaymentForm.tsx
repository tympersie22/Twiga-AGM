'use client';

import { useState } from 'react';
import { formatCurrency } from '@twiga/shared/utils/formatting';
import { paymentService } from '@/lib/payment-service';
import type { TwigaRoom } from '@twiga/shared/types';

type PaymentMethod = 'mobile_money' | 'card' | 'pay_on_arrival';

interface PaymentFormProps {
  booking: Record<string, unknown>;
  rooms: TwigaRoom[];
  onSuccess: () => void;
  onBack: () => void;
}

export default function PaymentForm({ booking, rooms, onSuccess, onBack }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const depositAmount = Math.ceil((Number(booking.totalPrice) * 50) / 100);
  const selectedRoom = rooms.find((r) => r.id === booking.roomId);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (paymentMethod === 'pay_on_arrival') {
        const result = await paymentService.initiatePayment({
          booking: {
            guestName: String(booking.guestName),
            guestEmail: String(booking.guestEmail),
            guestPhone: String(booking.guestPhone),
            roomId: String(booking.roomId),
            checkIn: Number(booking.checkIn),
            checkOut: Number(booking.checkOut),
            numberOfGuests: Number(booking.numberOfGuests),
            specialRequests: String(booking.specialRequests || ''),
            source: 'direct',
          },
          depositPercentage: 50,
          roomPrice: Number(booking.roomPrice),
          paymentMethod: 'pay_on_arrival',
        });
        if (result && typeof result === 'object' && 'bookingId' in result) {
          (booking as Record<string, unknown>).bookingId = (result as { bookingId: string }).bookingId;
        }
        onSuccess();
        return;
      }
      if (paymentMethod === 'mobile_money' && !phoneNumber) {
        setError('Please enter your phone number');
        setLoading(false);
        return;
      }
      const result = await paymentService.initiatePayment({
        booking: {
          guestName: String(booking.guestName),
          guestEmail: String(booking.guestEmail),
          guestPhone: String(booking.guestPhone),
          roomId: String(booking.roomId),
          checkIn: Number(booking.checkIn),
          checkOut: Number(booking.checkOut),
          numberOfGuests: Number(booking.numberOfGuests),
          specialRequests: String(booking.specialRequests || ''),
          source: 'direct',
        },
        depositPercentage: 50,
        roomPrice: Number(booking.roomPrice),
        paymentMethod,
        mobileProvider: paymentMethod === 'mobile_money' ? mobileProvider : undefined,
        phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
      });
      const data = result as { paymentLink?: string; bookingId?: string };
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
      if (data?.bookingId) {
        (booking as Record<string, unknown>).bookingId = data.bookingId;
        onSuccess();
      } else {
        setError('Failed to start payment. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { value: 'mobile_money' as const, label: 'Mobile Money (M-Pesa, Airtel Money, Tigo Pesa)', desc: '' },
    { value: 'card' as const, label: 'Visa / Mastercard', desc: '' },
    { value: 'pay_on_arrival' as const, label: 'Pay on Arrival', desc: 'Pay when you check in (subject to approval)' },
  ];

  return (
    <form onSubmit={handlePaymentSubmit} className="card-dark p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Payment Method</h2>
        <p className="text-text-muted text-sm">Choose how you&apos;d like to pay.</p>
      </div>

      {/* Summary */}
      <div className="bg-surface-lighter rounded-2xl p-6 border border-surface-border">
        <h3 className="font-semibold text-white mb-4 text-sm font-mono">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Room</span>
            <span className="font-medium text-white">{selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Check-in</span>
            <span className="font-medium text-white">{new Date(Number(booking.checkIn)).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Check-out</span>
            <span className="font-medium text-white">{new Date(Number(booking.checkOut)).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-t border-surface-border pt-2 mt-2">
            <span className="text-white font-semibold">Total Stay Cost</span>
            <span className="font-bold text-accent">{formatCurrency(Number(booking.totalPrice), 'TZS')}</span>
          </div>
          <div className="flex justify-between bg-accent-muted -mx-2 -mb-2 mt-4 p-3 rounded-xl">
            <span className="text-accent font-semibold text-xs">50% Deposit Due Now</span>
            <span className="font-bold text-accent">{formatCurrency(depositAmount, 'TZS')}</span>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3">
        <label className="block text-xs text-text-muted font-mono mb-1">Choose Payment Method</label>
        {methods.map((method) => (
          <label
            key={method.value}
            className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
              paymentMethod === method.value
                ? 'border-accent bg-accent-muted'
                : 'border-surface-border bg-surface-lighter hover:border-surface-border/80'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={() => setPaymentMethod(method.value)}
              className="mt-1 mr-3 accent-accent"
            />
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{method.label}</p>
              {method.desc && <p className="text-xs text-text-muted mt-0.5">{method.desc}</p>}
            </div>
          </label>
        ))}

        {paymentMethod === 'mobile_money' && (
          <div className="ml-6 space-y-4 pb-2">
            <div>
              <label className="block text-xs text-text-muted font-mono mb-2">Mobile Provider</label>
              <select
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
                className="input-dark"
              >
                <option value="mtn">M-Pesa (MTN)</option>
                <option value="airtel">Airtel Money</option>
                <option value="tigo">Tigo Pesa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted font-mono mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+255..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-dark"
              />
              <p className="text-xs text-text-muted mt-1">You will receive a payment prompt on your phone</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 btn-outline justify-center"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary justify-center disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </form>
  );
}
