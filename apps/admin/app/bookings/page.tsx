'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, X, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { fetchBookings, fetchRooms } from '@/lib/data';
import { formatCurrency, formatDate, formatPhoneNumber } from '@twiga/shared/utils/formatting';
import type { TwigaBooking, TwigaRoom } from '@twiga/shared/types';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400',
  pending_payment: 'bg-yellow-500/20 text-yellow-400',
  pay_on_arrival: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-300',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  pending_payment: 'Pending Payment',
  pay_on_arrival: 'Pay on Arrival',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const sourceLabels: Record<string, string> = {
  direct: 'Direct',
  airbnb: 'Airbnb',
  booking_com: 'Booking.com',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<TwigaBooking | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingData, roomData] = await Promise.all([fetchBookings(), fetchRooms()]);
        setBookings(bookingData);
        setRooms(roomData);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const roomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || roomId;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Bookings</h1>
        <p className="text-gray-400">Manage all guest bookings</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest, email, booking ID, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-8 py-3 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="pay_on_arrival">Pay on Arrival</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {(['all', 'confirmed', 'pending_payment', 'pay_on_arrival', 'cancelled'] as const).map((status) => {
          const count = status === 'all' ? bookings.length : bookings.filter((b) => b.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`bg-gray-800 border rounded-lg p-3 text-center transition ${
                statusFilter === status ? 'border-green-500' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-gray-400">{status === 'all' ? 'Total' : statusLabels[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Bookings table */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Booking ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Room</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Check In</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Check Out</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Source</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition">
                    <td className="py-4 px-4 font-mono text-green-400 text-xs">{booking.id}</td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{booking.guestName}</p>
                      <p className="text-gray-400 text-xs">{booking.guestEmail}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{roomName(booking.roomId)}</td>
                    <td className="py-4 px-4 text-gray-300">{formatDate(booking.checkIn)}</td>
                    <td className="py-4 px-4 text-gray-300">{formatDate(booking.checkOut)}</td>
                    <td className="py-4 px-4">
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {sourceLabels[booking.source] || booking.source}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{formatCurrency(booking.totalPrice, 'TZS')}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-gray-400 hover:text-green-400 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <motion.div
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">Booking Details</h3>
                <p className="text-sm font-mono text-green-400">{selectedBooking.id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles[selectedBooking.status]}`}>
                  {statusLabels[selectedBooking.status]}
                </span>
                <span className="text-xs bg-gray-700 px-3 py-1 rounded text-gray-300">
                  {sourceLabels[selectedBooking.source]}
                </span>
              </div>

              {/* Guest info */}
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Guest Information</h4>
                <div className="space-y-2">
                  <p className="text-white font-medium text-lg">{selectedBooking.guestName}</p>
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{selectedBooking.guestEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{formatPhoneNumber(selectedBooking.guestPhone)}</span>
                  </div>
                </div>
              </div>

              {/* Stay details */}
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Stay Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Room</p>
                    <p className="text-white font-medium">{roomName(selectedBooking.roomId)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Guests</p>
                    <p className="text-white font-medium">{selectedBooking.numberOfGuests}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Check-in</p>
                    <p className="text-white font-medium">{formatDate(selectedBooking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Check-out</p>
                    <p className="text-white font-medium">{formatDate(selectedBooking.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Nights</p>
                    <p className="text-white font-medium">{selectedBooking.totalNights}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white font-medium">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pricing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Room rate</span>
                    <span className="text-white">{formatCurrency(selectedBooking.roomPrice, 'TZS')}/night</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedBooking.totalNights} night(s)</span>
                    <span className="text-white">{formatCurrency(selectedBooking.totalPrice, 'TZS')}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-green-400 font-bold text-lg">{formatCurrency(selectedBooking.totalPrice, 'TZS')}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Special Requests</h4>
                  <p className="text-gray-300 text-sm">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {selectedBooking.cancelReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Cancellation Reason</h4>
                  <p className="text-gray-300 text-sm">{selectedBooking.cancelReason}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
