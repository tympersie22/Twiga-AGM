'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Wifi,
  Wind,
  Tv,
  ChefHat,
  Columns,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';
import RoomCard from '@/components/room/RoomCard';
import { fetchProperty, fetchRooms, type PropertySummary } from '@/lib/data';
import type { TwigaRoom } from '@twiga/shared/types';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  'Flat screen TV': Tv,
  Kitchen: ChefHat,
  Balcony: Columns,
};

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [propData, roomData] = await Promise.all([
          fetchProperty(slug),
          fetchRooms(slug),
        ]);
        setProperty(propData);
        setRooms(roomData);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // Collect all unique amenities from rooms
  const allAmenities = [...new Set(rooms.flatMap((r) => r.amenities))];

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <Container>
          <div className="animate-pulse space-y-8">
            <div className="h-80 bg-surface-light rounded-3xl" />
            <div className="h-8 w-1/3 bg-surface-light rounded" />
            <div className="h-4 w-2/3 bg-surface-light rounded" />
          </div>
        </Container>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Property Not Found</h1>
            <p className="text-text-muted mb-6">The property you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/properties" className="btn-primary">
              Back to Properties
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container>
        {/* Back link */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Properties</span>
        </Link>

        {/* Hero */}
        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-12 bg-surface-light border border-surface-border">
          <img
            src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80"
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <div className="gradient-overlay" />

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-accent/20 rounded-full text-xs font-mono text-accent border border-accent/20 capitalize">
                {property.type}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin className="w-4 h-4 text-accent" />
              <span>{property.location.city}, {property.location.country}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mb-16">
          <SectionLabel label="About This Property" className="mb-4 block" />
          <p className="text-text-secondary leading-relaxed max-w-3xl text-lg">
            {property.description}
          </p>
        </section>

        {/* Rooms Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <SectionLabel label="Rooms & Apartments" className="mb-3 block" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Choose Your Room
              </h2>
            </div>
            <span className="text-text-muted text-sm font-mono">
              {rooms.length} available
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} propertySlug={slug} />
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="mb-16">
          <SectionLabel label="Amenities" className="mb-4 block" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            What&apos;s Included
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allAmenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Wifi;
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-4 bg-surface-light rounded-xl border border-surface-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm text-white">{amenity}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <SectionLabel label="Contact" className="mb-4 block" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="tel:+255000000000"
              className="flex items-center gap-4 p-6 card-dark"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">Phone</p>
                <p className="text-white font-medium">+255 XXX XXX XXX</p>
              </div>
            </a>
            <a
              href="mailto:bookings@twiga-agm.com"
              className="flex items-center gap-4 p-6 card-dark"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">Email</p>
                <p className="text-white font-medium">bookings@twiga-agm.com</p>
              </div>
            </a>
            <a
              href="https://wa.me/255000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 card-dark"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">WhatsApp</p>
                <p className="text-white font-medium">Chat with us</p>
              </div>
            </a>
          </div>
        </section>
      </Container>
    </div>
  );
}
