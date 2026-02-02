'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDrawer({ isOpen, onClose }: ContactDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry. We will contact you shortly.');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-cream border-b border-warm-gray px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-deep-blue">Get in Touch</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-warm-gray rounded-full transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5 text-charcoal" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Quick Contact Options */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-4">
                  Quick Contact
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://wa.me/255XXXXXXXXX?text=I'd like to book a room at Twiga Residence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal group-hover:text-gold transition-colors">
                        WhatsApp
                      </p>
                      <p className="text-sm text-charcoal/60">Chat with us instantly</p>
                    </div>
                  </a>

                  <a
                    href="tel:+255XXXXXXXXX"
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-deep-blue rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal group-hover:text-gold transition-colors">
                        Call Us
                      </p>
                      <p className="text-sm text-charcoal/60">+255 XXX XXX XXX</p>
                    </div>
                  </a>

                  <a
                    href="mailto:bookings@twiga-agm.com"
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal group-hover:text-gold transition-colors">
                        Email
                      </p>
                      <p className="text-sm text-charcoal/60">bookings@twiga-agm.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-warm-gray" />
                <span className="text-sm text-charcoal/40">or</span>
                <div className="flex-1 h-px bg-warm-gray" />
              </div>

              {/* Request Callback Form */}
              <div>
                <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-4">
                  Request a Callback
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg focus:outline-none focus:border-gold transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg focus:outline-none focus:border-gold transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg focus:outline-none focus:border-gold transition-colors"
                      placeholder="+255 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Tell us about your travel plans..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Request Callback
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
