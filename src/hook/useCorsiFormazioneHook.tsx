import { useCallback, useEffect, useState } from 'react';
import type { CorsoFormazione } from '@/model/formazione';
import { recuperoCorsiAssegnati } from '@/service/formazioneService';

export function useCorsiFormazione(enabled: boolean, targetMatricola?: string) {
  const [corsi, setCorsi] = useState<CorsoFormazione[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recuperoCorsiAssegnati(targetMatricola);
      setCorsi(data);
    } catch (e: unknown) {
      setCorsi([]);
      setError(e instanceof Error ? e.message : 'Errore nel recupero corsi.');
    } finally {
      setLoading(false);
    }
  }, [targetMatricola]);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  return { corsi, loadingCorsi: loading, error, reload };
}
