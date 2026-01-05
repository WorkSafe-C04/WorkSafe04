import { useState, useEffect } from 'react';
import { formazioneService } from '@/service/formazioneService';
import { Formazione, FormazioneDettaglio } from '@/model/formazione';
import { message } from 'antd';

export const useFormazioni = () => {
  const [formazioni, setFormazioni] = useState<Formazione[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFormazioni = async () => {
    try {
      setLoading(true);
      const data = await formazioneService.getAllFormazioni();
      setFormazioni(data);
    } catch (error) {
      console.error('Errore nel caricamento delle formazioni:', error);
      message.error('Errore nel caricamento delle formazioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormazioni();
  }, []);

  return { formazioni, loading, loadFormazioni };
};

export const useFormazioneDettaglio = (id: string | null) => {
  const [formazione, setFormazione] = useState<FormazioneDettaglio | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFormazione = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await formazioneService.getFormazioneById(id);
      setFormazione(data);
    } catch (error) {
      console.error('Errore nel caricamento del dettaglio:', error);
      message.error('Errore nel caricamento del dettaglio formazione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormazione();
  }, [id]);

  return { formazione, loading, loadFormazione };
};
