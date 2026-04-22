'use client';
import { useEffect } from 'react';

// The listener is integrated directly into lib/auth-store.ts when the module loads,
// so AuthProvider just renders children here to avoid duplication.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
