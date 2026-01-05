import { UtenteNoPass } from "@/model/utente";
import axiosInstance from "@/core/axios/axios";

export const registerRepository = {
    register: async (userData: {
        matricola: string;
        nome?: string;
        cognome?: string;
        dataNascita?: string;
        email: string;
        password: string;
        ruolo?: string;
    }): Promise<UtenteNoPass> => {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data.user;
    }
}