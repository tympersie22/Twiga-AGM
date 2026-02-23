'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  Loader2,
  Bell,
  HelpCircle,
  Settings,
  UserCog,
  Megaphone,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Daily Operation',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/bookings', label: 'Reservation', icon: Calendar },
      { href: '/rooms', label: 'Room Operation', icon: BedDouble },
      { href: '/bookings', label: 'Manage Guests', icon: UserCog },
      { href: '/payments', label: 'Promotions', icon: Megaphone },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { href: '/payments', label: 'Report', icon: BarChart3 },
      { href: '/rooms', label: 'Maintenance', icon: Wrench },
    ],
  },
  {
    title: 'System Options',
    items: [
      { href: '/logs', label: 'Activity Logs', icon: FileText },
      { href: '/payments', label: 'Manage Platform', icon: ClipboardList },
      { href: '/payments', label: 'Upgrade Plan', icon: CreditCard },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, displayName, loading, signOut } = useAuth();

  if (pathname === '/login') return <>{children}</>;

  if (loading) {
    return (
      <div className="h-screen bg-[#f2f3f1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#74926c] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen bg-[#f2f3f1] flex overflow-hidden text-[#1d2a22]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-[#fafbf9] border-r border-[#dde3db] transform transition-transform duration-200 lg:translate-x-0 flex flex-col shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#e5ebe3]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#dce9d8] rounded-lg flex items-center justify-center">
              <span className="text-[#4f7252] font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-[#1d2a22] font-semibold text-[22px] leading-tight">Twiga</h1>
              <p className="text-[#738275] text-xs">Admin Workspace</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#738275] hover:text-[#1d2a22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#eef2eb] rounded-xl border border-[#d9e0d6]">
            <Building2 className="w-4 h-4 text-[#5d785f]" />
            <select className="bg-transparent text-[#2d3a31] text-sm flex-1 outline-none cursor-pointer">
              <option value="twiga-residence">Twiga Residence</option>
            </select>
          </div>
        </div>

        <nav className="px-4 py-2 space-y-4 flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-2 pb-2 text-[11px] tracking-[0.08em] uppercase text-[#94a294] font-semibold">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={`${section.title}-${item.label}`}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white border border-[#dce5d9] text-[#1f2e24] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                          : 'text-[#556559] hover:bg-[#f1f5ef]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#6a826c]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 pt-1 pb-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#556559] hover:bg-[#f1f5ef] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#556559] hover:bg-[#f1f5ef] transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Support</span>
          </button>
        </div>

        <div className="p-4 border-t border-[#e5ebe3]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-[#d9e5d7] rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-[#4f7252]">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d2a22] truncate">{displayName}</p>
              <p className="text-xs text-[#7e8f80] truncate">{user?.email || 'admin@twiga-agm.com'}</p>
            </div>
            <button onClick={signOut} title="Sign out" className="text-[#7e8f80] hover:text-[#bf5342] transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#fafbf9] border-b border-[#dde3db] px-5 py-4 flex items-center lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#738275] hover:text-[#1d2a22] mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-[#1d2a22] font-semibold">Twiga Admin</h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
