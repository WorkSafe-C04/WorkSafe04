import axios from 'axios';

export const SegnalazioneRepository = {
  getAll: async () => {
    const response = await axios.get('/api/segnalazioni');
    return response.data;
  }
};