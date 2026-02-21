'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Container from '@/components/ui/Container';
import { submitContactInquiry } from '@/lib/contact-service';
import { contactHref, siteConfig } from '@/lib/site-config';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    value: siteConfig.contact.phone,
    href: contactHref.phone,
  },
  {
    icon: Mail,
    title: 'Email',
    value: siteConfig.contact.email,
    href: contactHref.email,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: 'Chat with us',
    href: contactHref.whatsapp,
  },
  {
    icon: MapPin,
    title: 'Address',
    value: siteConfig.contact.address,
    href: '#',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitContactInquiry(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel label="Get in Touch" className="mb-4 block" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Have questions about our properties or want to make a booking?
            We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="card-dark p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-6">
                  <Send className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
                <p className="text-text-secondary mb-6">
                  Thank you for reaching out. We&apos;ll get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setError('');
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="btn-outline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted font-mono mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-dark"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted font-mono mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-dark"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="input-dark"
                    placeholder="What is this about?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="input-dark resize-none"
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center gap-2 disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((info) => (
              info.href === '#' ? (
                <div key={info.title} className="flex items-center gap-4 p-6 card-dark group">
                  <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-mono mb-1">{info.title}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </div>
              ) : (
                <a
                  key={info.title}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 p-6 card-dark group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-mono mb-1">{info.title}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </a>
              )
            ))}

            {/* Office hours */}
            <div className="card-dark p-6">
              <p className="text-xs text-text-muted font-mono mb-3">Office Hours</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Monday - Friday</span>
                  <span className="text-white">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Saturday</span>
                  <span className="text-white">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Sunday</span>
                  <span className="text-white">10:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
