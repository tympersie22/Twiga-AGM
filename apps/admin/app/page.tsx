'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CreditCard, Home, TrendingUp } from 'lucide-react';
import { fetchBookings, fetchRooms } from '@/lib/data';
import { formatCurrency } from '@twiga/shared/utils/formatting';
import type { TwigaBooking, TwigaRoom } from '@twiga/shared/types';
import StatsCard from '@/components/StatsCard';
import BookingsChart from '@/components/BookingsChart';
import RecentBookings from '@/components/RecentBookings';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    revenue: 0,
    occupancyRate: 0,
  });
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allBookings, allRooms] = await Promise.all([fetchBookings(), fetchRooms()]);
        const confirmed = allBookings.filter((b) => b.status === 'confirmed');
        const totalRevenue = confirmed.reduce((acc, b) => acc + b.totalPrice, 0);
        const totalRooms = allRooms.length || 9;
        setBookings(allBookings);
        setRooms(allRooms);
        setStats({
          totalBookings: allBookings.length,
          confirmedBookings: confirmed.length,
          revenue: totalRevenue,
          occupancyRate: Math.round((confirmed.length / totalRooms) * 100),
        });
      } catch {
        // fallback handled in fetchBookings
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">Twiga Residence Management Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={Calendar} label="Total Bookings" value={stats.totalBookings} loading={loading} />
        <StatsCard icon={CreditCard} label="Confirmed" value={stats.confirmedBookings} loading={loading} />
        <StatsCard
          icon={TrendingUp}
          label="Revenue (TZS)"
          value={formatCurrency(stats.revenue, 'TZS')}
          loading={loading}
          isMoney
        />
        <StatsCard icon={Home} label="Occupancy Rate" value={`${stats.occupancyRate}%`} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Bookings Overview</h2>
          <BookingsChart bookings={bookings} />
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/bookings"
              className="block w-full bg-accent hover:bg-accent-light text-gray-900 px-4 py-3 rounded-lg transition text-center font-semibold"
            >
              View All Bookings
            </Link>
            <Link
              href="/rooms"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition text-center font-medium border border-gray-600"
            >
              Manage Rooms
            </Link>
            <Link
              href="/payments"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition text-center font-medium border border-gray-600"
            >
              Payment Hub
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
          <Link href="/bookings" className="text-accent hover:text-accent-light text-sm font-medium transition">
            View all
          </Link>
        </div>
        <RecentBookings bookings={bookings.slice(0, 5)} rooms={rooms} loading={loading} />
      </div>
    </div>
  );
}
