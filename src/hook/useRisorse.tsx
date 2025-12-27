import { useState, useCallback, useEffect } from 'react';
import { RisorsaService } from '@/service/risorsaService';
import { message } from 'antd';
import { Risorsa } from '@/model/risorsa';

export const useCreateRisorsa = () => {
  const [loading, setLoading] = useState(false);
  const create = async (values: any) => {
    setLoading(true);
    try {
      await RisorsaService.createRisorsa(values);
      message.success('Risorsa creata con successo!');
      return true; // Ritorna true se ok
    } catch (err) {
      message.error('Errore creazione risorsa');
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
};

export const useGetRisorse = () => {
  const [risorse, setRisorse] = useState<Risorsa[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRisorse = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RisorsaService.getTutteRisorse();
      setRisorse(data);
    } catch (error) {
      console.error(error);
      message.error('Errore caricamento risorse');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carica i dati all'avvio
  useEffect(() => {
    fetchRisorse();
  }, [fetchRisorse]);

  return { risorse, loading, refresh: fetchRisorse };
};

export const useUpdateRisorsaStatus = () => {
  const [loading, setLoading] = useState(false);
  const updateStatus = async (id: number | string, stato: string) => {
    setLoading(true);
    try {
      await RisorsaService.updateStato(id, stato);
      message.success('Stato aggiornato!');
      return true;
    } catch (err) {
      message.error('Errore aggiornamento stato');
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { updateStatus, loading };
};