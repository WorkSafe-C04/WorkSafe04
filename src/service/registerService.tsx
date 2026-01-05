import { registerRepository } from '@/repository/registerRepository';
import { UtenteNoPass } from '@/model/utente';

export const registerService = {
    register: async (userData: any): Promise<UtenteNoPass> => {
        return await registerRepository.register(userData);
    }
};