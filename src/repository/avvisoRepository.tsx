import { Avviso } from "@/model/avviso";
import axiosInstance from "@/core/axios/axios";
import { create } from "domain";

export const avvisoRepository = {
    create: async (avviso: any) => {
        const response = await axiosInstance.post('avvisi', avviso);
        return response.data;
    },

    getAll: async (): Promise<Avviso[]> => {
        const response = await axiosInstance.get<Avviso[]>('avvisi');
        return response.data;
    }
}