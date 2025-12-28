'use client';

import { Avviso } from "@/model/avviso";
import { avvisoService } from "@/service/avvisoService";
import { message } from "antd";
import { use, useEffect, useState } from "react";

export const useCreateAvviso = () => {
    const [loading, setLoading] = useState(false);
    const [matricola, setMatricola] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userJSON = JSON.parse(user);
                if (userJSON.matricola) {
                    setMatricola(userJSON.matricola);
                }
            } catch (err) {
                console.error('Errore nel parsing dei dati utente dal localStorage', err);
            }
        }
    }, []);

    const create = async (formValues: any, onSuccess?: () => void) => {
        setLoading(true);
        try {
            const payload = {
                titolo: formValues.titolo,
                contenuto: formValues.contenuto,
                dataCreazione: formValues.dataCreazione,
                matricola: matricola,
            };

            await avvisoService.createAvviso(payload);
                message.success('Avviso creato con successo! 🎉');

            if (onSuccess) {
                onSuccess();
            }

            console.log('Payload:', payload);

            return true;
        } catch (err) {
            message.error('Errore durante la creazione dell\'avviso');
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
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};