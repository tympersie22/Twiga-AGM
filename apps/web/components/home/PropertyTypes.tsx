'use client';

import { Bed, Key, Building } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';

const types = [
  {
    icon: Bed,
    title: 'Short-Term Stays',
    description:
      'Comfortable rooms and apartments for nightly or weekly stays. Perfect for travelers, business trips, and city escapes.',
    features: ['Flexible booking', 'Daily housekeeping', 'All amenities included'],
  },
  {
    icon: Key,
    title: 'Long-Term Rentals',
    description:
      'Secure your ideal living space with our long-term rental options. Monthly and annual leases available for rooms and apartments.',
    features: ['Monthly leases', 'Competitive rates', 'Maintenance included'],
  },
  {
    icon: Building,
    title: 'Apartments for Sale',
    description:
      'Invest in premium real estate. Own a luxury apartment in Zanzibar with modern finishes and prime locations.',
    features: ['Freehold ownership', 'Modern design', 'High ROI potential'],
  },
];

export default function PropertyTypes() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="text-center mb-14">
          <SectionLabel label="What We Offer" className="mb-4 block" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tailored to Your Needs
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Whether you need a short getaway, a place to call home, or a smart investment
            — Twiga AGM has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {types.map((type, i) => (
            <div
              key={type.title}
              className="card-dark p-8 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <type.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {type.description}
              </p>
              <ul className="space-y-2">
                {type.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
