import { SegnalazioneRepository } from '@/repository/segnalazioneRepository';
import { ISegnalazione } from '@/model/segnalazione';

export const SegnalazioneService = {
  getSegnalazioni: async (): Promise<ISegnalazione[]> => {
    // Recupera i dati dal repository 
    const rawData = await SegnalazioneRepository.getAll();
    
    return rawData.map((item: any) => ({
      id: item.id,
      titolo: item.titolo,
      descrizione: item.descrizione,
      stato: item.stato,
      dataCreazione: item.dataCreazione
    }));
  }
};