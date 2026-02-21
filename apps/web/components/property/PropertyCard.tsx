'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatting';
import type { PropertySummary } from '@/lib/data';

interface PropertyCardProps {
  property: PropertySummary;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group card-dark flex flex-col"
    >
      {/* Image area */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80"
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:from-accent/10 transition-all duration-500" />
        <div className="gradient-overlay" />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs font-mono text-accent border border-accent/20">
            {property.type}
          </span>
        </div>

        {/* Room count */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs text-white border border-white/10 flex items-center gap-1.5">
            <Home className="w-3 h-3" />
            {property.totalRooms} rooms
          </span>
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {property.location.city}, {property.location.country}
              </div>
            </div>
            {property.priceFrom > 0 && (
              <div className="text-right">
                <p className="text-xs text-text-muted font-mono">from</p>
                <p className="text-lg font-bold text-accent">
                  {formatCurrency(property.priceFrom, 'TZS')}
                </p>
                <p className="text-xs text-text-muted">/night</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
          {property.shortDescription || property.description?.slice(0, 120)}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          <span className="text-xs text-text-muted font-mono">
            {property.location.city}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-accent group-hover:text-accent-light transition-colors">
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
