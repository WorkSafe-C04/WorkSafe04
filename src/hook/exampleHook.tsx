'use client';

import { useState, useEffect } from 'react';
import { exampleService } from '@/service/examoleService';
import { Example } from '@/model/example';

export const useExample = () => {
  const [data, setData] = useState<Example[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const examples = await exampleService.getAllExamples();
      setData(examples);
    } catch (err) {
      setError('Errore nel caricamento dei dati');
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};