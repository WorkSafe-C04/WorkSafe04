import { SegnalazioneRepository } from '@/repository/segnalazioneRepository';
import { Segnalazione } from '@/model/segnalazione';

export const SegnalazioneService = {
  getSegnalazioni: async (): Promise<Segnalazione[]> => {
    
    const rawData = await SegnalazioneRepository.getAll();
    
    return rawData.map((item: any) => ({
      id: item.id,
      titolo: item.titolo,
      descrizione: item.descrizione,
      risorsa: item.risorsa,
      matricola: item.matricola,
      dataCreazione: item.dataCreazione,
      stato: item.stato,
    }));
  }
};