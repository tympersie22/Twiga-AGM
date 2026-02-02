'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoomCard from './RoomCard';
import type { TwigaRoom } from '@twiga/shared/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

type FilterType = 'all' | 'standard' | 'apartment';

export default function RoomShowcase() {
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, 'companies', 'twiga-agm', 'properties', 'twiga-residence', 'rooms');
        const q = query(roomsRef, orderBy('name'));
        const snapshot = await getDocs(q);
        setRooms(snapshot.docs.map((doc) => doc.data() as TwigaRoom));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'all') return true;
    return room.type === filter;
  });

  // Separate featured room (apartment) from standard rooms
  const featuredRoom = filteredRooms.find((room) => room.type === 'apartment');
  const standardRooms = filteredRooms.filter((room) => room.type === 'standard');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal/60 font-medium">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-12">
        {(['all', 'standard', 'apartment'] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
              filter === type
                ? 'bg-deep-blue text-white'
                : 'bg-transparent text-charcoal/60 hover:text-deep-blue border border-warm-gray hover:border-deep-blue'
            }`}
          >
            {type === 'all' ? 'All' : type === 'standard' ? 'Rooms' : 'Apartment'}
          </button>
        ))}
      </div>

      {/* Featured Room (Apartment) */}
      {featuredRoom && filter !== 'standard' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="mb-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-sm overflow-hidden shadow-lg">
            {/* Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80"
                alt={featuredRoom.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-gold text-white text-sm font-medium uppercase tracking-wider">
                  Featured
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="text-gold text-sm tracking-widest uppercase mb-2">
                Our Signature
              </span>
              <h3 className="font-serif text-3xl lg:text-4xl text-deep-blue mb-4">
                {featuredRoom.name}
              </h3>
              <p className="text-charcoal/70 mb-6 leading-relaxed">
                {featuredRoom.description}. Experience the perfect blend of comfort and elegance
                with stunning views and premium amenities.
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-cream rounded-sm">
                  <p className="font-serif text-2xl text-deep-blue">{featuredRoom.maxGuests}</p>
                  <p className="text-xs text-charcoal/60 uppercase tracking-wider">Guests</p>
                </div>
                <div className="text-center p-4 bg-cream rounded-sm">
                  <p className="font-serif text-2xl text-deep-blue">{featuredRoom.bedroomCount}</p>
                  <p className="text-xs text-charcoal/60 uppercase tracking-wider">Bedroom</p>
                </div>
                <div className="text-center p-4 bg-cream rounded-sm">
                  <p className="font-serif text-2xl text-deep-blue">{featuredRoom.bathroomCount}</p>
                  <p className="text-xs text-charcoal/60 uppercase tracking-wider">Bathrooms</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-8">
                {featuredRoom.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 border border-warm-gray text-sm text-charcoal/70"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal/60">From</p>
                  <p className="font-serif text-2xl text-deep-blue">
                    TZS {(featuredRoom.basePrice / 1000000).toFixed(0)}M
                    <span className="text-sm text-charcoal/60 font-sans"> / night</span>
                  </p>
                </div>
                <motion.a
                  href={`/booking?roomId=${featuredRoom.id}`}
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Now
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Standard Rooms Grid */}
      {standardRooms.length > 0 && filter !== 'apartment' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {standardRooms.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-20">
          <p className="text-charcoal/60">No rooms available in this category.</p>
        </div>
      )}
    </div>
  );
}
