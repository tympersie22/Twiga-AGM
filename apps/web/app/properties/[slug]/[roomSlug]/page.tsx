'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Bed,
  Bath,
  Wifi,
  Wind,
  Tv,
  ChefHat,
  Columns3,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';
import { fetchRoom, fetchProperty, type PropertySummary } from '@/lib/data';
import { formatCurrency } from '@twiga/shared/utils/formatting';
import type { TwigaRoom } from '@twiga/shared/types';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  'Flat screen TV': Tv,
  Kitchen: ChefHat,
  Balcony: Columns3,
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const roomSlug = params.roomSlug as string;

  const [room, setRoom] = useState<TwigaRoom | null>(null);
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [roomData, propData] = await Promise.all([
          fetchRoom(slug, roomSlug),
          fetchProperty(slug),
        ]);
        setRoom(roomData);
        setProperty(propData);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, roomSlug]);

  const handleBookNow = () => {
    const params = new URLSearchParams({ roomId: roomSlug });
    if (checkIn) params.set('checkIn', new Date(checkIn).getTime().toString());
    if (checkOut) params.set('checkOut', new Date(checkOut).getTime().toString());
    if (guests) params.set('guests', guests.toString());
    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <Container>
          <div className="animate-pulse space-y-8">
            <div className="h-80 bg-surface-light rounded-3xl" />
            <div className="h-8 w-1/3 bg-surface-light rounded" />
          </div>
        </Container>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Room Not Found</h1>
            <Link href={`/properties/${slug}`} className="btn-primary">
              Back to Property
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const isApartment = room.type === 'apartment';

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/properties" className="hover:text-accent transition-colors">
            Properties
          </Link>
          <span>/</span>
          <Link
            href={`/properties/${slug}`}
            className="hover:text-accent transition-colors"
          >
            {property?.name || slug}
          </Link>
          <span>/</span>
          <span className="text-white">{room.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden bg-surface-light border border-surface-border">
              {room.images?.[0] ? (
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
              )}
              <div className="gradient-overlay opacity-40" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs font-mono text-accent border border-accent/20 capitalize">
                  {room.type}
                </span>
                {isApartment && (
                  <span className="px-3 py-1.5 bg-accent/20 backdrop-blur-sm rounded-full text-xs font-mono text-accent border border-accent/30">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Name & Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {room.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-accent" />
                  Up to {room.maxGuests} guests
                </span>
                {room.bedroomCount && (
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-accent" />
                    {room.bedroomCount} {room.bedroomCount === 1 ? 'bedroom' : 'bedrooms'}
                  </span>
                )}
                {room.bathroomCount && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-accent" />
                    {room.bathroomCount} {room.bathroomCount === 1 ? 'bathroom' : 'bathrooms'}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <section>
              <SectionLabel label="Description" className="mb-4 block" />
              <p className="text-text-secondary leading-relaxed text-lg">
                {room.description}
              </p>
              {isApartment && (
                <div className="mt-4 p-4 bg-accent-muted rounded-xl border border-accent/20">
                  <p className="text-accent font-medium text-sm">
                    ★ This cozy apartment features a kitchen and private balcony — perfect for extended stays and families.
                  </p>
                </div>
              )}
            </section>

            {/* Amenities */}
            <section>
              <SectionLabel label="Amenities" className="mb-4 block" />
              <h2 className="text-xl font-bold text-white mb-6">
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-4 bg-surface-light rounded-xl border border-surface-border"
                    >
                      <Icon className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-sm text-white">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 card-dark p-6 space-y-6">
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">Price per night</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {formatCurrency(room.basePrice, 'TZS')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-2">
                    Check In
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-2">
                    Check Out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="input-dark"
                  >
                    {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {checkIn && checkOut && (
                <div className="p-4 bg-surface-lighter rounded-xl border border-surface-border space-y-2 text-sm">
                  <div className="flex justify-between text-text-muted">
                    <span>
                      {Math.ceil(
                        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                          86400000
                      )}{' '}
                      nights
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(
                        room.basePrice *
                          Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                              86400000
                          ),
                        'TZS'
                      )}
                    </span>
                  </div>
                  <div className="border-t border-surface-border pt-2 flex justify-between">
                    <span className="font-medium text-white">Total</span>
                    <span className="font-bold text-accent">
                      {formatCurrency(
                        room.basePrice *
                          Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                              86400000
                          ),
                        'TZS'
                      )}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                className="btn-primary w-full justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </button>

              <p className="text-xs text-text-muted text-center">
                50% deposit required to confirm booking
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
