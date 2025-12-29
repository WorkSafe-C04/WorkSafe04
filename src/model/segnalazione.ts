export interface Segnalazione {
  id: string | number;
  titolo: string;
  descrizione?: string;
  risorsa?: string | number;
  matricola?: string;
  dataCreazione: string | Date;
  stato?: string;
  allegati?: string[];

  Risorsa?: {
    id: string | number;
    nome: string;
  };
}