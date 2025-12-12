import axiosInstance from '@/core/axios/axios';
import { Example } from '@/model/example';

export const exampleRepository = {
  // GET /api/example
  getAll: async (): Promise<Example[]> => {
    const response = await axiosInstance.get('/example');
    return response.data;
  },
};