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
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/payments', label: 'Payments', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Twiga AGM</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property selector */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <Building2 className="w-4 h-4 text-accent" />
            <select className="bg-transparent text-white text-sm flex-1 outline-none cursor-pointer">
              <option value="twiga-residence">Twiga Residence</option>
            </select>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 px-4 py-3 text-gray-400">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-accent">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">admin@twiga-agm.com</p>
            </div>
            <button className="text-gray-400 hover:text-red-400 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-white font-semibold">Twiga AGM Admin</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
