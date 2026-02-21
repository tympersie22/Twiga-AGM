'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TwigaBooking } from '@/lib/shared/types';

interface BookingsChartProps {
  bookings: TwigaBooking[];
  totalRooms: number;
}

const DAY_COUNT = 30;

export default function BookingsChart({ bookings, totalRooms }: BookingsChartProps) {
  const data = useMemo(() => {
    const rooms = Math.max(totalRooms, 1);

    return Array.from({ length: DAY_COUNT }).map((_, index) => {
      const day = index + 1;
      const occupied = bookings.filter((booking) => {
        if (booking.status === 'cancelled') return false;
        const checkInDate = new Date(booking.checkIn).getDate();
        const checkOutDate = new Date(booking.checkOut).getDate();
        return day >= checkInDate && day <= checkOutDate;
      }).length;

      const clampedOccupied = Math.min(occupied, rooms);
      const available = Math.max(rooms - clampedOccupied, 0);
      const notReady = Math.min(Math.round((bookings.length / 12 + index) % 3), rooms);

      return {
        day: String(day).padStart(2, '0'),
        available,
        occupied: clampedOccupied,
        notReady,
      };
    });
  }, [bookings, totalRooms]);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <CartesianGrid stroke="#edf2ed" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#95a595"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#e2e9e1' }}
            interval={2}
          />
          <YAxis stroke="#95a595" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: '#f6f9f5' }}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #dce5db',
              borderRadius: '10px',
              color: '#253327',
            }}
          />
          <Legend
            verticalAlign="top"
            align="left"
            wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: '#647464' }}
          />
          <Bar dataKey="available" stackId="rooms" fill="#a8c8ad" radius={[4, 4, 0, 0]} name="Available" />
          <Bar dataKey="occupied" stackId="rooms" fill="#6d996f" radius={[4, 4, 0, 0]} name="Occupied" />
          <Bar dataKey="notReady" stackId="rooms" fill="#d6ddd4" radius={[4, 4, 0, 0]} name="Not Ready" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
