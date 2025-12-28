import { useCallback, useEffect, useState } from 'react';
import type { StatoFormazione } from '@/model/formazione';
import { recuperoStatoFormazione } from '@/service/formazioneService';

const empty: StatoFormazione = { totaleCorsi: 0, completati: 0, inCorso: 0, nonIniziati: 0, percentuale: 0 };

export function useStatoFormazione(enabled: boolean, targetMatricola?: string) {
  const [stato, setStato] = useState<StatoFormazione>(empty);
  const [loadingStato, setLoadingStato] = useState(false);
  const [errorStato, setErrorStato] = useState<string | null>(null);

  const reloadStato = useCallback(async () => {
    setLoadingStato(true);
    setErrorStato(null);
    try {
      const data = await recuperoStatoFormazione(targetMatricola);
      setStato(data);
    } catch (e: unknown) {
      setStato(empty);
      setErrorStato(e instanceof Error ? e.message : 'Errore nel recupero stato.');
    } finally {
      setLoadingStato(false);
    }
  }, [targetMatricola]);

  useEffect(() => {
    if (enabled) void reloadStato();
  }, [enabled, reloadStato]);

  return { stato, loadingStato, errorStato, reloadStato };
}
