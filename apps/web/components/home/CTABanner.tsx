'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-surface-dark">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <p className="section-label mb-6">Start Your Journey</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Find Your
          <br />
          Perfect Stay?
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
          Whether it&apos;s a night, a month, or a lifetime — explore our properties and
          find the space that&apos;s right for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties" className="btn-primary gap-2">
            Browse Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/contact" className="btn-outline gap-2">
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  );
}
