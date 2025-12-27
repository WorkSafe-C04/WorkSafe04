import { RisorsaRepository } from '@/repository/risorsaRepository';
import { Risorsa } from '@/model/risorsa';

export const RisorsaService = {
  createRisorsa: async (data: any): Promise<Risorsa> => {
    const rawData = await RisorsaRepository.create(data);
    return rawData;
  },

  getTutteRisorse: async (): Promise<Risorsa[]> => {
    const rawData = await RisorsaRepository.getAll();
    return rawData.map((item: any) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      descrizione: item.descrizione,
      stato: item.stato,
      schedaAllegata: item.schedaAllegata ? `/api/risorse/${item.id}/file` : undefined,
      nomeFile: item.nomeFile || 'Documento'
    }));
  },

  updateStato: async (id: number | string, nuovoStato: string): Promise<Risorsa> => {
    const rawData = await RisorsaRepository.updateStatus(id, nuovoStato);
    return rawData;
  }
};