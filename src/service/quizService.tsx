import { quizRepository } from "@/repository/quizRepository";
import { Domanda, RisposteQuiz, RisultatoQuiz } from "@/model/domanda";

export const quizService = {
  getDomandeByQuizId: async (quizId: string): Promise<Domanda[]> => {
    return await quizRepository.getDomandeByQuizId(quizId);
  },

  submitQuiz: async (
    quizId: string,
    risposte: RisposteQuiz,
    idFormazione: string
  ): Promise<RisultatoQuiz> => {
    return await quizRepository.submitQuiz(quizId, risposte, idFormazione);
  },
};
