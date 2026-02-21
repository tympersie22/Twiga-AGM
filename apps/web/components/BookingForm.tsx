'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { TwigaRoom } from '@/lib/shared/types';
import {
  validateBookingDates,
  validateEmail,
  validateTanzanianPhone,
  formatCurrency,
  calculateNights,
} from '@/lib/shared';

interface BookingFormProps {
  rooms: TwigaRoom[];
  selectedRoomId: string | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function BookingForm({
  rooms,
  selectedRoomId,
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = '1',
  onSubmit,
}: BookingFormProps) {
  const [roomId, setRoomId] = useState(selectedRoomId || '');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [numberOfGuests, setNumberOfGuests] = useState(initialGuests);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRoomId) setRoomId(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    if (initialCheckIn) setCheckIn(initialCheckIn);
  }, [initialCheckIn]);

  useEffect(() => {
    if (initialCheckOut) setCheckOut(initialCheckOut);
  }, [initialCheckOut]);

  useEffect(() => {
    if (initialGuests) setNumberOfGuests(initialGuests);
  }, [initialGuests]);

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const nights =
    checkIn && checkOut ? calculateNights(new Date(checkIn).getTime(), new Date(checkOut).getTime()) : 0;
  const totalPrice = selectedRoom ? selectedRoom.basePrice * nights : 0;
  const minCheckIn = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!roomId) newErrors.roomId = 'Select a room';
    if (!checkIn) newErrors.checkIn = 'Required';
    if (!checkOut) newErrors.checkOut = 'Required';
    if (checkIn && checkOut) {
      const dateValidation = validateBookingDates(
        new Date(checkIn).getTime(),
        new Date(checkOut).getTime()
      );
      if (!dateValidation.valid) newErrors.dates = dateValidation.error || '';
    }
    if (!guestName) newErrors.guestName = 'Required';
    if (!guestEmail || !validateEmail(guestEmail)) newErrors.guestEmail = 'Valid email required';
    if (!guestPhone || !validateTanzanianPhone(guestPhone)) {
      newErrors.guestPhone = 'Valid +255 number required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      onSubmit({
        roomId,
        checkIn: new Date(checkIn).getTime(),
        checkOut: new Date(checkOut).getTime(),
        numberOfGuests: parseInt(numberOfGuests, 10),
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        roomPrice: selectedRoom!.basePrice,
        totalPrice,
        nights,
      });
    } catch {
      setErrors({ submit: 'Failed to process booking' });
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (f: string) => errors[f] ? 'border-red-500/40' : 'border-surface-border/40';

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Card 1 — Stay Details */}
      <div className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Stay Details</p>
        </div>

        {/* Apple-style grouped list */}
        <div className="mx-4 mb-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15">
          {/* Room */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Room</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className={`flex-1 bg-transparent text-right text-sm text-white appearance-none outline-none cursor-pointer pr-5 ${fieldErr('roomId')}`}
              >
                <option value="">Select...</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — {formatCurrency(room.basePrice, 'TZS')}/night
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
            {errors.roomId && <p className="text-red-400 text-xs px-4 pb-2">{errors.roomId}</p>}
          </div>

          {/* Check In */}
          <div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Check In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={minCheckIn}
                className="flex-1 bg-transparent text-right text-sm text-white outline-none"
              />
            </div>
            {errors.checkIn && <p className="text-red-400 text-xs px-4 pb-2">{errors.checkIn}</p>}
          </div>

          {/* Check Out */}
          <div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Check Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || minCheckIn}
                className="flex-1 bg-transparent text-right text-sm text-white outline-none"
              />
            </div>
            {errors.checkOut && <p className="text-red-400 text-xs px-4 pb-2">{errors.checkOut}</p>}
          </div>

          {/* Guests */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Guests</label>
              <select
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="flex-1 bg-transparent text-right text-sm text-white appearance-none outline-none cursor-pointer pr-5"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {errors.dates && (
          <p className="text-red-400 text-xs mx-4 mb-3 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">{errors.dates}</p>
        )}
      </div>

      {/* Card 2 — Guest Info */}
      <div className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Guest Information</p>
        </div>

        <div className="mx-4 mb-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15">
          {/* Name */}
          <div>
            <div className="flex items-center px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted/40 outline-none text-right"
              />
            </div>
            {errors.guestName && <p className="text-red-400 text-xs px-4 pb-2">{errors.guestName}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted/40 outline-none text-right"
              />
            </div>
            {errors.guestEmail && <p className="text-red-400 text-xs px-4 pb-2">{errors.guestEmail}</p>}
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20">Phone</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted/40 outline-none text-right"
              />
            </div>
            {errors.guestPhone && <p className="text-red-400 text-xs px-4 pb-2">{errors.guestPhone}</p>}
          </div>

          {/* Special Requests */}
          <div>
            <div className="flex items-start px-4 py-2.5">
              <label className="text-sm text-text-muted shrink-0 w-20 pt-0.5">Notes</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted/40 outline-none text-right resize-none"
                placeholder="Special requests..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price summary */}
      {selectedRoom && checkIn && checkOut && nights > 0 && (
        <motion.div
          className="bg-surface-light/60 backdrop-blur-2xl border border-surface-border/30 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mx-4 my-4 bg-surface-lighter/30 rounded-xl border border-surface-border/20 overflow-hidden divide-y divide-surface-border/15">
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-sm text-text-muted">{selectedRoom.name}</span>
              <span className="text-sm text-white">{formatCurrency(selectedRoom.basePrice, 'TZS')}/night</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-sm text-text-muted">{nights} night{nights > 1 ? 's' : ''}</span>
              <span className="text-sm text-white">{formatCurrency(totalPrice, 'TZS')}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-accent/5">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-lg font-bold text-accent">{formatCurrency(totalPrice, 'TZS')}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted text-center pb-3">50% deposit required to confirm</p>
        </motion.div>
      )}

      {errors.submit && (
        <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-surface-dark font-semibold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-surface-dark border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          'Continue to Payment'
        )}
      </button>
    </motion.form>
  );
}
