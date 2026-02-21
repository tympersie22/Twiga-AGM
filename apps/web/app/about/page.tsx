import { Shield, TrendingUp, Heart, Target } from 'lucide-react';
import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';
import Stats from '@/components/home/Stats';

const values = [
  {
    icon: Shield,
    title: 'Quality',
    description:
      'Every room, every detail, every interaction — we maintain the highest standards of quality in everything we do.',
  },
  {
    icon: Heart,
    title: 'Trust',
    description:
      'We build lasting relationships with our guests and tenants through transparency, reliability, and genuine care.',
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description:
      'We are continuously expanding our portfolio with new properties, services, and investment opportunities.',
  },
  {
    icon: Target,
    title: 'Community',
    description:
      'We contribute to Zanzibar\'s development by creating premium living spaces and meaningful employment.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark to-surface" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        <Container className="relative">
          <SectionLabel label="About Twiga AGM" className="mb-4 block" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-3xl leading-tight">
            Building the Future of
            <br />
            <span className="text-gradient">Real Estate in Zanzibar</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Twiga AGM is a forward-thinking real estate company dedicated to creating premium
            living experiences in Zanzibar and beyond.
          </p>
        </Container>
      </section>

      {/* Story */}
      <section className="py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel label="Our Story" className="mb-4 block" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                From Vision to Reality
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  Twiga AGM was founded with a clear vision: to provide premium, modern
                  accommodation in Zanzibar that meets international standards while
                  celebrating Zanzibari hospitality.
                </p>
                <p>
                  Our flagship property, Twiga Residence, features 8 beautifully appointed
                  standard rooms and 1 cozy apartment complete with a kitchen and
                  private balcony. Each space is designed with comfort, style, and functionality
                  in mind.
                </p>
                <p>
                  But this is just the beginning. Twiga AGM is growing. We have new buildings
                  in development, and we&apos;re expanding into long-term rentals and premium
                  apartments for sale — creating diverse opportunities for guests, tenants,
                  and investors alike.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-surface-light border border-surface-border overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80"
                  alt="Zanzibar architecture"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-surface-dark/80 backdrop-blur-sm rounded-2xl p-6 border border-surface-border">
                    <p className="font-mono text-accent text-sm mb-2">Our Mission</p>
                    <p className="text-white text-sm leading-relaxed">
                      To redefine real estate in East Africa through quality, innovation,
                      and exceptional service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <Stats />

      {/* Values */}
      <section className="py-24">
        <Container>
          <div className="text-center mb-14">
            <SectionLabel label="Our Values" className="mb-4 block" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Drives Us
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Our core values guide every decision and shape the experiences we create.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="card-dark p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Vision */}
      <section className="py-24 bg-surface-dark">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel label="Our Vision" className="mb-4 block" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What&apos;s Next for Twiga AGM
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              We&apos;re building more than properties — we&apos;re building a portfolio of
              premium living options. New developments are on the way, including apartments
              for long-term rental and sale. Our goal is to be East Africa&apos;s most
              trusted real estate brand.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface-light rounded-2xl border border-surface-border">
                <p className="text-2xl font-bold text-accent mb-2">New Buildings</p>
                <p className="text-sm text-text-muted">More premium properties coming to Zanzibar</p>
              </div>
              <div className="p-6 bg-surface-light rounded-2xl border border-surface-border">
                <p className="text-2xl font-bold text-accent mb-2">Long-Term Rentals</p>
                <p className="text-sm text-text-muted">Monthly and annual leases for rooms and apartments</p>
              </div>
              <div className="p-6 bg-surface-light rounded-2xl border border-surface-border">
                <p className="text-2xl font-bold text-accent mb-2">Apartments for Sale</p>
                <p className="text-sm text-text-muted">Own premium real estate in Zanzibar</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
