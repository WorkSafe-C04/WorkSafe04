'use client';

import { UtenteNoPass } from "@/model/utente";
import { loginService } from "@/service/loginService";
import { useState } from "react";

export const useLogin = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UtenteNoPass | null>(null);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const loggedUser = await loginService.login(email, password);
            setUser(loggedUser);
            return loggedUser;
        } catch (err) {
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, login };
};