'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Home, TrendingUp } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const bookingsRef = collection(
          db,
          'companies',
          'twiga-agm',
          'properties',
          'twiga-residence',
          'bookings'
        );
        const allBookings = await getDocs(bookingsRef);
        const confirmed = await getDocs(query(bookingsRef, where('status', '==', 'confirmed')));
        let totalRevenue = 0;
        confirmed.docs.forEach((doc) => {
          const booking = doc.data();
          totalRevenue += booking.totalPrice || 0;
        });
        setStats({
          totalBookings: allBookings.size,
          confirmedBookings: confirmed.size,
          revenue: totalRevenue,
          occupancyRate: Math.round((confirmed.size / 30) * 100),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Twiga Residence Management</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={Calendar} label="Total Bookings" value={stats.totalBookings} loading={loading} />
          <StatsCard icon={CreditCard} label="Confirmed" value={stats.confirmedBookings} loading={loading} />
          <StatsCard
            icon={TrendingUp}
            label="Revenue (TZS)"
            value={Math.round(stats.revenue / 100).toLocaleString()}
            loading={loading}
            isMoney
          />
          <StatsCard icon={Home} label="Occupancy Rate" value={`${stats.occupancyRate}%`} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2 bg-gray-800 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Bookings Overview</h2>
            <BookingsChart />
          </motion.div>
          <motion.div
            className="bg-gray-800 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition">
                View All Bookings
              </button>
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition">
                Manage Rooms
              </button>
              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition">
                Payment Hub
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 bg-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <RecentBookings />
        </motion.div>
      </div>
    </div>
  );
}
