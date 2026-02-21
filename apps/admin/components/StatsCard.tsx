'use client';

import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  loading?: boolean;
  footerText?: string;
  trend?: number;
}

export default function StatsCard({ icon: Icon, label, value, loading, footerText, trend }: StatsCardProps) {
  const isPositive = (trend || 0) >= 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#dce5db] hover:border-[#cddbcf] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[#8ea08f] text-xs font-semibold uppercase tracking-[0.06em]">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-[#edf4ec] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#5d785f]" />
        </div>
      </div>

      <p className="text-[44px] leading-none font-semibold text-[#1f2f23] mt-3">{loading ? '...' : value}</p>

      {(footerText || trend !== undefined) && (
        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <p className="text-[#8ea08f]">{footerText || ''}</p>
          {trend !== undefined ? (
            <span className={`font-semibold ${isPositive ? 'text-[#6c8e6c]' : 'text-[#bf6358]'}`}>
              {isPositive ? '+' : ''}
              {trend}%
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
