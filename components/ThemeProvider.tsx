'use client';
import { useEffect } from 'react';
import { useSettings } from '@/lib/settings-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useSettings();

  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme === 'dark');
    }
  }, [theme]);

  return <>{children}</>;
}
