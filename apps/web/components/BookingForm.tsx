'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Room *</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent ${
            errors.roomId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Choose a room...</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} - {formatCurrency(room.basePrice, 'TZS')}/night
            </option>
          ))}
        </select>
        {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check In *</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
              errors.checkIn ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check Out *</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
              errors.checkOut ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
        <select
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </select>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
                errors.guestName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
                errors.guestEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.guestEmail && <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
                errors.guestPhone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +255 for Tanzania, +1 for USA)</p>
            {errors.guestPhone && <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country of Residence *</label>
              <select
                value={guestCountry}
                onChange={(e) => setGuestCountry(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
                  errors.guestCountry ? 'border-red-500' : 'border-gray-300'
                }`}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
              <input
                type="text"
                placeholder="e.g., Tanzanian, British, American"
                value={guestNationality}
                onChange={(e) => setGuestNationality(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${
                  errors.guestNationality ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.guestNationality && <p className="text-red-500 text-sm mt-1">{errors.guestNationality}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport/ID Number</label>
              <input
                type="text"
                placeholder="For international guests"
                value={passportId}
                onChange={(e) => setPassportId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              />
              <p className="text-xs text-gray-500 mt-1">Required for international guests</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Arrival Time</label>
              <select
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
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
              <p className="text-xs text-gray-500 mt-1">Standard check-in: 2PM, check-out: 11AM</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              placeholder="Airport pickup, dietary requirements, early check-in, late check-out, etc."
            />
          </div>
        </div>
      </div>

      {selectedRoom && checkIn && checkOut && (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{selectedRoom.name}</span>
              <span className="font-medium">{formatCurrency(selectedRoom.basePrice, 'TZS')}/night</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span className="font-medium">{formatCurrency(totalPrice, 'TZS')}</span>
            </div>
          </div>
          <div className="border-t border-green-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-700">{formatCurrency(totalPrice, 'TZS')}</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">* 50% deposit required to confirm booking</p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errors.submit}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </motion.form>
  );
}
