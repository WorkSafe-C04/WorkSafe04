
export interface Segnalazione {
  id: number;
  titolo: string | undefined;
  descrizione: string | undefined;
  risorsa: number;
  matricola: string | undefined;
  dataCreazione: string | Date;
  stato: string | undefined;
}