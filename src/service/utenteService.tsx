import { Utente } from "@/model/utente";
import { utenteRepository } from "@/repository/utenteRepository";

export const utenteService = {
    getAllExamples: async (): Promise<Utente[]> => {
        const jsonData = await utenteRepository.getAll();

        // Mapping JSON -> Modello
        return jsonData.map((item: any) => {
            const utente = new Utente();
            utente.matricola = item.matricola;
            utente.nome = item.stringa;
            utente.cognome = item.cognome;
            utente.dataNascita = new Date(item.dataNascita);
            utente.email = item.email;
            utente.password = item.password;
            utente.ruolo = item.ruolo;
            utente.dataAssunzione = new Date(item.dataAssunzione);
            return utente;
        });
    },
};