'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoomCard from './RoomCard';
import type { TwigaRoom } from '@twiga/shared/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function RoomShowcase() {
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, 'companies', 'twiga-agm', 'properties', 'twiga-residence', 'rooms');
        const snapshot = await getDocs(roomsRef);
        setRooms(snapshot.docs.map((doc) => doc.data() as TwigaRoom));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Loading rooms...</div>;
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
