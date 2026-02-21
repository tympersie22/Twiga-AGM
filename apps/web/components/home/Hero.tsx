'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1920&q=80"
          alt="Zanzibar coastline"
          fill
          priority
          sizes="100vw"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dark/95 via-surface-dark/80 to-surface-dark/60" />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Accent glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-3xl">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="section-label">Premium Real Estate</span>
            <div className="h-px w-12 bg-accent/40" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Discover Premium
            <br />
            Living in{' '}
            <span className="text-gradient">Zanzibar</span>
          </h1>

          {/* Motto */}
          <p
            className="text-accent font-mono text-base md:text-lg tracking-widest uppercase mb-4 font-semibold"
            style={{ textShadow: '0 0 20px rgba(201,169,110,0.4), 0 2px 4px rgba(0,0,0,0.5)' }}
          >
            &mdash; Future is Now &mdash;
          </p>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed">
            Experience luxury accommodation and world-class real estate. From short-term stays
            to long-term rentals and premium apartments for sale.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/properties" className="btn-primary gap-2">
              Explore Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-outline gap-2">
              Get in Touch
            </Link>
          </div>

          {/* Location badge */}
          <div className="flex items-center gap-2 text-text-muted">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm">Zanzibar, Tanzania</span>
            <span className="mx-2 text-surface-border">|</span>
            <span className="text-sm">8 Rooms & 1 Apartment</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
