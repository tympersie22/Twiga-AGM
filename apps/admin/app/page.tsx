'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  MoreHorizontal,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { subscribeBookings, subscribeRooms } from '@/lib/data';
import { formatCurrency } from '@/lib/shared/utils/formatting';
import type { TwigaBooking, TwigaRoom } from '@/lib/shared/types';
import StatsCard from '@/components/StatsCard';
import BookingsChart from '@/components/BookingsChart';
import RecentBookings from '@/components/RecentBookings';

const shortWeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let bookingsReady = false;
    let roomsReady = false;

    const completeLoadingIfReady = () => {
      if (bookingsReady && roomsReady) setLoading(false);
    };

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

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pay_on_arrival');
    const completed = bookings.filter((b) => b.status === 'completed');
    const revenue = bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, b) => acc + b.totalPrice, 0);
    const totalRooms = rooms.length || 9;

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      completedBookings: completed.length,
      revenue,
      occupancyRate: Math.round((confirmed.length / totalRooms) * 100),
    };
  }, [bookings, rooms]);

  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        const hasArrival = bookings.some((booking) => sameDay(new Date(booking.checkIn), date));

        return {
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
          label: shortWeekDays[date.getDay()],
          day: String(date.getDate()).padStart(2, '0'),
          date,
          hasArrival,
        };
      }),
    [bookings, today]
  );

  const calendarRows = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => a.checkIn - b.checkIn)
      .slice(0, 6)
      .map((booking, index) => {
        const roomName = rooms.find((room) => room.id === booking.roomId)?.name || booking.roomId;
        return {
          id: booking.id,
          guestName: booking.guestName,
          initials: initialsFromName(booking.guestName),
          roomName,
          checkIn: new Date(booking.checkIn),
          colorClass:
            index % 3 === 0
              ? 'bg-[#e3f0e4] border-[#c5ddc8]'
              : index % 3 === 1
              ? 'bg-[#e8eff7] border-[#cad7e8]'
              : 'bg-[#efe9f7] border-[#d8caeb]',
        };
      });
  }, [bookings, rooms]);

  const checkInTrend = stats.totalBookings === 0 ? 0 : Math.round((stats.confirmedBookings / stats.totalBookings) * 100);
  const checkOutTrend = stats.totalBookings === 0 ? 0 : Math.round((stats.completedBookings / stats.totalBookings) * 100);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="bg-[#f8faf7] border border-[#dfe6dd] rounded-[26px] p-4 md:p-6 shadow-[0_8px_22px_rgba(39,53,43,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-[38px] leading-none font-semibold text-[#1f2d23]">Dashboard</h1>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90a08e]" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-white border border-[#d9e2d8] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#2b3a30] placeholder:text-[#9aa99a] outline-none focus:border-[#b9cdb7]"
              />
            </div>
            <button className="w-10 h-10 rounded-xl border border-[#d9e2d8] bg-white text-[#6f7f70] inline-flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl border border-[#d9e2d8] bg-white text-[#6f7f70] inline-flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <section className="xl:col-span-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                icon={Calendar}
                label="Total Booking"
                value={stats.totalBookings.toLocaleString()}
                footerText="Total Booking last 365 days"
                trend={10}
                loading={loading}
              />
              <StatsCard
                icon={TrendingUp}
                label="Check In"
                value={stats.confirmedBookings.toLocaleString()}
                footerText="Check In last 365 days"
                trend={checkInTrend}
                loading={loading}
              />
              <StatsCard
                icon={TrendingDown}
                label="Check Out"
                value={stats.completedBookings.toLocaleString()}
                footerText="Check Out last 365 days"
                trend={-checkOutTrend}
                loading={loading}
              />
            </div>

            <div className="bg-white border border-[#dce5db] rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
                <div>
                  <h2 className="text-[25px] leading-none font-semibold text-[#263428]">Occupancy</h2>
                  <p className="text-xs text-[#91a091] mt-1">Available vs occupied rooms in the last 30 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="h-9 px-3 rounded-lg border border-[#d8e0d8] bg-[#f8faf7] text-sm text-[#5f6f61]">
                    <option>All Occupancy</option>
                  </select>
                  <select className="h-9 px-3 rounded-lg border border-[#d8e0d8] bg-[#f8faf7] text-sm text-[#5f6f61]">
                    <option>30 Days</option>
                  </select>
                </div>
              </div>
              <BookingsChart bookings={bookings} totalRooms={rooms.length || 9} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-[#dce5db] rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#2b3a2f]">Revenue Overview</h3>
                  <select className="h-8 px-3 rounded-lg border border-[#d8e0d8] bg-[#f8faf7] text-xs text-[#5f6f61]">
                    <option>30 Days</option>
                  </select>
                </div>
                <p className="text-sm text-[#8ea08f]">Total Revenue</p>
                <p className="text-3xl font-semibold text-[#263428] mt-1 mb-4">{loading ? '...' : formatCurrency(stats.revenue, 'TZS')}</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-[#637463]">Direct Booking</span>
                      <span className="text-[#4f5f50]">{stats.occupancyRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#ebf0e8]">
                      <div className="h-full rounded-full bg-[#719471]" style={{ width: `${Math.max(stats.occupancyRate, 5)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-[#637463]">Pay on Arrival</span>
                      <span className="text-[#4f5f50]">{Math.max(100 - stats.occupancyRate, 0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#ebf0e8]">
                      <div className="h-full rounded-full bg-[#93b693]" style={{ width: `${Math.max(100 - stats.occupancyRate, 5)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-[#637463]">Room Stock Utilization</span>
                      <span className="text-[#4f5f50]">{Math.min(stats.occupancyRate + 15, 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#ebf0e8]">
                      <div className="h-full rounded-full bg-[#b6cdb5]" style={{ width: `${Math.min(stats.occupancyRate + 15, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#dce5db] rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-[#2b3a2f]">Recent Arrivals</h3>
                  <Link href="/bookings" className="text-sm font-medium text-[#617b62] hover:text-[#4d674e] transition-colors">
                    View all
                  </Link>
                </div>
                <RecentBookings bookings={bookings.slice(0, 5)} rooms={rooms} loading={loading} compact />
              </div>
            </div>
          </section>

          <aside className="xl:col-span-4 bg-white border border-[#dce5db] rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-[26px] leading-none font-semibold text-[#273629]">Calendar</h2>
                <p className="text-xs text-[#8fa08f] mt-1">Recent activities of {rooms.length || 0} rooms</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#7a8b7b] bg-[#f0f4ef] border border-[#dce5db] rounded-full px-2 py-1">
                <Clock3 className="w-3 h-3" />
                Every Check-out at 12:00 PM
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-full bg-[#f3f7f2] border border-[#dde6db] px-3 py-2">
              <button className="w-7 h-7 rounded-full hover:bg-white text-[#6e816f] inline-flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-[#3b4d3d]">7 days of {today.toLocaleString('en-US', { month: 'long' })}</p>
              <button className="w-7 h-7 rounded-full hover:bg-white text-[#6e816f] inline-flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => (
                <div
                  key={day.key}
                  className={`rounded-lg border p-2 text-center ${
                    sameDay(day.date, today)
                      ? 'bg-[#e9f2e7] border-[#c8dcc7]'
                      : 'bg-[#f9fbf8] border-[#e3ebe2]'
                  }`}
                >
                  <p className="text-[11px] text-[#8ea08f]">{day.label}</p>
                  <p className="text-sm font-semibold text-[#344736]">{day.day}</p>
                  <div className="mt-1 h-1.5 flex items-center justify-center">
                    {day.hasArrival ? <span className="w-1.5 h-1.5 rounded-full bg-[#6e8d70]" /> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-[#f0f4ef] animate-pulse" />
                ))
              ) : calendarRows.length === 0 ? (
                <div className="text-sm text-[#8da08e] rounded-xl border border-dashed border-[#d6ded5] bg-[#f8faf8] p-5 text-center">
                  No activities in this period.
                </div>
              ) : (
                calendarRows.map((row) => (
                  <div key={row.id} className={`rounded-xl border p-3 ${row.colorClass}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/90 border border-[#d2decf] text-[#4f7252] text-xs font-semibold inline-flex items-center justify-center">
                        {row.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2f412f] truncate">{row.guestName}</p>
                        <p className="text-xs text-[#667865]">{row.roomName} • {row.checkIn.toLocaleDateString()}</p>
                      </div>
                      <span className="w-6 h-6 rounded-md border border-[#c8d9c8] bg-[#f4faf2] text-[#5c7d5e] inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/bookings"
              className="mt-4 w-full h-10 rounded-xl border border-[#d7e1d6] bg-[#f8faf7] text-[#4d664f] text-sm font-semibold inline-flex items-center justify-center hover:bg-[#eef4ec] transition-colors"
            >
              Full View
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
