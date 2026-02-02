import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Twiga Residence | Luxury Boutique Hotel in Zanzibar',
  description: 'Experience unparalleled luxury at Twiga Residence. A boutique sanctuary in Zanzibar featuring 8 elegant rooms and a cozy apartment with breathtaking views.',
  keywords: 'luxury hotel, zanzibar, boutique hotel, accommodation, tanzania, beach resort',
  openGraph: {
    title: 'Twiga Residence | Luxury Boutique Hotel in Zanzibar',
    description: 'Experience unparalleled luxury at Twiga Residence. A boutique sanctuary in Zanzibar.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <meta name="theme-color" content="#10103D" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
