'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building, ArrowLeft, Shield, Lock } from 'lucide-react';
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

const paymentMethods = [
  {
    id: 'mobile_money' as const,
    title: 'Mobile Money',
    description: 'M-Pesa, Airtel Money, Tigo Pesa',
    icon: Smartphone,
    recommended: true,
  },
  {
    id: 'card' as const,
    title: 'Credit/Debit Card',
    description: 'Visa, Mastercard',
    icon: CreditCard,
  },
  {
    id: 'pay_on_arrival' as const,
    title: 'Pay on Arrival',
    description: 'Pay when you check in (subject to approval)',
    icon: Building,
  },
];

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

  const inputClass = (hasError: boolean = false) =>
    `w-full px-4 py-3 border rounded-sm bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold ${
      hasError ? 'border-red-400' : 'border-warm-gray hover:border-gold/50'
    }`;

  return (
    <motion.form
      onSubmit={handlePaymentSubmit}
      className="bg-white rounded-sm shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Header */}
      <div className="bg-charcoal px-8 py-6">
        <h2 className="font-serif text-2xl md:text-3xl text-white">Secure Payment</h2>
        <p className="text-white/60 mt-1">Choose your preferred payment method</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Booking Summary */}
        <div className="bg-cream rounded-sm p-6">
          <h3 className="font-serif text-lg text-charcoal mb-4">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/60">Guest</span>
              <span className="font-medium text-charcoal">{String(booking.guestName)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Room</span>
              <span className="font-medium text-charcoal">{selectedRoom?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Check-in</span>
              <span className="font-medium text-charcoal">
                {new Date(Number(booking.checkIn)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Check-out</span>
              <span className="font-medium text-charcoal">
                {new Date(Number(booking.checkOut)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Guests</span>
              <span className="font-medium text-charcoal">
                {String(booking.numberOfGuests)} {Number(booking.numberOfGuests) === 1 ? 'guest' : 'guests'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Duration</span>
              <span className="font-medium text-charcoal">
                {String(booking.nights)} {Number(booking.nights) === 1 ? 'night' : 'nights'}
              </span>
            </div>

            <div className="border-t border-gold/20 pt-3 mt-3">
              <div className="flex justify-between mb-2">
                <span className="text-charcoal/60">Total Stay Cost</span>
                <span className="font-medium text-charcoal">{formatCurrency(Number(booking.totalPrice), 'TZS')}</span>
              </div>
              <div className="flex justify-between bg-gold/10 -mx-2 px-2 py-3 rounded">
                <span className="font-semibold text-charcoal">50% Deposit Due Now</span>
                <span className="text-xl font-serif text-gold">{formatCurrency(depositAmount, 'TZS')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-serif text-lg text-charcoal mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <motion.label
                  key={method.id}
                  className={`flex items-start p-4 border-2 rounded-sm cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-gold bg-gold/5'
                      : 'border-warm-gray hover:border-gold/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-gold' : 'bg-warm-gray'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-charcoal/60'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isSelected ? 'text-charcoal' : 'text-charcoal/80'}`}>
                        {method.title}
                      </p>
                      {method.recommended && (
                        <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-charcoal/60">{method.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-gold' : 'border-warm-gray'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                  </div>
                </motion.label>
              );
            })}
          </div>
        </div>

        {/* Mobile Money Options */}
        {paymentMethod === 'mobile_money' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pl-4 border-l-2 border-gold/30"
          >
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Mobile Provider</label>
              <select
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
                className={inputClass()}
              >
                <option value="mtn">M-Pesa (Vodacom)</option>
                <option value="airtel">Airtel Money</option>
                <option value="tigo">Tigo Pesa</option>
                <option value="halopesa">HaloPesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass()}
              />
              <p className="text-xs text-charcoal/50 mt-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                You will receive a payment prompt on this number
              </p>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <div className="flex items-start gap-3 bg-charcoal/5 rounded-sm p-4">
          <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-charcoal">Secure Payment</p>
            <p className="text-xs text-charcoal/60">
              Your payment is processed securely through Flutterwave. We never store your card details.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-4 border-2 border-warm-gray rounded-sm font-medium text-charcoal hover:border-gold/50 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay {formatCurrency(depositAmount, 'TZS')}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
