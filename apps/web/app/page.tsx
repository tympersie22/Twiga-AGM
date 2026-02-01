'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Wind, Tv } from 'lucide-react';
import QuickBooking from '@/components/QuickBooking';
import RoomShowcase from '@/components/RoomShowcase';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-700 rounded-full" />
              <span className="font-bold text-lg text-gray-900">Twiga Residence</span>
            </div>
            <div className="flex space-x-6">
              <Link href="#rooms" className="text-gray-600 hover:text-gray-900 transition">Rooms</Link>
              <Link href="#amenities" className="text-gray-600 hover:text-gray-900 transition">Amenities</Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <motion.section
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Twiga Residence</h1>
              <p className="text-xl text-gray-600 mb-4">
                Experience luxury accommodation in the heart of Dar es Salaam. 8 rooms and 1 spacious apartment.
              </p>
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">4.8 (120+ reviews)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5 text-green-700" />
                <span>Dar es Salaam, Tanzania</span>
              </div>
            </motion.div>
            <motion.div
              className="relative h-96 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-gray-400 text-lg">Twiga Residence</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="relative -mt-12 px-4 sm:px-6 lg:px-8 pb-12">
        <QuickBooking />
      </section>

      <section id="rooms" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Rooms & Apartment
          </motion.h2>
          <RoomShowcase />
        </div>
      </section>

      <section id="amenities" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            World-Class Amenities
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Wifi, title: 'High-Speed WiFi', desc: 'Fiber internet throughout the property' },
              { icon: Wind, title: 'Air Conditioning', desc: 'Climate control in all rooms' },
              { icon: Tv, title: 'Entertainment', desc: 'Smart TVs with streaming services' },
            ].map((amenity, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <amenity.icon className="w-12 h-12 text-green-700 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{amenity.title}</h3>
                <p className="text-gray-600">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Have Questions?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <p className="text-sm text-green-100 mb-2">Email</p>
              <p className="text-lg font-semibold">bookings@twiga-agm.com</p>
            </div>
            <div>
              <p className="text-sm text-green-100 mb-2">WhatsApp</p>
              <p className="text-lg font-semibold">+255 XXX XXX XXX</p>
            </div>
            <div>
              <p className="text-sm text-green-100 mb-2">Phone</p>
              <p className="text-lg font-semibold">+255 XXX XXX XXX</p>
            </div>
          </div>
          <a
            href="https://wa.me/255XXXXXXXXX?text=I'd%20like%20to%20book%20a%20room%20at%20Twiga%20Residence"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Twiga Residence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
