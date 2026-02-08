'use client';

import type { TwigaBooking, TwigaRoom } from '@twiga/shared/types';
import { formatCurrency, formatDate } from '@twiga/shared/utils/formatting';

interface RecentBookingsProps {
  bookings: TwigaBooking[];
  rooms: TwigaRoom[];
  loading: boolean;
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400',
  pending_payment: 'bg-yellow-500/20 text-yellow-400',
  pay_on_arrival: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-300',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  pending_payment: 'Pending',
  pay_on_arrival: 'Pay on Arrival',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function RecentBookings({ bookings, rooms, loading }: RecentBookingsProps) {
  const roomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || roomId;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return <div className="text-gray-400 text-center py-8">No bookings yet</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-700">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-400">Guest</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-400">Room</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-400">Check In</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-400">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
              <td className="py-3 px-4 text-white">{booking.guestName}</td>
              <td className="py-3 px-4 text-gray-300">{roomName(booking.roomId)}</td>
              <td className="py-3 px-4 text-gray-300">{formatDate(booking.checkIn)}</td>
              <td className="py-3 px-4 font-semibold text-white">{formatCurrency(booking.totalPrice, 'TZS')}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || 'bg-gray-500/20 text-gray-400'}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
