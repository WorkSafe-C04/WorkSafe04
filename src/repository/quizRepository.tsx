import apiClient from "@/core/axios/axios";
import { Domanda, RisposteQuiz, RisultatoQuiz } from "@/model/domanda";

export const quizRepository = {
  getDomandeByQuizId: async (quizId: string): Promise<Domanda[]> => {
    const response = await apiClient.get(`quiz/${quizId}`);
    return response.data;
  },

  submitQuiz: async (
    quizId: string,
    risposte: RisposteQuiz,
    idFormazione: string
  ): Promise<RisultatoQuiz> => {
    const response = await apiClient.post(`quiz/${quizId}/submit`, {
      risposte,
      idFormazione,
    });
    return response.data;
  },
};
