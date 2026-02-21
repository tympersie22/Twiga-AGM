'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Wifi, Wind, Tv, ChefHat, Columns, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatting';
import type { TwigaRoom } from '@/lib/shared/types';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  'Flat screen TV': Tv,
  Kitchen: ChefHat,
  Balcony: Columns,
};

interface RoomCardProps {
  room: TwigaRoom;
  propertySlug: string;
}

export default function RoomCard({ room, propertySlug }: RoomCardProps) {
  return (
    <Link
      href={`/properties/${propertySlug}/${room.id}`}
      className="group card-dark flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-lighter to-surface-light" />
        {room.images?.[0] ? (
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:from-accent/10 transition-all duration-500" />
        )}
        <div className="gradient-overlay opacity-60" />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs font-mono text-accent border border-accent/20 capitalize">
            {room.type}
          </span>
        </div>

        {/* Guest count */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs text-white border border-white/10 flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            {room.maxGuests}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
          {room.name}
        </h3>
        <p className="text-sm text-text-muted mb-4 leading-relaxed line-clamp-2">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {room.amenities.slice(0, 4).map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <span
                key={amenity}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-lighter rounded-lg text-xs text-text-muted border border-surface-border"
              >
                {Icon && <Icon className="w-3 h-3 text-accent" />}
                {amenity}
              </span>
            );
          })}
          {room.amenities.length > 4 && (
            <span className="px-2.5 py-1 text-xs text-text-muted">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-border">
          <div>
            <span className="text-xl font-bold text-white">
              {formatCurrency(room.basePrice, 'TZS')}
            </span>
            <span className="text-xs text-text-muted ml-1">/night</span>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-accent group-hover:text-accent-light transition-colors">
            View
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
