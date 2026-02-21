import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Twiga AGM | Premium Real Estate in Zanzibar',
  description:
    'Discover premium living at Twiga AGM. Luxury rooms, apartments, and properties in Zanzibar. Short-term stays, long-term rentals, and properties for sale. Future is Now.',
  keywords:
    'twiga agm, real estate, zanzibar, tanzania, luxury accommodation, apartments, rooms, property',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111111" />
      </head>
      <body className="font-display antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
