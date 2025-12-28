export interface Risorsa {
  id: number;
  nome: string | undefined;
  tipo: string | undefined;
  descrizione: string | undefined;
  stato: string | undefined;
  schedaAllegata?: string; // Base64 encoded bytea from Supabase
  nomeFile?: string; // Nome del file allegato
}