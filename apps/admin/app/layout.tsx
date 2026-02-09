import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdminLayout from '@/components/AdminLayout';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Twiga AGM Admin',
  description: 'Property management dashboard for Twiga Residence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
