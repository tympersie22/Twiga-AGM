'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">Twiga Residence Management Overview</p>
      </motion.div>

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
        <motion.div
          className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Bookings Overview</h2>
          <BookingsChart bookings={bookings} />
        </motion.div>
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/bookings"
              className="block w-full bg-green-700 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition text-center font-medium"
            >
              View All Bookings
            </Link>
            <Link
              href="/rooms"
              className="block w-full bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition text-center font-medium"
            >
              Manage Rooms
            </Link>
            <Link
              href="/payments"
              className="block w-full bg-purple-700 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition text-center font-medium"
            >
              Payment Hub
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
          <Link href="/bookings" className="text-green-400 hover:text-green-300 text-sm font-medium transition">
            View all
          </Link>
        </div>
        <RecentBookings bookings={bookings.slice(0, 5)} rooms={rooms} loading={loading} />
      </motion.div>
    </div>
  );
}
