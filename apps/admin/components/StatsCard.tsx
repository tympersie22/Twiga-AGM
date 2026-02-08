'use client';

import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  loading?: boolean;
  isMoney?: boolean;
}

export default function StatsCard({ icon: Icon, label, value, loading, isMoney }: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">
            {loading ? '...' : isMoney ? String(value) : value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
}
