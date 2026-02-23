'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';
import {
  fetchBookings,
  fetchRooms,
  subscribeBookings,
  subscribeRooms,
  updateBookingStatus,
  updateBookingStatusesBulk,
} from '@/lib/data';
import { useAuth } from '@/lib/AuthContext';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/shared/utils/formatting';
import type { BookingStatus, TwigaBooking, TwigaRoom } from '@/lib/shared/types';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-[#e6f2e5] text-[#4d7a4d]',
  pending_payment: 'bg-[#fff3df] text-[#9d6c1f]',
  pay_on_arrival: 'bg-[#e6effa] text-[#3d6494]',
  completed: 'bg-[#ecefee] text-[#657367]',
  cancelled: 'bg-[#f9e8e6] text-[#aa5447]',
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
  const { role } = useAuth();
  const canCancelBookings = role === 'admin' || role === 'super_admin';
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<TwigaBooking | null>(null);
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null);
  const [actionError, setActionError] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<BookingStatus | null>(null);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    let bookingsReady = false;
    let roomsReady = false;

    const completeLoadingIfReady = () => {
      if (bookingsReady && roomsReady) setLoading(false);
    };

    const bootstrap = async () => {
      const [bookingData, roomData] = await Promise.all([fetchBookings(), fetchRooms()]);
      setBookings(bookingData);
      setRooms(roomData);
    };

    void bootstrap();

    const unsubBookings = subscribeBookings((data) => {
      setBookings(data);
      bookingsReady = true;
      completeLoadingIfReady();
    });
    const unsubRooms = subscribeRooms((data) => {
      setRooms(data);
      roomsReady = true;
      completeLoadingIfReady();
    });

    return () => {
      unsubBookings();
      unsubRooms();
    };
  }, []);

  useEffect(() => {
    setCancelReason(selectedBooking?.cancelReason || '');
    setActionError('');
    setActionLoading(null);
  }, [selectedBooking]);

  useEffect(() => {
    setSelectedBookingIds((prev) => prev.filter((id) => bookings.some((booking) => booking.id === id)));
  }, [bookings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedBooking(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const roomName = useCallback(
    (roomId: string) => {
      const room = rooms.find((r) => r.id === roomId);
      return room?.name || roomId;
    },
    [rooms]
  );

  const filteredBookings = bookings.filter((booking) => {
    const needle = searchQuery.toLowerCase();
    const matchesSearch =
      booking.guestName.toLowerCase().includes(needle) ||
      booking.guestEmail.toLowerCase().includes(needle) ||
      booking.id.toLowerCase().includes(needle) ||
      roomName(booking.roomId).toLowerCase().includes(needle);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const summary = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending_payment').length,
    arrival: bookings.filter((b) => b.status === 'pay_on_arrival').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const applyLocalBookingStatus = (bookingId: string, status: BookingStatus, reason?: string) => {
    const now = Date.now();
    const update = (booking: TwigaBooking): TwigaBooking => {
      if (booking.id !== bookingId) return booking;
      const next: TwigaBooking = { ...booking, status, updatedAt: now };
      if (status === 'cancelled') {
        next.cancelledAt = now;
        next.cancelReason = reason || 'Cancelled by admin';
      }
      if (status === 'completed') {
        next.checkInCompleted = true;
        next.checkInCompletedAt = now;
      }
      return next;
    };

    setBookings((prev) => prev.map(update));
    setSelectedBooking((prev) => (prev ? update(prev) : prev));
  };

  const handleBookingAction = async (status: BookingStatus) => {
    if (!selectedBooking) return;
    if (status === 'cancelled' && !canCancelBookings) {
      setActionError('Managers cannot cancel reservations.');
      return;
    }
    if (status === 'cancelled' && !cancelReason.trim()) {
      setActionError('Please provide a cancellation reason.');
      return;
    }

    setActionError('');
    setActionLoading(status);
    const reason = status === 'cancelled' ? cancelReason.trim() : undefined;
    const ok = await updateBookingStatus({ bookingId: selectedBooking.id, status, reason });

    if (!ok) {
      setActionError('Could not update booking. Check your permissions/connection and try again.');
      setActionLoading(null);
      return;
    }

    applyLocalBookingStatus(selectedBooking.id, status, reason);
    setActionLoading(null);
  };

  const handleBulkBookingAction = async (status: BookingStatus) => {
    if (selectedBookingIds.length === 0) return;
    if (status === 'cancelled' && !canCancelBookings) {
      setBulkError('Managers cannot cancel reservations.');
      return;
    }
    if (status === 'cancelled' && !cancelReason.trim()) {
      setBulkError('Please provide a cancellation reason for bulk cancel.');
      return;
    }

    const reason = status === 'cancelled' ? cancelReason.trim() : undefined;
    setBulkError('');
    setBulkLoading(status);
    const ok = await updateBookingStatusesBulk(selectedBookingIds, status, reason);

    if (!ok) {
      setBulkError('Some bookings could not be updated. Please retry.');
      setBulkLoading(null);
      return;
    }

    selectedBookingIds.forEach((id) => applyLocalBookingStatus(id, status, reason));
    setSelectedBookingIds([]);
    setBulkLoading(null);
  };

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId]
    );
  };

  const allFilteredSelected =
    filteredBookings.length > 0 && filteredBookings.every((booking) => selectedBookingIds.includes(booking.id));

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <section className="bg-[#f8faf7] border border-[#dfe6dd] rounded-[24px] p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[34px] leading-none font-semibold text-[#1f2d23]">Reservations</h1>
            <p className="text-sm text-[#849684] mt-1">Manage and inspect all guest bookings</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <input
                type="text"
                placeholder="Search guest, room, booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 min-w-[190px] rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-8 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7] appearance-none"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending_payment">Pending payment</option>
                <option value="pay_on_arrival">Pay on arrival</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          <button onClick={() => setStatusFilter('all')} className={`rounded-xl border p-3 text-left ${statusFilter === 'all' ? 'bg-white border-[#c8d8c9]' : 'bg-[#f1f5ef] border-[#e0e8de]'}`}>
            <p className="text-xs text-[#869786]">Total</p>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{summary.total}</p>
          </button>
          <button onClick={() => setStatusFilter('confirmed')} className={`rounded-xl border p-3 text-left ${statusFilter === 'confirmed' ? 'bg-white border-[#c8d8c9]' : 'bg-[#f1f5ef] border-[#e0e8de]'}`}>
            <p className="text-xs text-[#869786]">Confirmed</p>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{summary.confirmed}</p>
          </button>
          <button onClick={() => setStatusFilter('pending_payment')} className={`rounded-xl border p-3 text-left ${statusFilter === 'pending_payment' ? 'bg-white border-[#c8d8c9]' : 'bg-[#f1f5ef] border-[#e0e8de]'}`}>
            <p className="text-xs text-[#869786]">Pending</p>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{summary.pending}</p>
          </button>
          <button onClick={() => setStatusFilter('pay_on_arrival')} className={`rounded-xl border p-3 text-left ${statusFilter === 'pay_on_arrival' ? 'bg-white border-[#c8d8c9]' : 'bg-[#f1f5ef] border-[#e0e8de]'}`}>
            <p className="text-xs text-[#869786]">Arrival</p>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{summary.arrival}</p>
          </button>
          <button onClick={() => setStatusFilter('cancelled')} className={`rounded-xl border p-3 text-left ${statusFilter === 'cancelled' ? 'bg-white border-[#c8d8c9]' : 'bg-[#f1f5ef] border-[#e0e8de]'}`}>
            <p className="text-xs text-[#869786]">Cancelled</p>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{summary.cancelled}</p>
          </button>
        </div>
      </section>

      <section className="bg-white border border-[#dce5db] rounded-2xl overflow-hidden">
        {selectedBookingIds.length > 0 ? (
          <div className="p-3 border-b border-[#e3ebe2] bg-[#f7fbf6]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#446346]">{selectedBookingIds.length} selected</p>
              <button
                onClick={() => handleBulkBookingAction('confirmed')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#c9ddca] bg-[#eaf4ea] text-[#3f6e40] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'confirmed' ? 'Updating...' : 'Bulk Confirm'}
              </button>
              <button
                onClick={() => handleBulkBookingAction('completed')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#cad8e8] bg-[#e9f0f8] text-[#3b5f8e] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'completed' ? 'Updating...' : 'Bulk Complete'}
              </button>
              {canCancelBookings ? (
                <button
                  onClick={() => handleBulkBookingAction('cancelled')}
                  disabled={bulkLoading !== null}
                  className="h-8 px-3 rounded-lg border border-[#ebd0cc] bg-[#f9ece9] text-[#9d4f44] text-xs font-semibold disabled:opacity-60"
                >
                  {bulkLoading === 'cancelled' ? 'Cancelling...' : 'Bulk Cancel'}
                </button>
              ) : null}
              <button
                onClick={() => setSelectedBookingIds([])}
                className="h-8 px-3 rounded-lg border border-[#d8e1d7] bg-white text-[#5f715f] text-xs font-semibold"
              >
                Clear
              </button>
            </div>
            {canCancelBookings ? (
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Cancellation reason for bulk cancel"
                className="mt-2 w-full min-h-[64px] rounded-lg border border-[#d8e1d7] px-3 py-2 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
              />
            ) : null}
            {bulkError ? <p className="mt-1 text-sm text-[#aa5447]">{bulkError}</p> : null}
          </div>
        ) : null}

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-12 rounded-lg bg-[#f1f5ef] animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="w-12 h-12 text-[#a0afa0] mx-auto mb-3" />
            <p className="text-[#6c7f6d]">No matching bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f8f4] border-b border-[#e3ebe2]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookingIds(filteredBookings.map((booking) => booking.id));
                        } else {
                          setSelectedBookingIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Booking</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Guest</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Room</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Check In</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Check Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-[#edf2ec] hover:bg-[#f8fbf7]">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedBookingIds.includes(booking.id)}
                        onChange={() => toggleBookingSelection(booking.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#2f4032]">#{booking.id}</p>
                      <p className="text-xs text-[#8da08e]">{booking.totalNights} nights</p>
                    </td>
                    <td className="py-3 px-4 text-[#2f4032]">{booking.guestName}</td>
                    <td className="py-3 px-4 text-[#617262]">{roomName(booking.roomId)}</td>
                    <td className="py-3 px-4 text-[#617262]">{formatDate(booking.checkIn)}</td>
                    <td className="py-3 px-4 text-[#617262]">{formatDate(booking.checkOut)}</td>
                    <td className="py-3 px-4 font-semibold text-[#2f4032]">{formatCurrency(booking.totalPrice, 'TZS')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status] || 'bg-[#ecefee] text-[#657367]'}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#d7e1d7] text-[#5f715f] hover:bg-[#f0f5ef]"
                        title="View booking details"
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
      </section>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedBooking(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#dce5db] bg-[#fbfdfb] shadow-[0_20px_40px_rgba(24,38,28,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#e2eae1] flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-[#92a292]">Booking Details</p>
                <h3 className="text-2xl font-semibold text-[#263427] mt-1">#{selectedBooking.id}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-9 h-9 rounded-lg border border-[#d7e1d7] text-[#687868] hover:bg-[#f1f6f0]">
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 space-y-2">
                <p className="text-xs text-[#93a294] uppercase font-semibold">Guest</p>
                <p className="text-lg font-semibold text-[#2b3c2d]">{selectedBooking.guestName}</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><Mail className="w-4 h-4" />{selectedBooking.guestEmail}</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><Phone className="w-4 h-4" />{formatPhoneNumber(selectedBooking.guestPhone)}</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><User className="w-4 h-4" />{selectedBooking.numberOfGuests} guests</p>
              </div>

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 space-y-2">
                <p className="text-xs text-[#93a294] uppercase font-semibold">Stay</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{roomName(selectedBooking.roomId)}</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(selectedBooking.checkIn)} to {formatDate(selectedBooking.checkOut)}</p>
                <p className="text-sm text-[#647765] inline-flex items-center gap-2"><Clock className="w-4 h-4" />Pick-up: {selectedBooking.pickupTime || 'N/A'}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[selectedBooking.status] || 'bg-[#ecefee] text-[#657367]'}`}>
                  {statusLabels[selectedBooking.status] || selectedBooking.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 md:col-span-2">
                <p className="text-xs text-[#93a294] uppercase font-semibold mb-2">Payment</p>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-2xl font-semibold text-[#2b3c2d]">{formatCurrency(selectedBooking.totalPrice, 'TZS')}</p>
                  <p className="text-sm text-[#6b7d6c]">Source: {sourceLabels[selectedBooking.source] || selectedBooking.source}</p>
                  <p className="text-sm text-[#6b7d6c]">Nights: {selectedBooking.totalNights}</p>
                </div>
                {selectedBooking.specialRequests ? (
                  <p className="text-sm text-[#5d6f5f] mt-3">Note: {selectedBooking.specialRequests}</p>
                ) : null}
              </div>

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 md:col-span-2">
                <p className="text-xs text-[#93a294] uppercase font-semibold mb-3">Admin Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleBookingAction('confirmed')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#c9ddca] bg-[#eaf4ea] text-[#3f6e40] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'confirmed' ? 'Updating...' : 'Mark Confirmed'}
                  </button>
                  <button
                    onClick={() => handleBookingAction('completed')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#cad8e8] bg-[#e9f0f8] text-[#3b5f8e] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'completed' ? 'Updating...' : 'Mark Completed'}
                  </button>
                  {canCancelBookings ? (
                    <button
                      onClick={() => handleBookingAction('cancelled')}
                      disabled={actionLoading !== null}
                      className="h-10 rounded-xl border border-[#ebd0cc] bg-[#f9ece9] text-[#9d4f44] text-sm font-semibold disabled:opacity-60"
                    >
                      {actionLoading === 'cancelled' ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  ) : null}
                </div>
                {canCancelBookings ? (
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cancellation reason (required for cancel action)"
                    className="mt-3 w-full min-h-[78px] rounded-xl border border-[#d8e1d7] px-3 py-2 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
                  />
                ) : null}
                {actionError ? <p className="mt-2 text-sm text-[#aa5447]">{actionError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
