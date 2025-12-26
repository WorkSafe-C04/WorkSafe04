'use client';

import { Utente } from "@/model/utente";
import { utenteService } from "@/service/utenteService";
import { useEffect, useState } from "react";

export const useUtenti = () => {
  const [data, setData] = useState<Utente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const examples = await utenteService.getAllExamples();
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