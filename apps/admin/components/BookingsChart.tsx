'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TwigaBooking } from '@twiga/shared/types';

interface BookingsChartProps {
  bookings: TwigaBooking[];
}

export default function BookingsChart({ bookings }: BookingsChartProps) {
  const data = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const byMonth: Record<string, number> = {};
    confirmed.forEach((b) => {
      const date = new Date(b.checkIn);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    return Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [bookings]);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No booking data yet</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
