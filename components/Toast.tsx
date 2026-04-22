'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastHandlers: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const id = Math.random().toString(36).slice(2);
  toastHandlers.forEach((handler) => handler({ id, message, type }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    toastHandlers.push(handler);
    return () => {
      toastHandlers = toastHandlers.filter((h) => h !== handler);
    };
  }, []);

  const icons = { success: Check, error: X, info: Info };
  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-sm ${colors[toast.type]} pointer-events-auto`}
            >
              <Icon size={15} strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
