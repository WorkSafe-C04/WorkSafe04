'use client';

import { useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

export function useCreaSegnalazione() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const creaSegnalazione = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/segnalazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Segnalazione creata con successo!');
        router.push('/segnalazioni');
        router.refresh();
        return true;
      } else {
        const errorData = await response.json();
        message.error(`Errore: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      message.error('Errore di connessione al server');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { creaSegnalazione, loading };
}