import { formazioneRepository } from "@/repository/formazioneRepository";
import { Formazione, FormazioneDettaglio } from "@/model/formazione";

export const formazioneService = {
  getAllFormazioni: async (): Promise<Formazione[]> => {
    return await formazioneRepository.getAllFormazioni();
  },

  getFormazioneById: async (id: string): Promise<FormazioneDettaglio> => {
    return await formazioneRepository.getFormazioneById(id);
  }
};
