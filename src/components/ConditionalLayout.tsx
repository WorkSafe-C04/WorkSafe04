'use client';

import { usePathname } from 'next/navigation';
import AppLayout from './AppLayout';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Non mostrare AppLayout per le pagine di autenticazione
  const isAuthPage = pathname?.startsWith('/auth');
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <AppLayout>{children}</AppLayout>;
}
