'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'he' | 'en';
export type Theme = 'dark' | 'light' | 'system';

interface SettingsState {
  lang: Lang;
  theme: Theme;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'he',
      theme: 'system',
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'calorieai-settings' }
  )
);
