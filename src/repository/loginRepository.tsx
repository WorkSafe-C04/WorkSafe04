import { UtenteNoPass } from "@/model/utente";
import axiosInstance from "@/core/axios/axios";

export const loginRepository = {
    login: async (email: string, password: string): Promise<UtenteNoPass> => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data.user;
    }
}