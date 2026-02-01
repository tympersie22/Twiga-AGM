'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import BookingForm from '@/components/BookingForm';
import PaymentForm from '@/components/PaymentForm';
import type { TwigaRoom } from '@twiga/shared/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type BookingStep = 'details' | 'payment' | 'confirmation';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<BookingStep>('details');
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, 'companies', 'twiga-agm', 'properties', 'twiga-residence', 'rooms');
        const snapshot = await getDocs(roomsRef);
        setRooms(snapshot.docs.map((doc) => doc.data() as TwigaRoom));
        const roomId = searchParams.get('roomId');
        if (roomId) setSelectedRoom(roomId);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [searchParams]);

  const handleDetailsSubmit = (data: Record<string, unknown>) => {
    setBookingData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('confirmation');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const steps = ['details', 'payment', 'confirmation'] as const;
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
                      steps.indexOf(step) >= i ? 'border-green-700 bg-green-700 text-white' : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>
                <p className="text-sm font-medium capitalize">{s}</p>
              </div>
            ))}
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to {String(bookingData?.guestEmail)}
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
                <p className="text-2xl font-mono font-bold text-green-700">{String(bookingData?.bookingId || '—')}</p>
              </div>
              <a
                href="https://wa.me/255XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
