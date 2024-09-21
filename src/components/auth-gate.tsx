// src/components/auth-gate.tsx
'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session && pathname !== '/') {
      router.push('/');
    }
  }, [session, status, pathname, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session && pathname !== '/') {
    return null;
  }

  return <>{children}</>;
}