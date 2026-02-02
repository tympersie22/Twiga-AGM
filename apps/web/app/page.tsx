'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Wifi, Wind, Tv, UtensilsCrossed, Car, Shield,
  Phone, Mail, Instagram, Facebook, ArrowRight, Menu, X
} from 'lucide-react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ContactDrawer } from '@/components/ContactDrawer';
import RoomShowcase from '@/components/RoomShowcase';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const amenities = [
    {
      icon: Wifi,
      title: 'High-Speed WiFi',
      desc: 'Complimentary fiber-optic internet throughout the property'
    },
    {
      icon: Wind,
      title: 'Climate Control',
      desc: 'Individual air conditioning in all rooms and common areas'
    },
    {
      icon: Tv,
      title: 'Entertainment',
      desc: 'Smart TVs with international channels and streaming'
    },
    {
      icon: UtensilsCrossed,
      title: 'Dining',
      desc: 'In-room dining and curated local restaurant recommendations'
    },
    {
      icon: Car,
      title: 'Transport',
      desc: 'Airport transfers and island excursion arrangements'
    },
    {
      icon: Shield,
      title: '24/7 Security',
      desc: 'Round-the-clock security and concierge services'
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isScrolled ? 'bg-deep-blue' : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <span className={`font-serif text-xl ${isScrolled ? 'text-white' : 'text-white'}`}>T</span>
              </div>
              <span className={`font-serif text-xl tracking-wide transition-colors duration-300 ${
                isScrolled ? 'text-deep-blue' : 'text-white'
              }`}>
                Twiga Residence
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#rooms"
                className={`text-sm tracking-wider uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-charcoal hover:text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                Rooms
              </Link>
              <Link
                href="#amenities"
                className={`text-sm tracking-wider uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-charcoal hover:text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                Amenities
              </Link>
              <Link
                href="#location"
                className={`text-sm tracking-wider uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-charcoal hover:text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                Location
              </Link>
              <button
                onClick={() => setIsContactOpen(true)}
                className="btn-primary text-sm"
              >
                Book Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-charcoal' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-charcoal' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-warm-gray"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="#rooms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-charcoal hover:text-gold transition-colors"
                >
                  Rooms
                </Link>
                <Link
                  href="#amenities"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-charcoal hover:text-gold transition-colors"
                >
                  Amenities
                </Link>
                <Link
                  href="#location"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-charcoal hover:text-gold transition-colors"
                >
                  Location
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsContactOpen(true);
                  }}
                  className="btn-primary w-full text-center"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <HeroCarousel />

      {/* Introduction Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Welcome to</span>
            <h2 className="font-serif text-4xl md:text-5xl text-deep-blue mt-4 mb-6">
              A Sanctuary in Zanzibar
            </h2>
            <p className="text-charcoal/70 text-lg leading-relaxed mb-8">
              Nestled in the heart of Zanzibar, Twiga Residence offers an intimate escape where
              traditional Swahili architecture meets contemporary luxury. Our boutique property
              features eight meticulously designed rooms and one exclusive apartment, each crafted
              to provide an unforgettable experience.
            </p>
            <div className="flex justify-center items-center gap-2 text-charcoal/60">
              <MapPin className="w-5 h-5 text-gold" />
              <span>Zanzibar, Tanzania</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="text-center mb-16"
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Accommodations</span>
            <h2 className="font-serif text-4xl md:text-5xl text-deep-blue mt-4">
              Our Rooms & Apartment
            </h2>
          </motion.div>
          <RoomShowcase />
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 px-4 sm:px-6 lg:px-8 bg-deep-blue text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="text-center mb-16"
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Services</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">
              Exceptional Amenities
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((amenity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.65, 0, 0.35, 1] }}
                className="group p-8 border border-white/10 hover:border-gold/50 hover:bg-white/5 transition-all duration-500"
              >
                <amenity.icon className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-serif text-xl mb-3">{amenity.title}</h3>
                <p className="text-white/60 leading-relaxed">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            >
              <span className="text-gold text-sm tracking-[0.3em] uppercase">Location</span>
              <h2 className="font-serif text-4xl md:text-5xl text-deep-blue mt-4 mb-6">
                Discover Zanzibar
              </h2>
              <p className="text-charcoal/70 text-lg leading-relaxed mb-8">
                Located in the enchanting island of Zanzibar, Twiga Residence offers easy access
                to pristine beaches, historic Stone Town, and the vibrant local culture. Experience
                the perfect blend of relaxation and adventure.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold font-serif">5</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Minutes to Beach</p>
                    <p className="text-charcoal/60 text-sm">Crystal clear waters await</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold font-serif">15</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Minutes to Stone Town</p>
                    <p className="text-charcoal/60 text-sm">UNESCO World Heritage Site</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold font-serif">30</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Minutes from Airport</p>
                    <p className="text-charcoal/60 text-sm">Complimentary transfers available</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setIsContactOpen(true)}
                className="btn-outline flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Directions
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
              className="relative aspect-square rounded-sm overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80"
                alt="Zanzibar Beach"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-sand">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <h2 className="font-serif text-4xl md:text-5xl text-deep-blue mb-6">
              Begin Your Journey
            </h2>
            <p className="text-charcoal/70 text-lg mb-10 max-w-2xl mx-auto">
              Reserve your sanctuary in Zanzibar and experience the perfect blend of luxury,
              comfort, and authentic African hospitality.
            </p>
            <motion.button
              onClick={() => setIsContactOpen(true)}
              className="btn-primary text-lg px-12 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reserve Your Stay
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <span className="font-serif text-xl text-white">T</span>
                </div>
                <span className="font-serif text-2xl">Twiga Residence</span>
              </div>
              <p className="text-white/60 leading-relaxed max-w-md mb-6">
                A boutique sanctuary in Zanzibar offering luxury accommodations with
                authentic African hospitality. Eight rooms and one exclusive apartment.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/twiga-agm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/twiga-agm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#rooms" className="text-white/60 hover:text-gold transition-colors">
                    Rooms & Apartment
                  </Link>
                </li>
                <li>
                  <Link href="#amenities" className="text-white/60 hover:text-gold transition-colors">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="#location" className="text-white/60 hover:text-gold transition-colors">
                    Location
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="text-white/60 hover:text-gold transition-colors">
                    Book Now
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif text-lg mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60">
                  <Mail className="w-4 h-4 text-gold" />
                  <a href="mailto:bookings@twiga-agm.com" className="hover:text-gold transition-colors">
                    bookings@twiga-agm.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Phone className="w-4 h-4 text-gold" />
                  <a href="tel:+255XXXXXXXXX" className="hover:text-gold transition-colors">
                    +255 XXX XXX XXX
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <MapPin className="w-4 h-4 text-gold mt-1" />
                  <span>Zanzibar, Tanzania</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Twiga Residence. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Drawer */}
      <ContactDrawer isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
