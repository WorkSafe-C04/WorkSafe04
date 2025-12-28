import axiosInstance from "@/core/axios/axios";

export const logoutRepository = {
    logout: async (): Promise<void> => {
        await axiosInstance.post('/auth/logout');
    }
}