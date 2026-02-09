'use client';

import { Star } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Nairobi, Kenya',
    rating: 5,
    text: 'Absolutely stunning property. The room was immaculate, the AC worked perfectly, and the staff was incredibly welcoming. Will definitely return!',
  },
  {
    name: 'James K.',
    location: 'London, UK',
    rating: 5,
    text: 'Best boutique accommodation in Zanzibar. The apartment with the balcony view was spectacular. Felt like a home away from home.',
  },
  {
    name: 'Amina H.',
    location: 'Zanzibar, TZ',
    rating: 5,
    text: 'We hosted family from abroad and they loved Twiga Residence. Clean, modern, and perfectly located. The kitchen in the apartment was a huge plus.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="text-center mb-14">
          <SectionLabel label="Guest Reviews" className="mb-4 block" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Guests Say
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Trusted by guests from around the world.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="card-dark p-8">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-surface-border">
                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
                  <span className="text-accent font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{testimonial.name}</p>
                  <p className="text-text-muted text-xs font-mono">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
