import { RisorsaRepository } from '@/repository/risorsaRepository';
import { Risorsa } from '@/model/risorsa';

export const RisorsaService = {
  createRisorsa: async (data: any): Promise<Risorsa> => {
    const rawData = await RisorsaRepository.create(data);
    return { ...rawData, schedaAllegata: undefined };
  },

  getTutteRisorse: async (): Promise<Risorsa[]> => {
    const rawData = await RisorsaRepository.getAll();
    // Mappiamo i dati assicurandoci che corrispondano al modello
    return rawData.map((item: any) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      descrizione: item.descrizione,
      stato: item.stato,
      schedaAllegata: undefined 
    }));
  },

  updateStato: async (id: number | string, nuovoStato: string): Promise<Risorsa> => {
    const rawData = await RisorsaRepository.updateStatus(id, nuovoStato);
    return { ...rawData, schedaAllegata: undefined };
  }
};