'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, Shield, TrendingUp } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';

const highlights = [
  {
    icon: Building2,
    title: 'Premium Properties',
    desc: 'Carefully curated real estate in prime Zanzibar locations.',
  },
  {
    icon: Shield,
    title: 'Trusted & Reliable',
    desc: 'Professional property management with transparent operations.',
  },
  {
    icon: TrendingUp,
    title: 'Growing Portfolio',
    desc: 'Expanding with new buildings, rentals, and apartments for sale.',
  },
];

export default function AboutPreview() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-surface-light border border-surface-border overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80"
                alt="Zanzibar building exterior"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-surface-dark/80 backdrop-blur-sm rounded-2xl p-6 border border-surface-border">
                  <p className="font-mono text-accent text-sm mb-1">Future is Now</p>
                  <p className="text-white font-semibold">Building Premium Living Spaces</p>
                </div>
              </div>
            </div>
            {/* Floating accent card */}
            <div className="absolute -top-4 -right-4 bg-accent rounded-2xl p-5 shadow-lg hidden lg:block">
              <p className="text-surface-dark font-bold text-3xl">9</p>
              <p className="text-surface-dark/70 text-sm font-medium">Rooms & Apartment</p>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <SectionLabel label="About Us" className="mb-4 block" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Twiga AGM — Redefining
              <br />
              Real Estate in Zanzibar
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Twiga AGM is a forward-thinking real estate company based in Zanzibar.
              Our flagship property, Twiga Residence, offers 8 beautifully appointed rooms
              and a cozy apartment with kitchen and private balcony. With more
              buildings on the horizon, we&apos;re expanding into long-term rentals and
              premium apartments for sale.
            </p>

            <div className="space-y-6 mb-10">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/about" className="btn-outline gap-2 inline-flex">
              Learn More About Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
