'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { TwigaRoom } from '@twiga/shared/types';
import { formatCurrency } from '@twiga/shared/utils/formatting';
import { Users, Bed, Bath, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: TwigaRoom;
  index?: number;
}

// Placeholder images for rooms without images
const placeholderImages: Record<string, string> = {
  standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  apartment: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
};

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const imageUrl = room.images?.[0] || placeholderImages[room.type] || placeholderImages.standard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.65, 0, 0.35, 1] }}
      className="group relative bg-white overflow-hidden rounded-sm shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Room Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-gold/90 text-white text-xs font-medium uppercase tracking-wider">
            {room.type}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 text-right">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-sm">
            <p className="text-lg font-serif text-deep-blue">
              {formatCurrency(room.basePrice, 'TZS')}
            </p>
            <p className="text-xs text-charcoal/60">per night</p>
          </div>
        </div>

        {/* Bottom Content - Visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-luxury">
          <Link
            href={`/booking?roomId=${room.id}`}
            className="flex items-center justify-center gap-2 w-full bg-gold text-white py-3 font-medium tracking-wide hover:bg-gold-light transition-colors"
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Room Name */}
        <h3 className="font-serif text-xl text-deep-blue mb-2 group-hover:text-gold transition-colors duration-300">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-charcoal/70 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Room Details */}
        <div className="flex items-center gap-6 text-sm text-charcoal/60 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gold" />
            <span>{room.maxGuests} Guests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-gold" />
            <span>{room.bedroomCount} Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-gold" />
            <span>{room.bathroomCount} Bath</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-warm-gray">
          {room.amenities.slice(0, 4).map((amenity, i) => (
            <span
              key={i}
              className="text-xs text-charcoal/50 bg-cream px-2 py-1 rounded-sm"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="text-xs text-gold">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Discover Link */}
      <Link
        href={`/booking?roomId=${room.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${room.name}`}
      />
    </motion.div>
  );
}
