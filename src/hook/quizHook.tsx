import { useState } from 'react';
import { quizService } from '@/service/quizService';
import { Domanda, RisposteQuiz, RisultatoQuiz } from '@/model/domanda';
import { message } from 'antd';

export const useQuiz = (quizId: string, idFormazione: string) => {
  const [domande, setDomande] = useState<Domanda[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDomandaIndex, setCurrentDomandaIndex] = useState(0);
  const [risposte, setRisposte] = useState<RisposteQuiz>({});
  const [submitting, setSubmitting] = useState(false);

  const loadDomande = async () => {
    try {
      setLoading(true);
      const data = await quizService.getDomandeByQuizId(quizId);
      setDomande(data);
    } catch (error) {
      console.error('Errore nel caricamento delle domande:', error);
      message.error('Errore nel caricamento delle domande');
    } finally {
      setLoading(false);
    }
  };

  const rispondi = (domandaId: string, risposta: boolean) => {
    setRisposte((prev) => ({
      ...prev,
      [domandaId]: risposta,
    }));
  };

  const vaiAProssimaDomanda = () => {
    if (currentDomandaIndex < domande.length - 1) {
      setCurrentDomandaIndex((prev) => prev + 1);
    }
  };

  const vaiADomandaPrecedente = () => {
    if (currentDomandaIndex > 0) {
      setCurrentDomandaIndex((prev) => prev - 1);
    }
  };

  const vaiADomanda = (index: number) => {
    if (index >= 0 && index < domande.length) {
      setCurrentDomandaIndex(index);
    }
  };

  const submitQuiz = async (): Promise<RisultatoQuiz | null> => {
    try {
      setSubmitting(true);
      const risultato = await quizService.submitQuiz(
        quizId,
        risposte,
        idFormazione
      );
      return risultato;
    } catch (error) {
      console.error('Errore nel submit del quiz:', error);
      message.error('Errore nel submit del quiz');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    domande,
    loading,
    currentDomandaIndex,
    currentDomanda: domande[currentDomandaIndex],
    risposte,
    submitting,
    loadDomande,
    rispondi,
    vaiAProssimaDomanda,
    vaiADomandaPrecedente,
    vaiADomanda,
    submitQuiz,
    isUltimaDomanda: currentDomandaIndex === domande.length - 1,
    isPrimaDomanda: currentDomandaIndex === 0,
  };
};
