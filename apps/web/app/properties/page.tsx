'use client';

import { useState, useEffect } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';
import PropertyCard from '@/components/property/PropertyCard';
import { fetchProperties, type PropertySummary } from '@/lib/data';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filters = ['all', 'boutique', 'apartment', 'villa'];

  const filtered =
    filter === 'all' ? properties : properties.filter((p) => p.type === filter);

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <SectionLabel label="Our Properties" className="mb-4 block" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Our Properties
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Discover premium real estate in Zanzibar. From boutique residences to
            luxury apartments, find the perfect space.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex justify-center gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-accent text-surface-dark font-semibold'
                  : 'bg-surface-light border border-surface-border text-text-muted hover:border-accent/30 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-dark h-96 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">No properties found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
