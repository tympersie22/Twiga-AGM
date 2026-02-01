'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function BookingsChart() {
  const [data, setData] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRef = collection(
          db,
          'companies',
          'twiga-agm',
          'properties',
          'twiga-residence',
          'bookings'
        );
        const confirmed = await getDocs(query(bookingsRef, where('status', '==', 'confirmed')));
        const byMonth: Record<string, number> = {};
        confirmed.docs.forEach((doc) => {
          const d = doc.data();
          const date = new Date(d.checkIn);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          byMonth[key] = (byMonth[key] || 0) + 1;
        });
        setData(
          Object.entries(byMonth)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month))
        );
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };
    fetchData();
  }, []);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No booking data yet</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
