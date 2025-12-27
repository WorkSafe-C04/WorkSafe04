'use client';

import { logoutService } from "@/service/logoutService";
import { useState } from "react";

export const useLogout = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await logoutService.logout();
        } catch (err) {
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, logout };
};