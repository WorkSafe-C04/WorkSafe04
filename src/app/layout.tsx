import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ConditionalLayout from '@/components/ConditionalLayout';
import './globals.css';


export const metadata = {
  title: 'WorkSafe - Gestione Sicurezza sul Lavoro',
  description: 'Sistema di gestione per la sicurezza sul lavoro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" style={{ margin: 0, padding: 0, height: '100%' }}>
      <body style={{ margin: 0, padding: 0, height: '100%' }}>
        <AntdRegistry>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}