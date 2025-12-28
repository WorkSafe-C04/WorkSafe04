'use client';

import { Avviso } from "@/model/avviso";
import { avvisoService } from "@/service/avvisoService";
import { useEffect, useState } from "react";

export const useCreateAvviso = () => {
    const [loading, setLoading] = useState(false);

    const create = async (formValues: any, onSuccess?: () => void) => {
        setLoading(true);
        try {
            const payload = {
                titolo: formValues.titolo,
                contenuto: formValues.contenuto,
                dataCreazione: formValues.dataCreazione,
            };

            await avvisoService.createAvviso(payload);
            //message.success('Risorsa creata con successo! 🎉');

            if (onSuccess) {
                onSuccess();
            }

            return true;
        } catch (err) {
            //message.error('Errore durante la creazione della risorsa');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading };
};


export const useAvvisi = () => {
    const [data, setData] = useState<Avviso[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const all = await avvisoService.getAll();
            setData(all);
        } catch (err) {
            setError('Errore nel caricamento dei dati');
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();;
    }, []);

    return { data, loading, error, refetch: fetchData };
};