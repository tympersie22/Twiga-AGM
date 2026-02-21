'use client';

import type { TwigaBooking, TwigaRoom } from '@/lib/shared/types';
import { formatCurrency } from '@/lib/shared/utils/formatting';

interface RecentBookingsProps {
  bookings: TwigaBooking[];
  rooms: TwigaRoom[];
  loading: boolean;
  compact?: boolean;
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-[#e6f2e5] text-[#4d7a4d]',
  pending_payment: 'bg-[#fff3df] text-[#9d6c1f]',
  pay_on_arrival: 'bg-[#e6effa] text-[#3d6494]',
  completed: 'bg-[#ecefee] text-[#657367]',
  cancelled: 'bg-[#f9e8e6] text-[#aa5447]',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  pending_payment: 'Pending',
  pay_on_arrival: 'On Arrival',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const timeAgo = (timestamp: number) => {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
};

export default function RecentBookings({ bookings, rooms, loading, compact }: RecentBookingsProps) {
  const roomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || roomId;
  };

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-[#f0f4ef] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return <div className="text-[#8fa08f] text-center py-8 text-sm">No bookings yet</div>;
  }

  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e3ebe2]">
            <tr>
              <th className="text-left py-2.5 px-2 font-semibold text-[#95a596] text-xs">R. No</th>
              <th className="text-left py-2.5 px-2 font-semibold text-[#95a596] text-xs">Name</th>
              <th className="text-left py-2.5 px-2 font-semibold text-[#95a596] text-xs">Time</th>
              <th className="text-left py-2.5 px-2 font-semibold text-[#95a596] text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-[#edf2ec]">
                <td className="py-2.5 px-2 text-[#596a5b] text-xs font-medium">#{roomName(booking.roomId)}</td>
                <td className="py-2.5 px-2">
                  <p className="text-[#2f3f31] font-semibold text-sm">{booking.guestName}</p>
                  <p className="text-[#92a292] text-xs">{formatCurrency(booking.totalPrice, 'TZS')}</p>
                </td>
                <td className="py-2.5 px-2 text-[#748575] text-xs">{timeAgo(booking.checkIn)}</td>
                <td className="py-2.5 px-2">
                  <span className={`text-[11px] font-medium rounded-full px-2 py-1 ${statusStyles[booking.status] || 'bg-[#ecefee] text-[#657367]'}`}>
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-[#e3ebe2]">
          <tr>
            <th className="text-left py-3 px-3 font-semibold text-[#95a596]">Guest</th>
            <th className="text-left py-3 px-3 font-semibold text-[#95a596]">Room</th>
            <th className="text-left py-3 px-3 font-semibold text-[#95a596]">Amount</th>
            <th className="text-left py-3 px-3 font-semibold text-[#95a596]">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-[#edf2ec] hover:bg-[#f7faf6] transition">
              <td className="py-3 px-3 text-[#2f3f31] font-medium">{booking.guestName}</td>
              <td className="py-3 px-3 text-[#657567]">{roomName(booking.roomId)}</td>
              <td className="py-3 px-3 font-semibold text-[#2f3f31]">{formatCurrency(booking.totalPrice, 'TZS')}</td>
              <td className="py-3 px-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || 'bg-[#ecefee] text-[#657367]'}`}>
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
