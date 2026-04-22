'use client';

import { motion } from 'framer-motion';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
  delay?: number;
}

export default function MacroBar({ label, current, goal, unit = 'g', color, delay = 0 }: MacroBarProps) {
  const percent = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60 font-medium">{label}</span>
        <span className="text-white font-semibold">
          {Math.round(current)}<span className="text-white/40 font-normal">/{goal}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isOver ? '#F87171' : color }}
          initial={{ width: '0%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay }}
        />
      </div>
    </div>
  );
}
