import { Avviso } from "@/model/avviso";
import { avvisoRepository } from "@/repository/avvisoRepository";

export const avvisoService = {
    createAvviso: async (avviso : any): Promise<Avviso> => {
        const jsonData = await avvisoRepository.create(avviso);
        return jsonData;
    },
    getAll: async (): Promise<Avviso[]> => {
        const jsonData = await avvisoRepository.getAll();

        return jsonData.map((item: any) => {
            const avviso = new Avviso();
            avviso.id = item.id;
            avviso.titolo = item.titolo;
            avviso.contenuto = item.contenuto;
            avviso.dataCreazione = item.dataCreazione;
            avviso.matricola = item.matricola;
            return avviso;
        });
    },
};