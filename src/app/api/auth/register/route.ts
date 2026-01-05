import prisma from '@/core/db/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UtenteNoPass } from '@/model/utente';

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();

        // Controlla se è una registrazione azienda (con utente datore di lavoro) o dipendente
        if (body.azienda && body.utente) {
            // Registrazione Azienda + Datore di Lavoro
            return await registerAziendaConDatore(body);
        } else {
            // Registrazione Dipendente
            return await registerDipendente(body);
        }
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// Funzione per registrare un dipendente
async function registerDipendente(body: any): Promise<Response> {
    const { matricola, nome, cognome, dataNascita, email, password, ruolo, dataAssunzione, codiceAzienda } = body;

    if (!matricola || !email || !password || !codiceAzienda) {
        return NextResponse.json({
            message: "Matricola, email, password e codice azienda sono obbligatori"
        }, { status: 400 });
    }

    // Controlla se il codice azienda esiste
    const existingAzienda = await prisma.azienda.findUnique({
        where: { codiceAzienda }
    });

    if (!existingAzienda) {
        return NextResponse.json({
            message: "Codice azienda non valido"
        }, { status: 404 });
    }

    // Controlla se l'utente esiste già
    const existingUser = await prisma.utente.findFirst({
        where: { 
            OR: [
                { email },
                { matricola }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email) {
            return NextResponse.json({
                message: "Email già registrata"
            }, { status: 409 });
        } else {
            return NextResponse.json({
                message: "Matricola già registrata"
            }, { status: 409 });
        }
    }

    // Cripta la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente
    const newUser = await prisma.utente.create({
        data: {
            matricola,
            nome,
            cognome,
            dataNascita: dataNascita ? new Date(dataNascita) : null,
            email,
            password: hashedPassword,
            ruolo,
            dataAssunzione: dataAssunzione ? new Date(dataAssunzione) : null,
            codiceAzienda
        }
    });

    // Restituisce gli attributi dell'utente senza la password
    const userWithoutPassword: UtenteNoPass = {
        matricola: newUser.matricola,
        nome: newUser.nome ? newUser.nome : undefined,
        cognome: newUser.cognome ? newUser.cognome : undefined,
        dataNascita: newUser.dataNascita ? newUser.dataNascita : undefined,
        email: newUser.email ? newUser.email : undefined,
        ruolo: newUser.ruolo ? newUser.ruolo : undefined,
        dataAssunzione: newUser.dataAssunzione ? newUser.dataAssunzione : undefined,
        codiceAzienda: newUser.codiceAzienda ? newUser.codiceAzienda : undefined
    };

    return NextResponse.json({
        user: userWithoutPassword
    }, { status: 201 });
}

// Funzione per registrare un'azienda con il datore di lavoro
async function registerAziendaConDatore(body: any): Promise<Response> {
    const { azienda, utente } = body;

    // Validazione dati azienda
    if (!azienda.codiceAzienda || !azienda.partitaIva || !azienda.ragioneSociale || !azienda.sede || !azienda.recapito) {
        return NextResponse.json({
            message: "Tutti i campi aziendali sono obbligatori"
        }, { status: 400 });
    }

    // Validazione dati utente
    if (!utente.matricola || !utente.email || !utente.password || !utente.dataNascita) {
        return NextResponse.json({
            message: "Matricola, email, password e data di nascita sono obbligatori per il datore di lavoro"
        }, { status: 400 });
    }

    // Controlla se l'azienda esiste già (partita IVA o codice azienda)
    const existingAzienda = await prisma.azienda.findFirst({
        where: {
            OR: [
                { codiceAzienda: azienda.codiceAzienda },
                { partitaIva: azienda.partitaIva }
            ]
        }
    });

    if (existingAzienda) {
        if (existingAzienda.partitaIva === azienda.partitaIva) {
            return NextResponse.json({
                message: "Partita IVA già registrata"
            }, { status: 409 });
        } else {
            return NextResponse.json({
                message: "Codice azienda già esistente"
            }, { status: 409 });
        }
    }

    // Controlla se l'utente esiste già
    const existingUser = await prisma.utente.findFirst({
        where: {
            OR: [
                { email: utente.email },
                { matricola: utente.matricola }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === utente.email) {
            return NextResponse.json({
                message: "Email già registrata"
            }, { status: 409 });
        } else {
            return NextResponse.json({
                message: "Matricola già registrata"
            }, { status: 409 });
        }
    }

    // Cripta la password
    const hashedPassword = await bcrypt.hash(utente.password, 10);

    // Usa una transaction per creare sia l'azienda che l'utente
    const result = await prisma.$transaction(async (prisma) => {
        // Crea l'azienda
        const newAzienda = await prisma.azienda.create({
            data: {
                codiceAzienda: azienda.codiceAzienda,
                partitaIva: azienda.partitaIva,
                ragioneSociale: azienda.ragioneSociale,
                sede: azienda.sede,
                recapito: azienda.recapito
            }
        });

        // Crea il datore di lavoro
        const newUser = await prisma.utente.create({
            data: {
                matricola: utente.matricola,
                nome: utente.nome,
                cognome: utente.cognome,
                dataNascita: utente.dataNascita ? new Date(utente.dataNascita) : null,
                email: utente.email,
                password: hashedPassword,
                ruolo: utente.ruolo,
                dataAssunzione: utente.dataAssunzione ? new Date(utente.dataAssunzione) : null,
                codiceAzienda: azienda.codiceAzienda
            }
        });

        return { newAzienda, newUser };
    });

    // Restituisce i dati senza la password
    const userWithoutPassword: UtenteNoPass = {
        matricola: result.newUser.matricola,
        nome: result.newUser.nome ? result.newUser.nome : undefined,
        cognome: result.newUser.cognome ? result.newUser.cognome : undefined,
        dataNascita: result.newUser.dataNascita ? result.newUser.dataNascita : undefined,
        email: result.newUser.email ? result.newUser.email : undefined,
        ruolo: result.newUser.ruolo ? result.newUser.ruolo : undefined,
        dataAssunzione: result.newUser.dataAssunzione ? result.newUser.dataAssunzione : undefined,
        codiceAzienda: result.newUser.codiceAzienda ? result.newUser.codiceAzienda : undefined
    };

    return NextResponse.json({
        user: userWithoutPassword,
        azienda: {
            codiceAzienda: result.newAzienda.codiceAzienda,
            partitaIva: result.newAzienda.partitaIva,
            ragioneSociale: result.newAzienda.ragioneSociale,
            sede: result.newAzienda.sede,
            recapito: result.newAzienda.recapito
        }
    }, { status: 201 });
}