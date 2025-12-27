import { useState, useCallback, useEffect } from 'react';
import { RisorsaService } from '@/service/risorsaService';
import { message } from 'antd';
import { Risorsa } from '@/model/risorsa';

// Utility per file upload
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Utility per icone dei tipi
export const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'Macchinario': return '⚙️';
    case 'Attrezzatura': return '🔨';
    case 'DPI': return '🦺';
    default: return '📦';
  }
};

// Utility per colori dei tipi
export const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'Macchinario': return 'purple';
    case 'Attrezzatura': return 'blue';
    case 'DPI': return 'orange';
    default: return 'default';
  }
};

export const useCreateRisorsa = () => {
  const [loading, setLoading] = useState(false);

  const create = async (formValues: any, onSuccess?: () => void) => {
    setLoading(true);
    try {
      // Elabora i valori del form
      let scheda = undefined;
      if (formValues.upload && formValues.upload.length > 0) {
        scheda = await getBase64(formValues.upload[0].originFileObj);
      }

      const payload = {
        nome: formValues.nome,
        tipo: formValues.tipo,
        descrizione: formValues.descrizione,
        schedaAllegata: scheda
      };

      await RisorsaService.createRisorsa(payload);
      message.success('Risorsa creata con successo! 🎉');

      // Chiama la callback se fornita
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      message.error('Errore durante la creazione della risorsa');
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
      console.log('Risorse caricate:', data);
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
      message.success('Stato aggiornato! ✨');
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

// Hook completo per la gestione delle risorse con tabella
export const useRisorseTable = () => {
  const { risorse, loading, refresh } = useGetRisorse();
  const { updateStatus } = useUpdateRisorsaStatus();

  const handleStatoChange = useCallback(async (id: number, nuovoStato: string) => {
    const success = await updateStatus(id, nuovoStato);
    if (success) {
      refresh();
    }
  }, [updateStatus, refresh]);

  return {
    risorse,
    loading,
    refresh,
    handleStatoChange
  };
};