import axiosInstance from "@/core/axios/axios";
import { Formazione, FormazioneDettaglio } from "@/model/formazione";

export const formazioneRepository = {
  getAllFormazioni: async (): Promise<Formazione[]> => {
    const response = await axiosInstance.get('/formazione');
    return response.data;
  },

  getFormazioneById: async (id: string): Promise<FormazioneDettaglio> => {
    const response = await axiosInstance.get(`/formazione?id=${id}`);
    return response.data;
  }
};
