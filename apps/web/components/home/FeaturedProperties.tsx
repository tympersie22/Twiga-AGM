'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Home } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';

const properties = [
  {
    name: 'Twiga Residence',
    slug: 'twiga-residence',
    location: 'Zanzibar, Tanzania',
    type: 'Boutique Residence',
    rooms: 9,
    priceFrom: 'TZS 150,000',
    description: '8 standard rooms and 1 cozy apartment with kitchen and private balcony.',
    tags: ['Short Stay', 'Long Term'],
  },
  {
    name: 'Coming Soon',
    slug: '',
    location: 'Zanzibar, Tanzania',
    type: 'New Development',
    rooms: 0,
    priceFrom: 'TBA',
    description: 'New premium apartments and rental units. Register your interest today.',
    tags: ['Apartments', 'For Sale'],
    comingSoon: true,
  },
];

export default function FeaturedProperties() {
  return (
    <section className="py-24 md:py-32 bg-surface-dark">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <SectionLabel label="Our Properties" className="mb-4 block" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Featured Properties
            </h2>
          </div>
          <Link href="/properties" className="btn-ghost gap-2">
            View All Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <div
              key={property.name}
              className={`group relative rounded-3xl overflow-hidden border border-surface-border bg-surface-light transition-all duration-500 hover:border-accent/30 ${
                property.comingSoon ? 'opacity-70' : ''
              }`}
            >
              {/* Image area */}
              <div className="relative h-64 md:h-72">
                {!property.comingSoon ? (
                  <Image
                    src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80"
                    alt={property.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-lighter to-surface-light" />
                )}
                {!property.comingSoon && (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
                )}
                <div className="gradient-overlay" />

                {/* Property type badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-surface-dark/70 backdrop-blur-sm rounded-full text-xs font-mono text-accent border border-accent/20">
                    {property.type}
                  </span>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{property.name}</h3>
                      <div className="flex items-center gap-1.5 text-text-muted text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.location}
                      </div>
                    </div>
                    {!property.comingSoon && (
                      <div className="text-right">
                        <p className="text-xs text-text-muted font-mono">from</p>
                        <p className="text-lg font-bold text-accent">{property.priceFrom}</p>
                        <p className="text-xs text-text-muted">/night</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom section */}
              <div className="p-6">
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {property.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {property.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-surface-lighter rounded-full text-xs text-text-muted border border-surface-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {!property.comingSoon ? (
                    <Link
                      href={`/properties/${property.slug}`}
                      className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-light transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-text-muted">
                      <Home className="w-3.5 h-3.5" />
                      Notify Me
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
