import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Twiga AGM Admin',
  description: 'Property management dashboard for Twiga Residence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
