'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BookingForm from '@/components/BookingForm';
import PaymentForm from '@/components/PaymentForm';
import Container from '@/components/ui/Container';
import type { TwigaRoom } from '@twiga/shared/types';
import { formatCurrency, formatDate } from '@twiga/shared/utils/formatting';
import { fetchRooms } from '@/lib/data';
import { ArrowLeft, Check, ClipboardList, CreditCard, PartyPopper, Copy } from 'lucide-react';
import { contactHref } from '@/lib/site-config';

type BookingStep = 'details' | 'payment' | 'confirmation';

const stepMeta = [
  { key: 'details', label: 'Details', icon: ClipboardList },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirmation', label: 'Confirmed', icon: PartyPopper },
] as const;

const toDateInputValue = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<BookingStep>('details');
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [initialCheckIn, setInitialCheckIn] = useState('');
  const [initialCheckOut, setInitialCheckOut] = useState('');
  const [initialGuests, setInitialGuests] = useState('1');
  const [bookingData, setBookingData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
        const roomId = searchParams.get('roomId');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = searchParams.get('guests');
        if (roomId) setSelectedRoom(roomId);
        if (checkIn && !Number.isNaN(Number(checkIn))) {
          setInitialCheckIn(toDateInputValue(Number(checkIn)));
        }
        if (checkOut && !Number.isNaN(Number(checkOut))) {
          setInitialCheckOut(toDateInputValue(Number(checkOut)));
        }
        if (guests && !Number.isNaN(Number(guests))) {
          setInitialGuests(String(Math.max(1, Number(guests))));
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [searchParams]);

  const handleDetailsSubmit = (data: Record<string, unknown>) => {
    setBookingData(data);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = () => {
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyBookingId = () => {
    const id = String(bookingData?.bookingId || 'BK-XXXXXX');
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedRoomData = bookingData ? rooms.find((r) => r.id === bookingData.roomId) : null;
  const currentStepIndex = stepMeta.findIndex((s) => s.key === step);
  const paymentStatus = String(bookingData?.paymentStatus || '');
  const isPaymentPending = paymentStatus === 'payment_pending';
  const isPayOnArrival = paymentStatus === 'pending_approval';

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container className="max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Apple-style stepper — minimal dots + label */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {stepMeta.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStepIndex > i
                      ? 'bg-accent text-surface-dark'
                      : currentStepIndex === i
                      ? 'bg-accent text-surface-dark shadow-md shadow-accent/25'
                      : 'bg-surface-lighter/60 text-text-muted'
                  }`}
                >
                  {currentStepIndex > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStepIndex >= i ? 'text-white' : 'text-text-muted/60'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < stepMeta.length - 1 && (
                <div className={`w-10 h-px transition-all duration-500 ${
                  currentStepIndex > i ? 'bg-accent' : 'bg-surface-border/30'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <BookingForm
                rooms={rooms}
                selectedRoomId={selectedRoom}
                initialCheckIn={initialCheckIn}
                initialCheckOut={initialCheckOut}
                initialGuests={initialGuests}
                onSubmit={handleDetailsSubmit}
              />
            </motion.div>
          )}
          {step === 'payment' && bookingData && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <PaymentForm
                booking={bookingData}
                rooms={rooms}
                onSuccess={handlePaymentSuccess}
                onBack={() => { setStep('details'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </motion.div>
          )}
          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            >
              <div className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                {/* Success header */}
                <div className="px-6 pt-8 pb-5 text-center">
                  <motion.div
                    className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                  >
                    <Check className="w-7 h-7 text-green-400" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {isPaymentPending ? 'Booking Received' : isPayOnArrival ? 'Booking Reserved' : 'Booking Confirmed'}
                  </h2>
                  <p className="text-text-muted text-sm">
                    {isPaymentPending
                      ? 'We will confirm your payment shortly.'
                      : isPayOnArrival
                      ? 'Your reservation is saved. Please pay at check-in.'
                      : `Confirmation sent to ${String(bookingData?.guestEmail)}`}
                  </p>
                </div>

                {/* Details card */}
                <motion.div
                  className="mx-5 mb-5 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {/* Ref row */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border/15">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Reference</p>
                      <p className="text-base font-mono font-bold text-accent">
                        {String(bookingData?.bookingId || 'BK-XXXXXX')}
                      </p>
                    </div>
                    <button
                      onClick={copyBookingId}
                      className="text-text-muted hover:text-accent transition p-1.5 rounded-lg hover:bg-white/5"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Info rows — Apple list style */}
                  <div className="divide-y divide-surface-border/15">
                    {[
                      ['Guest', String(bookingData?.guestName)],
                      ['Room', selectedRoomData?.name || String(bookingData?.roomId)],
                      ['Check-in', formatDate(Number(bookingData?.checkIn))],
                      ['Check-out', formatDate(Number(bookingData?.checkOut))],
                      ['Nights', String(bookingData?.nights)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-text-muted text-sm">{label}</span>
                        <span className="text-white text-sm font-medium">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 bg-accent/5">
                      <span className="text-white text-sm font-semibold">Total</span>
                      <span className="text-accent text-base font-bold">
                        {formatCurrency(Number(bookingData?.totalPrice), 'TZS')}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  className="px-5 pb-6 flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <a
                    href={contactHref.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] text-center"
                  >
                    WhatsApp Us
                  </a>
                  <Link
                    href="/"
                    className="flex-1 border border-surface-border/40 text-text-secondary hover:text-white py-2.5 rounded-xl text-sm transition-all hover:border-surface-border active:scale-[0.98] text-center"
                  >
                    Home
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
