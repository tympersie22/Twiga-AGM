import type { Metadata } from 'next';
import './globals.css';
import AdminLayout from '@/components/AdminLayout';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'Twiga AGM Admin',
  description: 'Property management dashboard for Twiga Residence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
