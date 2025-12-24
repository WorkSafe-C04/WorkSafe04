
export interface ISegnalazione {
  id: number;
  titolo: string;
  descrizione: string;
  stato: string; 
  dataCreazione: string | Date;
}