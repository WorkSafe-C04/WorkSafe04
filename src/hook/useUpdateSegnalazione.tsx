'use client';

import { useState } from 'react';

type ApiErrorResponse = { error?: unknown };

export function useUpdateSegnalazione() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStato = async (id: string, stato: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/segnalazioni/${id}/stato`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato }),
      });

      const payload: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload
            ? String((payload as ApiErrorResponse).error ?? 'Errore aggiornamento stato')
            : 'Errore aggiornamento stato';

        throw new Error(msg);
      }

      return payload;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Errore';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateStato, loading, error };
}
