import { useCallback, useState } from 'react';
import { completamentoCorsoFormazione } from '@/service/formazioneService';

export function useCompleteFormazione(onCompleted?: () => Promise<void> | void, targetMatricola?: string) {
  const [loadingComplete, setLoadingComplete] = useState(false);

  const complete = useCallback(
    async (idGestione: string) => {
      setLoadingComplete(true);
      try {
        await completamentoCorsoFormazione(idGestione, targetMatricola);
        await onCompleted?.();
        return { ok: true as const };
      } catch (e: unknown) {
        return { ok: false as const, error: e instanceof Error ? e.message : 'Errore completamento.' };
      } finally {
        setLoadingComplete(false);
      }
    },
    [onCompleted, targetMatricola]
  );

  return { complete, loadingComplete };
}
