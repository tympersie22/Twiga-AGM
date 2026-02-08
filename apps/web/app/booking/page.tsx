'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import PaymentForm from '@/components/PaymentForm';
import Container from '@/components/ui/Container';
import type { TwigaRoom } from '@twiga/shared/types';
import { formatCurrency, formatDate } from '@twiga/shared/utils/formatting';
import { fetchRooms } from '@/lib/data';
import { ArrowLeft, CheckCircle } from 'lucide-react';

type BookingStep = 'details' | 'payment' | 'confirmation';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<BookingStep>('details');
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
        const roomId = searchParams.get('roomId');
        if (roomId) setSelectedRoom(roomId);
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
  };

  const handlePaymentSuccess = () => {
    setStep('confirmation');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading booking...</p>
        </div>
      </div>
    );
  }

  const selectedRoomData = bookingData ? rooms.find((r) => r.id === bookingData.roomId) : null;
  const steps = ['details', 'payment', 'confirmation'] as const;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container className="max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  steps.indexOf(step) >= i ? 'text-accent' : 'text-text-muted'
                }`}
              >
                <div className="mb-2">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      steps.indexOf(step) > i
                        ? 'border-accent bg-accent text-surface-dark'
                        : steps.indexOf(step) === i
                        ? 'border-accent bg-accent text-surface-dark'
                        : 'border-surface-border bg-surface-light text-text-muted'
                    }`}
                  >
                    {steps.indexOf(step) > i ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-mono text-sm">{i + 1}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium capitalize">{s}</p>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-surface-lighter rounded-full mx-8">
            <div
              className="absolute h-1 bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(steps.indexOf(step) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div key={step}>
          {step === 'details' && (
            <BookingForm
              rooms={rooms}
              selectedRoomId={selectedRoom}
              onSubmit={handleDetailsSubmit}
            />
          )}
          {step === 'payment' && bookingData && (
            <PaymentForm
              booking={bookingData}
              rooms={rooms}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep('details')}
            />
          )}
          {step === 'confirmation' && (
            <div className="card-dark p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <p className="text-text-secondary mb-8">
                A confirmation email has been sent to {String(bookingData?.guestEmail)}
              </p>

              <div className="bg-surface-lighter rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border border-surface-border">
                <p className="text-xs text-text-muted font-mono mb-1">Booking Reference</p>
                <p className="text-2xl font-mono font-bold text-accent mb-4">
                  {String(bookingData?.bookingId || 'BK-XXXXXX')}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Guest</span>
                    <span className="font-medium text-white">{String(bookingData?.guestName)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Room</span>
                    <span className="font-medium text-white">
                      {selectedRoomData?.name || String(bookingData?.roomId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Check-in</span>
                    <span className="font-medium text-white">
                      {formatDate(Number(bookingData?.checkIn))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Check-out</span>
                    <span className="font-medium text-white">
                      {formatDate(Number(bookingData?.checkOut))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Nights</span>
                    <span className="font-medium text-white">
                      {String(bookingData?.nights)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-surface-border pt-3">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-bold text-accent">
                      {formatCurrency(Number(bookingData?.totalPrice), 'TZS')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/255000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Chat on WhatsApp
                </a>
                <Link href="/" className="btn-outline">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
