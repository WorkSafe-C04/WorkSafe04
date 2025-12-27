import { loginRepository } from '@/repository/loginRepository';
import { UtenteNoPass } from '@/model/utente';

export const loginService = {
    login: async (email: string, password: string): Promise<UtenteNoPass> => {
        return await loginRepository.login(email, password);
    }
};