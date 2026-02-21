'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Wallet, ChevronDown, Shield } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared/formatting';
import { paymentService } from '@/lib/payment-service';
import type { TwigaRoom } from '@/lib/shared/types';

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
          (booking as Record<string, unknown>).paymentStatus =
            (result as { status?: string }).status || 'pending_approval';
        }
        onSuccess();
        return;
      }
      if (paymentMethod === 'mobile_money' && !phoneNumber) {
        setError('Enter your phone number');
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
        (booking as Record<string, unknown>).paymentStatus =
          (result as { status?: string }).status || 'payment_pending';
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
    { value: 'mobile_money' as const, label: 'Mobile Money', desc: 'M-Pesa, Airtel, Tigo', icon: Smartphone },
    { value: 'card' as const, label: 'Card', desc: 'Visa / Mastercard', icon: CreditCard },
    { value: 'pay_on_arrival' as const, label: 'Pay on Arrival', desc: 'At check-in', icon: Wallet },
  ];

  return (
    <motion.form
      onSubmit={handlePaymentSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Card 1 — Summary */}
      <div className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Summary</p>
          <p className="text-xs text-text-muted">{String(booking.guestName)}</p>
        </div>

        <div className="mx-4 mb-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15">
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm text-text-muted">Room</span>
            <span className="text-sm text-white font-medium">{selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm text-text-muted">Check In</span>
            <span className="text-sm text-white font-medium">{formatDate(Number(booking.checkIn))}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm text-text-muted">Check Out</span>
            <span className="text-sm text-white font-medium">{formatDate(Number(booking.checkOut))}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm text-text-muted">Nights</span>
            <span className="text-sm text-white font-medium">{String(booking.nights)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm text-text-muted">Total</span>
            <span className="text-sm text-white">{formatCurrency(Number(booking.totalPrice), 'TZS')}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-accent/5">
            <span className="text-sm font-semibold text-white">Deposit (50%)</span>
            <span className="text-base font-bold text-accent">{formatCurrency(depositAmount, 'TZS')}</span>
          </div>
        </div>
      </div>

      {/* Card 2 — Payment Method */}
      <div className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Payment Method</p>
        </div>

        <div className="mx-4 mb-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15">
          {methods.map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                paymentMethod === method.value ? 'bg-accent/5' : 'hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={() => setPaymentMethod(method.value)}
                className="hidden"
              />
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                paymentMethod === method.value ? 'bg-accent/15 text-accent' : 'bg-surface-lighter/40 text-text-muted'
              }`}>
                <method.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${paymentMethod === method.value ? 'text-white' : 'text-text-secondary'}`}>{method.label}</p>
                <p className="text-xs text-text-muted">{method.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                paymentMethod === method.value ? 'border-accent bg-accent' : 'border-surface-border/60'
              }`}>
                {paymentMethod === method.value && (
                  <div className="w-2 h-2 bg-surface-dark rounded-full" />
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Mobile money fields */}
        <AnimatePresence>
          {paymentMethod === 'mobile_money' && (
            <motion.div
              className="mx-4 mb-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="flex items-center px-4 py-2.5">
                  <label className="text-sm text-text-muted shrink-0 w-20">Provider</label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    className="flex-1 bg-transparent text-right text-sm text-white appearance-none outline-none cursor-pointer pr-5"
                  >
                    <option value="mtn">M-Pesa (MTN)</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="tigo">Tigo Pesa</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center px-4 py-2.5">
                  <label className="text-sm text-text-muted shrink-0 w-20">Phone</label>
                  <input
                    type="tel"
                    placeholder="+255 7XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-transparent text-right text-sm text-white placeholder-text-muted/40 outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          className="text-red-400 text-sm bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <Shield className="w-3.5 h-3.5 text-green-400" />
        <span>Secured via Flutterwave</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-surface-border/40 text-text-secondary hover:text-white py-3 rounded-xl text-sm transition-all hover:border-surface-border active:scale-[0.98]"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-accent hover:bg-accent/90 text-surface-dark font-semibold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-surface-dark border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            paymentMethod === 'pay_on_arrival' ? 'Confirm Booking' : 'Pay Now'
          )}
        </button>
      </div>
    </motion.form>
  );
}
