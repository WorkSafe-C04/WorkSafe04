import type { CorsoFormazione, StatoFormazione } from '@/model/formazione';

type ApiErrorShape = { error?: unknown };

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Errore imprevisto.';
};

const readApiError = async (res: Response, fallback: string) => {
  const data: unknown = await res.json().catch(() => null);
  if (typeof data === 'object' && data !== null && 'error' in data) {
    return String((data as ApiErrorShape).error ?? fallback);
  }
  return fallback;
};

export async function recuperoCorsiAssegnati(matricola?: string): Promise<CorsoFormazione[]> {
  const qs = matricola ? `?matricola=${encodeURIComponent(matricola)}` : '';
  try {
    const res = await fetch(`/api/formazione/corsi${qs}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(await readApiError(res, `Errore (HTTP ${res.status})`));
    const data = (await res.json()) as CorsoFormazione[];
    return Array.isArray(data) ? data : [];
  } catch (e: unknown) {
    throw new Error(getErrorMessage(e) || 'Errore di rete nel recupero corsi.');
  }
}

export async function recuperoStatoFormazione(matricola?: string): Promise<StatoFormazione> {
  const qs = matricola ? `?matricola=${encodeURIComponent(matricola)}` : '';
  try {
    const res = await fetch(`/api/formazione/stato${qs}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(await readApiError(res, `Errore (HTTP ${res.status})`));
    return (await res.json()) as StatoFormazione;
  } catch (e: unknown) {
    throw new Error(getErrorMessage(e) || 'Errore di rete nel recupero stato formazione.');
  }
}

export async function completamentoCorsoFormazione(idGestione: string, matricola?: string): Promise<void> {
  try {
    const res = await fetch('/api/formazione/completamento', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idGestione, ...(matricola ? { matricola } : {}) }),
    });

    if (!res.ok) throw new Error(await readApiError(res, `Errore aggiornamento (HTTP ${res.status})`));
  } catch (e: unknown) {
    throw new Error(getErrorMessage(e) || 'Errore di rete durante completamento corso.');
  }
}
