'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, User, Mail, Phone, Globe, FileText, Clock } from 'lucide-react';
import type { TwigaRoom } from '@twiga/shared/types';
import {
  validateBookingDates,
  validateEmail,
  validateInternationalPhone,
  formatCurrency,
  calculateNights,
} from '@twiga/shared';

interface BookingFormProps {
  rooms: TwigaRoom[];
  selectedRoomId: string | null;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function BookingForm({ rooms, selectedRoomId, onSubmit }: BookingFormProps) {
  const [roomId, setRoomId] = useState(selectedRoomId || '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState('1');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [guestNationality, setGuestNationality] = useState('');
  const [passportId, setPassportId] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const nights =
    checkIn && checkOut ? calculateNights(new Date(checkIn).getTime(), new Date(checkOut).getTime()) : 0;
  const totalPrice = selectedRoom ? selectedRoom.basePrice * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!roomId) newErrors.roomId = 'Please select a room';
    if (!checkIn) newErrors.checkIn = 'Please select check-in date';
    if (!checkOut) newErrors.checkOut = 'Please select check-out date';
    const dateValidation = validateBookingDates(
      new Date(checkIn).getTime(),
      new Date(checkOut).getTime()
    );
    if (!dateValidation.valid) newErrors.dates = dateValidation.error || '';
    if (!guestName) newErrors.guestName = 'Please enter your name';
    if (!guestEmail || !validateEmail(guestEmail)) newErrors.guestEmail = 'Please enter a valid email';
    if (!guestPhone || !validateInternationalPhone(guestPhone)) {
      newErrors.guestPhone = 'Please enter a valid phone number with country code (e.g., +255...)';
    }
    if (!guestCountry) newErrors.guestCountry = 'Please select your country';
    if (!guestNationality) newErrors.guestNationality = 'Please enter your nationality';
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
        guestCountry,
        guestNationality,
        passportId: passportId || undefined,
        estimatedArrival: estimatedArrival || undefined,
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

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-sm bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold ${
      hasError ? 'border-red-400' : 'border-warm-gray hover:border-gold/50'
    }`;

  const labelClass = 'block text-sm font-medium text-charcoal mb-2';

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-sm shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Header */}
      <div className="bg-charcoal px-8 py-6">
        <h2 className="font-serif text-2xl md:text-3xl text-white">Book Your Stay</h2>
        <p className="text-white/60 mt-1">Fill in your details to reserve your room</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Room Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-charcoal">Select Your Room</h3>
          </div>

          <div>
            <label className={labelClass}>Room Type *</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={inputClass(!!errors.roomId)}
            >
              <option value="">Choose a room...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} — {formatCurrency(room.basePrice, 'TZS')}/night
                </option>
              ))}
            </select>
            {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Check-in Date *</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className={inputClass(!!errors.checkIn)}
              />
              {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
            </div>
            <div>
              <label className={labelClass}>Check-out Date *</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className={inputClass(!!errors.checkOut)}
              />
              {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
            </div>
          </div>
          {errors.dates && <p className="text-red-500 text-sm mt-2">{errors.dates}</p>}

          <div className="mt-4">
            <label className={labelClass}>Number of Guests *</label>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              <select
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className={`${inputClass(false)} max-w-[150px]`}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-warm-gray" />

        {/* Guest Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-charcoal">Guest Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-charcoal/40" />
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={inputClass(!!errors.guestName)}
              />
              {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-charcoal/40" />
                    Email Address *
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={inputClass(!!errors.guestEmail)}
                />
                {errors.guestEmail && <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-charcoal/40" />
                    Phone Number *
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="+255 XXX XXX XXX"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className={inputClass(!!errors.guestPhone)}
                />
                <p className="text-xs text-charcoal/50 mt-1">Include country code (e.g., +255, +1, +44)</p>
                {errors.guestPhone && <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-charcoal/40" />
                    Country of Residence *
                  </span>
                </label>
                <select
                  value={guestCountry}
                  onChange={(e) => setGuestCountry(e.target.value)}
                  className={inputClass(!!errors.guestCountry)}
                >
                  <option value="">Select country...</option>
                  <option value="TZ">Tanzania</option>
                  <option value="KE">Kenya</option>
                  <option value="UG">Uganda</option>
                  <option value="RW">Rwanda</option>
                  <option value="ZA">South Africa</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="CH">Switzerland</option>
                  <option value="AT">Austria</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="CA">Canada</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="IN">India</option>
                  <option value="CN">China</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="SG">Singapore</option>
                  <option value="MY">Malaysia</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.guestCountry && <p className="text-red-500 text-sm mt-1">{errors.guestCountry}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-charcoal/40" />
                    Nationality *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tanzanian, British, American"
                  value={guestNationality}
                  onChange={(e) => setGuestNationality(e.target.value)}
                  className={inputClass(!!errors.guestNationality)}
                />
                {errors.guestNationality && <p className="text-red-500 text-sm mt-1">{errors.guestNationality}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-charcoal/40" />
                    Passport/ID Number
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="For international guests"
                  value={passportId}
                  onChange={(e) => setPassportId(e.target.value)}
                  className={inputClass(false)}
                />
                <p className="text-xs text-charcoal/50 mt-1">Recommended for international guests</p>
              </div>
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-charcoal/40" />
                    Estimated Arrival Time
                  </span>
                </label>
                <select
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                  className={inputClass(false)}
                >
                  <option value="">Select time...</option>
                  <option value="early_morning">Early Morning (6AM - 9AM)</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 3PM)</option>
                  <option value="late_afternoon">Late Afternoon (3PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 9PM)</option>
                  <option value="night">Night (9PM - 12AM)</option>
                  <option value="late_night">Late Night (After 12AM)</option>
                </select>
                <p className="text-xs text-charcoal/50 mt-1">Check-in: 2PM | Check-out: 11AM</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Special Requests</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={4}
                className={inputClass(false)}
                placeholder="Airport pickup, dietary requirements, early check-in, late check-out, etc."
              />
            </div>
          </div>
        </section>

        {/* Price Summary */}
        {selectedRoom && checkIn && checkOut && nights > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream rounded-sm p-6 border border-gold/20"
          >
            <h4 className="font-serif text-lg text-charcoal mb-4">Price Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/60">{selectedRoom.name}</span>
                <span className="text-charcoal">{formatCurrency(selectedRoom.basePrice, 'TZS')}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="text-charcoal">× {nights}</span>
              </div>
              <div className="border-t border-gold/20 pt-3 flex justify-between">
                <span className="font-semibold text-charcoal">Total</span>
                <span className="text-2xl font-serif text-gold">{formatCurrency(totalPrice, 'TZS')}</span>
              </div>
              <p className="text-xs text-charcoal/50 text-right">* 50% deposit required to confirm booking</p>
            </div>
          </motion.div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
            {errors.submit}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            'Continue to Payment'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
