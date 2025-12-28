import { logoutRepository } from '@/repository/logoutRepository';

export const logoutService = {
    logout: async (): Promise<void> => {
        return await logoutRepository.logout();
    }
};