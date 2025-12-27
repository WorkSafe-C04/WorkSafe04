import { registerRepository } from '@/repository/registerRepository';
import { UtenteNoPass } from '@/model/utente';

export const registerService = {
    register: async (userData: {
        matricola: string;
        nome?: string;
        cognome?: string;
        dataNascita?: string;
        email: string;
        password: string;
        ruolo?: string;
        dataAssunzione?: string;
    }): Promise<UtenteNoPass> => {
        return await registerRepository.register(userData);
    }
};