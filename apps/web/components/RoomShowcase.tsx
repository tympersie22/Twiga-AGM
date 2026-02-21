'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoomCard from './RoomCard';
import type { TwigaRoom } from '@/lib/shared/types';
import { fetchRooms } from '@/lib/data';

export default function RoomShowcase() {
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-96" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room, i) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <RoomCard room={room} />
        </motion.div>
      ))}
    </div>
  );
}
