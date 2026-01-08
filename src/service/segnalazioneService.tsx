import { SegnalazioneRepository } from '@/repository/segnalazioneRepository';
import { Segnalazione } from '@/model/segnalazione';
import dayjs from 'dayjs';

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
      priorita: item.priorita, 
      allegati: item.allegati,
      Risorsa: item.Risorsa        
    }));
  },

  filtroSegnalazioni: async (filters: any): Promise<Segnalazione[]> => {
    const { titolo, dataCreazione, nomeRisorsa, stato, priorita } = filters;

    if (dataCreazione) {
      const d = dayjs(dataCreazione);
      const isFormatValid = d.isValid() && d.format('YYYY-MM-DD') === dataCreazione;

      if (!isFormatValid) {
        throw new Error("Formato data non valido");
      }
      if (d.isAfter(dayjs(), 'day')) {
        throw new Error("La data selezionata non può essere nel futuro");
      }
    }

    if (titolo && titolo.length > 30) {
      throw new Error("Il testo di ricerca è troppo lungo");
    }

    const rawData = await SegnalazioneRepository.getAll();

    let results = rawData.map((item: any) => ({
      id: item.id,
      titolo: item.titolo,
      descrizione: item.descrizione,
      risorsa: item.risorsa,      
      matricola: item.matricola,
      dataCreazione: item.dataCreazione,
      stato: item.stato,
      priorita: item.priorita, 
      allegati: item.allegati,
      Risorsa: item.Risorsa        
    }));

    if (titolo) results = results.filter((r: any) => r.titolo.includes(titolo));
    if (stato) results = results.filter((r: any) => r.stato === stato);
    if (priorita) results = results.filter((r: any) => r.priorita === priorita);
    if (dataCreazione) results = results.filter((r: any) => dayjs(r.dataCreazione).isSame(dayjs(dataCreazione), 'day'));

    return results;
  }
};