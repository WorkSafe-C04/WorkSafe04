import axios from 'axios';

export const RisorsaRepository = {
  create: async (data: any) => {
    const response = await axios.post('/api/risorse', data);
    return response.data;
  },

  getAll: async () => {
    const response = await axios.get('/api/risorse');
    return response.data;
  },

  updateStatus: async (id: number | string, stato: string) => {
    const response = await axios.patch('/api/risorse', { id, stato });
    return response.data;
  }
};