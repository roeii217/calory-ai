'use client';

import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-white/5 rounded-3xl ${className}`}
    />
  );
}

export function SkeletonText({ width = 'w-full', className = '' }: { width?: string; className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-white/8 rounded-lg h-4 ${width} ${className}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="px-5 space-y-4 pt-6">
      <SkeletonCard className="h-40" />
      <div className="grid grid-cols-3 gap-2.5">
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-24" />
      </div>
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-32" />
    </div>
  );
}
