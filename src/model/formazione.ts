export interface VideoCorso {
  id: string;
  nome: string;
  durata?: number;
  descrizione?: string;
  stato?: string;
  url: string;
}

export interface Quiz {
  id: string;
  nome: string;
  durata?: number;
  punteggio?: number;
}

export interface Documentazione {
  id: string;
  nome: string;
  descrizione?: string;
  contenuto?: string; // base64 o URL
}

export interface Formazione {
  id: string;
  numeroCorsi: number;
  argomento?: string;
  codiceAzienda?: string;
}

export interface FormazioneDettaglio extends Formazione {
  videoCorsi: VideoCorso[];
  quiz: Quiz[];
  documentazioni: Documentazione[];
}
