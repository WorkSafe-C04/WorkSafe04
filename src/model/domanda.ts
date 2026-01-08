export interface Domanda {
  id: string;
  descrizione: string;
  rispostaCorretta: boolean;
  codiceAzienda: string | null;
  idQuiz: string | null;
}

export interface RisposteQuiz {
  [domandaId: string]: boolean;
}

export interface RisultatoQuiz {
  superato: boolean;
  totaleDomande: number;
}
