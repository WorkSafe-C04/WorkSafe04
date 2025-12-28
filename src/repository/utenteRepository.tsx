import { Utente } from "@/model/utente";
import axiosInstance from "@/core/axios/axios";

export const utenteRepository = {
    getAll: async (): Promise<Utente[]> => {
        const response = await axiosInstance.get<Utente[]>('/utenti');
        return response.data;
    }
}