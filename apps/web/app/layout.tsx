import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Twiga Residence - Luxury Stays in Dar es Salaam',
  description: 'Book your perfect stay at Twiga Residence. Luxury boutique accommodations with modern amenities.',
  keywords: 'hotel, booking, dar es salaam, zanzibar, accommodation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2d5f2e" />
      </head>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
