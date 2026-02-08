import Hero from '@/components/home/Hero';
import AboutPreview from '@/components/home/AboutPreview';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import PropertyTypes from '@/components/home/PropertyTypes';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <FeaturedProperties />
      <Stats />
      <PropertyTypes />
      <Testimonials />
      <CTABanner />
    </>
  );
}
