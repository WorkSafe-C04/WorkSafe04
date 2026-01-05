export class Utente {
    matricola: string | undefined;
    nome: string | undefined;
    cognome: string | undefined;
    dataNascita: Date | undefined;
    email: string | undefined;
    password: string | undefined;
    ruolo: string | undefined;
    dataAssunzione: Date | undefined;
    codiceAzienda: string | undefined;
}

export class UtenteNoPass {
    matricola: string | undefined;
    nome: string | undefined;
    cognome: string | undefined;
    dataNascita: Date | undefined;
    email: string | undefined;
    ruolo: string | undefined;
    dataAssunzione: Date | undefined;
    codiceAzienda: string | undefined;
}