import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Globe } from 'lucide-react';
import { contactHref, siteConfig } from '@/lib/site-config';

const footerLinks = {
  properties: [
    { label: 'Twiga Residence', href: '/properties/twiga-residence' },
    { label: 'All Properties', href: '/properties' },
    { label: 'Rooms', href: '/properties/twiga-residence' },
    { label: 'Apartments', href: '/properties/twiga-residence' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-dark border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-surface-dark font-bold text-lg">T</span>
              </div>
              <div>
                <span className="font-bold text-lg text-white">Twiga</span>
                <span className="font-light text-lg text-accent ml-1">AGM</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Premium real estate in Zanzibar. Luxury rooms, apartments, and properties for
              short-term stays, long-term rentals, and sale.
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h4 className="section-label mb-6">Properties</h4>
            <ul className="space-y-3">
              {footerLinks.properties.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="section-label mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={contactHref.email}
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4 text-accent" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={contactHref.phone}
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-text-muted">
                  <MapPin className="w-4 h-4 text-accent mt-0.5" />
                  {siteConfig.contact.address}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Twiga AGM. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Premium Real Estate &middot; Zanzibar, Tanzania
          </p>
        </div>
      </div>
    </footer>
  );
}
