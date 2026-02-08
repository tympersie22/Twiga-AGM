'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import PaymentForm from '@/components/PaymentForm';
import type { TwigaRoom } from '@twiga/shared/types';
import { formatCurrency, formatDate } from '@twiga/shared/utils/formatting';
import { fetchRooms } from '@/lib/data';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  const selectedRoomData = bookingData ? rooms.find((r) => r.id === bookingData.roomId) : null;

  const steps = ['details', 'payment', 'confirmation'] as const;
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6 transition">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  steps.indexOf(step) >= i ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                <div className="mb-2">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      steps.indexOf(step) > i
                        ? 'border-green-700 bg-green-700 text-white'
                        : steps.indexOf(step) === i
                        ? 'border-green-700 bg-green-700 text-white'
                        : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {steps.indexOf(step) > i ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium capitalize">{s}</p>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full mx-8">
            <div
              className="absolute h-1 bg-green-700 rounded-full transition-all duration-500"
              style={{ width: `${(steps.indexOf(step) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
            <motion.div
              className="bg-white rounded-lg shadow p-8 text-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-8">
                A confirmation email has been sent to {String(bookingData?.guestEmail)}
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                <p className="text-2xl font-mono font-bold text-green-700 mb-4">{String(bookingData?.bookingId || 'BK-XXXXXX')}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guest</span>
                    <span className="font-medium text-gray-900">{String(bookingData?.guestName)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-medium text-gray-900">{selectedRoomData?.name || String(bookingData?.roomId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium text-gray-900">{formatDate(Number(bookingData?.checkIn))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium text-gray-900">{formatDate(Number(bookingData?.checkOut))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nights</span>
                    <span className="font-medium text-gray-900">{String(bookingData?.nights)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-green-700">{formatCurrency(Number(bookingData?.totalPrice), 'TZS')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/255XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
                >
                  Chat on WhatsApp
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center border-2 border-green-700 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
