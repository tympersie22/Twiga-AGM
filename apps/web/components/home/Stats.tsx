'use client';

import Container from '@/components/ui/Container';

const stats = [
  { value: '1', label: 'Property', suffix: '' },
  { value: '9', label: 'Rooms & Apartment', suffix: '' },
  { value: '100', label: 'Happy Guests', suffix: '+' },
  { value: '4.8', label: 'Guest Rating', suffix: '/5' },
];

export default function Stats() {
  return (
    <section className="py-16 border-y border-surface-border bg-surface-dark">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-white">{stat.value}</span>
                <span className="text-2xl font-bold text-accent">{stat.suffix}</span>
              </div>
              <p className="text-sm text-text-muted font-mono tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
