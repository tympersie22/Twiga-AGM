'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <motion.form
      onSubmit={handlePaymentSubmit}
      className="bg-white rounded-lg shadow p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room</span>
            <span className="font-medium">{selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in</span>
            <span className="font-medium">{new Date(Number(booking.checkIn)).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out</span>
            <span className="font-medium">{new Date(Number(booking.checkOut)).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-900 font-semibold">Total Stay Cost</span>
            <span className="font-bold text-green-700">{formatCurrency(Number(booking.totalPrice), 'TZS')}</span>
          </div>
          <div className="flex justify-between bg-green-50 -mx-2 -mb-2 mt-4 p-2 rounded">
            <span className="text-green-900 font-semibold">50% Deposit Due Now</span>
            <span className="font-bold text-green-700">{formatCurrency(depositAmount, 'TZS')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Choose Payment Method</label>
        {(['mobile_money', 'card', 'pay_on_arrival'] as const).map((method) => (
          <label
            key={method}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              paymentMethod === method ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {method === 'mobile_money' && 'Mobile Money (M-Pesa, Airtel Money, Tigo Pesa)'}
                {method === 'card' && 'Visa / Mastercard'}
                {method === 'pay_on_arrival' && 'Pay on Arrival'}
              </p>
              <p className="text-sm text-gray-600">
                {method === 'pay_on_arrival' && 'Pay when you check in (subject to approval)'}
              </p>
            </div>
          </label>
        ))}
        {paymentMethod === 'mobile_money' && (
          <div className="ml-6 space-y-4 pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Provider</label>
              <select
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              >
                <option value="mtn">M-Pesa (MTN)</option>
                <option value="airtel">Airtel Money</option>
                <option value="tigo">Tigo Pesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+255..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              />
              <p className="text-xs text-gray-500 mt-1">You will receive a payment prompt on your phone</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </motion.form>
  );
}
