import { useState, useEffect } from 'react';
import { SegnalazioneService } from '@/service/segnalazioneService';
import { ISegnalazione } from '@/model/segnalazione';

export const useSegnalazioni = () => {
  const [data, setData] = useState<ISegnalazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    SegnalazioneService.getSegnalazioni()
      .then((res) => setData(res))
      .catch((err) => setError('Impossibile caricare le segnalazioni'))
      .finally(() => setLoading(false)); 
  }, []);

  return { data, loading, error };
};