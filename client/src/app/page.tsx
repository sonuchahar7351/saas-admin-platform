'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth-store';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? '/dashboard' : '/login');
  }, [user, isLoading]);

  return <div className="flex h-screen items-center justify-center text-sm text-text-secondary">Loading…</div>;
}