import axios from 'axios'; 

export const SegnalazioneRepository = {
  getAll: async () => {
    // Chiama l'API 
    const response = await axios.get('/api/segnalazioni');
    return response.data;
  }
};