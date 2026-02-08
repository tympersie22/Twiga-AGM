import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Twiga AGM | Premium Real Estate in Dar es Salaam',
  description:
    'Discover premium living at Twiga AGM. Luxury rooms, apartments, and properties in Dar es Salaam, Tanzania. Short-term stays, long-term rentals, and properties for sale.',
  keywords:
    'twiga agm, real estate, dar es salaam, tanzania, luxury accommodation, apartments, rooms, property',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
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
