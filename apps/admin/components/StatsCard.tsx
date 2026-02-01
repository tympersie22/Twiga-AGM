'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">
            {loading ? '...' : isMoney ? String(value) : value}
          </p>
        </div>
        <Icon className="w-8 h-8 text-green-500" />
      </div>
    </motion.div>
  );
}
