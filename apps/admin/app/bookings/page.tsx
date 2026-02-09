'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Eye, X, Calendar, Mail, Phone, Clock,
  Moon, MapPin, User, CreditCard, MessageSquare, AlertTriangle,
  Plane, BedDouble, ChevronRight,
} from 'lucide-react';
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

const statusDot: Record<string, string> = {
  confirmed: 'bg-green-400',
  pending_payment: 'bg-yellow-400',
  pay_on_arrival: 'bg-blue-400',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-400',
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedBooking(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const roomName = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || roomId;
  }, [rooms]);

  const roomImage = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.images?.[0] || '';
  }, [rooms]);

  const formatTime = (time?: string) => {
    if (!time) return '—';
    return time;
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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-8 py-3 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-accent"
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
                statusFilter === status ? 'border-accent' : 'border-gray-700 hover:border-gray-600'
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
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Room</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Check In</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Pick Up</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Check Out</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Nights</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    className="border-b border-gray-700/50 hover:bg-gray-700/20 transition cursor-pointer group"
                    onClick={() => setSelectedBooking(booking)}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{booking.guestName}</p>
                      <p className="text-gray-500 text-xs font-mono">{booking.id}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{roomName(booking.roomId)}</td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300">{formatDate(booking.checkIn)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatTime(booking.pickupTime)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300">{formatDate(booking.checkOut)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-white font-medium">{booking.totalNights}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{formatCurrency(booking.totalPrice, 'TZS')}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[booking.status] || 'bg-gray-400'}`} />
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-accent transition" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* macOS-style Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop blur */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-600/50 max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-black/50"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Room image header */}
              {roomImage(selectedBooking.roomId) && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={roomImage(selectedBooking.roomId)}
                    alt={roomName(selectedBooking.roomId)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800/95 via-gray-800/40 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-mono mb-1">{selectedBooking.id}</p>
                        <h3 className="text-2xl font-bold text-white">{selectedBooking.guestName}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${statusStyles[selectedBooking.status]}`}>
                        <span className={`w-2 h-2 rounded-full ${statusDot[selectedBooking.status]} animate-pulse`} />
                        {statusLabels[selectedBooking.status]}
                      </span>
                    </div>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* No image fallback header */}
              {!roomImage(selectedBooking.roomId) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                  <div>
                    <p className="text-white/50 text-xs font-mono mb-1">{selectedBooking.id}</p>
                    <h3 className="text-xl font-bold text-white">{selectedBooking.guestName}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyles[selectedBooking.status]}`}>
                      <span className={`w-2 h-2 rounded-full ${statusDot[selectedBooking.status]}`} />
                      {statusLabels[selectedBooking.status]}
                    </span>
                    <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[calc(85vh-12rem)] p-6 space-y-5">

                {/* Quick info cards row */}
                <div className="grid grid-cols-4 gap-3">
                  <motion.div
                    className="bg-gray-700/30 rounded-xl p-3 text-center border border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Check In</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{formatDate(selectedBooking.checkIn)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-gray-700/30 rounded-xl p-3 text-center border border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Plane className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pick Up</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{formatTime(selectedBooking.pickupTime)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-gray-700/30 rounded-xl p-3 text-center border border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Calendar className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Check Out</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{formatDate(selectedBooking.checkOut)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-gray-700/30 rounded-xl p-3 text-center border border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Moon className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Nights</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{selectedBooking.totalNights}</p>
                  </motion.div>
                </div>

                {/* Guest info */}
                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Guest Information
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{selectedBooking.guestEmail}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{formatPhoneNumber(selectedBooking.guestPhone)}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <User className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{selectedBooking.numberOfGuests} guest{selectedBooking.numberOfGuests > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Stay details */}
                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BedDouble className="w-3.5 h-3.5" />
                    Stay Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Room</p>
                      <p className="text-white font-medium">{roomName(selectedBooking.roomId)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Source</p>
                      <p className="text-white font-medium">{sourceLabels[selectedBooking.source]}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Booked On</p>
                      <p className="text-white font-medium">{formatDate(selectedBooking.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Payment ID</p>
                      <p className="text-white font-mono text-xs">{selectedBooking.paymentId}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Pricing */}
                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Pricing
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Room rate</span>
                      <span className="text-gray-300">{formatCurrency(selectedBooking.roomPrice, 'TZS')}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{selectedBooking.totalNights} night{selectedBooking.totalNights > 1 ? 's' : ''}</span>
                      <span className="text-gray-300">{formatCurrency(selectedBooking.totalPrice, 'TZS')}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600/50 pt-2 mt-2">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-accent font-bold text-lg">{formatCurrency(selectedBooking.totalPrice, 'TZS')}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <motion.div
                    className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Special Requests
                    </h4>
                    <p className="text-gray-300 text-sm">{selectedBooking.specialRequests}</p>
                  </motion.div>
                )}

                {/* Cancellation */}
                {selectedBooking.cancelReason && (
                  <motion.div
                    className="bg-red-500/5 rounded-xl p-4 border border-red-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <h4 className="text-[11px] font-semibold text-red-400/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cancellation Reason
                    </h4>
                    <p className="text-gray-300 text-sm">{selectedBooking.cancelReason}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
