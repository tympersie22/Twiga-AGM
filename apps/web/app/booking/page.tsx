'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, MessageCircle } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import PaymentForm from '@/components/PaymentForm';
import type { TwigaRoom } from '@twiga/shared/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type BookingStep = 'details' | 'payment' | 'confirmation';

const stepLabels = {
  details: 'Guest Details',
  payment: 'Payment',
  confirmation: 'Confirmation',
};

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
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-charcoal/60 font-medium">Loading your booking...</p>
      </div>
    );
  }

  const steps = ['details', 'payment', 'confirmation'] as const;
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-warm-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center">
                <span className="font-serif text-xl text-white">T</span>
              </div>
              <span className="font-serif text-xl text-charcoal tracking-wide">Twiga Residence</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-charcoal/60 hover:text-gold transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-warm-gray py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: currentStepIndex === i ? 1.1 : 1,
                      backgroundColor: currentStepIndex >= i ? '#A18A6B' : '#E2DFDB',
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      currentStepIndex > i ? 'bg-gold' : currentStepIndex === i ? 'bg-gold' : 'bg-warm-gray'
                    }`}
                  >
                    {currentStepIndex > i ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`font-serif text-lg ${currentStepIndex >= i ? 'text-white' : 'text-charcoal/40'}`}>
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                  <p className={`text-sm mt-2 font-medium transition-colors duration-300 ${
                    currentStepIndex >= i ? 'text-charcoal' : 'text-charcoal/40'
                  }`}>
                    {stepLabels[s]}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-20 sm:w-32 h-0.5 mx-4 transition-colors duration-500 ${
                    currentStepIndex > i ? 'bg-gold' : 'bg-warm-gray'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          >
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
                className="bg-white rounded-sm shadow-lg overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              >
                {/* Success Header */}
                <div className="bg-gold/10 px-8 py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3">Booking Confirmed!</h2>
                  <p className="text-charcoal/60 text-lg">
                    Thank you for choosing Twiga Residence
                  </p>
                </div>

                {/* Booking Details */}
                <div className="p-8">
                  <div className="bg-cream rounded-lg p-6 mb-8">
                    <p className="text-sm text-charcoal/60 uppercase tracking-wider mb-2">Booking Reference</p>
                    <p className="text-3xl font-serif text-gold">{String(bookingData?.bookingId || 'TWG-XXXXXX')}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-warm-gray">
                      <span className="text-charcoal/60">Guest Name</span>
                      <span className="font-medium text-charcoal">{String(bookingData?.guestName)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-warm-gray">
                      <span className="text-charcoal/60">Email</span>
                      <span className="font-medium text-charcoal">{String(bookingData?.guestEmail)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-warm-gray">
                      <span className="text-charcoal/60">Check-in</span>
                      <span className="font-medium text-charcoal">
                        {new Date(Number(bookingData?.checkIn)).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-warm-gray">
                      <span className="text-charcoal/60">Check-out</span>
                      <span className="font-medium text-charcoal">
                        {new Date(Number(bookingData?.checkOut)).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-charcoal/60 text-center mb-8">
                    A confirmation email has been sent to <span className="text-charcoal font-medium">{String(bookingData?.guestEmail)}</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://wa.me/255XXXXXXXXX?text=Hello! I just made a booking at Twiga Residence."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                    <Link href="/" className="flex-1 btn-outline text-center">
                      Back to Home
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Twiga Residence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
