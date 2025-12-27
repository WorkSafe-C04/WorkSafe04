'use client';

import { UtenteNoPass } from "@/model/utente";
import { registerService } from "@/service/registerService";
import { useState } from "react";

export const useRegister = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UtenteNoPass | null>(null);

    const register = async (userData: {
        matricola: string;
        nome?: string;
        cognome?: string;
        dataNascita?: string;
        email: string;
        password: string;
        ruolo?: string;
        dataAssunzione?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const newUser = await registerService.register(userData);
            setUser(newUser);
            return newUser;
        } catch (err) {
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, register };
};