'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import type { TwigaBooking } from '@twiga/shared/types';
import { formatCurrency, formatDate } from '@twiga/shared/utils/formatting';

export default function RecentBookings() {
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(
          db,
          'companies',
          'twiga-agm',
          'properties',
          'twiga-residence',
          'bookings'
        );
        const q = query(bookingsRef, limit(5));
        const snapshot = await getDocs(q);
        setBookings(snapshot.docs.map((doc) => doc.data() as TwigaBooking));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-700">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Guest</th>
            <th className="text-left py-3 px-4 font-semibold">Room</th>
            <th className="text-left py-3 px-4 font-semibold">Check In</th>
            <th className="text-left py-3 px-4 font-semibold">Amount</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
              <td className="py-3 px-4">{booking.guestName}</td>
              <td className="py-3 px-4">{booking.roomId}</td>
              <td className="py-3 px-4">{formatDate(booking.checkIn)}</td>
              <td className="py-3 px-4 font-semibold">{formatCurrency(booking.totalPrice, 'TZS')}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending_payment'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
