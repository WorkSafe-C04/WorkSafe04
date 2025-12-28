export type UserLS = {
  matricola?: string;
  ruolo?: string;
  nome?: string;
  cognome?: string;
  email?: string;
};

export type VideoCorsoFormazione = {
  id: string;
  nome: string;
  url: string;
  durata?: string | null;
  descrizione?: string | null;
  stato?: string | null;
};

export type QuizFormazione = {
  id: string;
  nome: string;
  durata?: string | null;
  punteggio?: string | null;
};

export type CorsoFormazione = {
  id: string; // GestioneFormazione.id (BigInt -> string)
  idFormazione: string;
  matricola: string;
  stato?: string | null;
  Formazione?: {
    id: string;
    numeroCorsi: string;
    argomento?: string | null;
    VideoCorso: VideoCorsoFormazione[];
    Quiz: QuizFormazione[];
  } | null;
};

export type StatoFormazione = {
  totaleCorsi: number;
  completati: number;
  inCorso: number;
  nonIniziati: number;
  percentuale: number; // 0..100
};
