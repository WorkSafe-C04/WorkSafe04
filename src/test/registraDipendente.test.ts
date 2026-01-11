import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// --- CONFIGURAZIONE AMBIENTE ---
function caricaVariabiliEnv() {
    const envFiles = ['.env', '.env.local'];
    let caricato = false;
    envFiles.forEach(file => {
        try {
            const envPath = path.resolve(__dirname, '../../', file);
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf-8');
                envConfig.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const [key, ...valueParts] = trimmed.split('=');
                        if (key && valueParts.length > 0) {
                            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                            if (!process.env[key.trim()]) process.env[key.trim()] = value;
                        }
                    }
                });
                caricato = true;
            }
        } catch (e) { }
    });
}

// --- LOGICA DI BUSINESS: REGISTRAZIONE DIPENDENTE ---
async function registrazioneDipendente(prisma: any, params: any,) {

    const { matricola, nome, cognome, dataNascita, email, password, codiceAzienda } = params;

    // Validazione Matricola (M)
    if (!matricola || matricola === "") throw new Error("Matricola obbligatoria");
    
    // Controllo unicità matricola
    const existingMatricola = await prisma.utente.findUnique({ where: { matricola } });
    if (existingMatricola) throw new Error("Matricola già registrata");

    // Validazione Nome (N)
    if (!nome || nome === "") throw new Error("Nome obbligatorio");

    // Validazione Cognome (C)
    if (!cognome || cognome === "") throw new Error("Cognome obbligatorio");

    // Validazione DataNascita (DN)
    if (!dataNascita || dataNascita === "") throw new Error("Data di nascita obbligatoria");
    const data = new Date(dataNascita);
    if (data >= new Date()) throw new Error("La data di nascita deve essere precedente a oggi");

    // Validazione Email (E)
    if (!email || email === "") throw new Error("Email obbligatoria");
    if (!email.includes('@')) throw new Error("Inserisci un indirizzo email valido");

    // Controllo unicità email
    const existingEmail = await prisma.utente.findUnique({ where: { email } });
    if (existingEmail) throw new Error("Email già registrata");

    // Validazione Password (P)
    if (!password || password === "") throw new Error("Password obbligatoria");
    if (password.length < 8) throw new Error("La password deve essere di almeno 8 caratteri");
    if (!/[A-Z]/.test(password)) throw new Error("La password deve contenere almeno una lettera maiuscola");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) throw new Error("La password deve contenere almeno un carattere speciale");

    // Validazione CodiceAzienda (CA)
    if (!codiceAzienda || codiceAzienda === "") throw new Error("Codice Azienda obbligatorio");

    //Controllo esistenza codice azienda
    const existingAzienda = await prisma.azienda.findUnique({ where: { codice: codiceAzienda } });
    if (!existingAzienda) throw new Error("Codice Azienda non esistente");

    // Se passa tutto
    return { success: true, message: "Corretto" };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║    TEST SUITE: REGISTRAZIONE DIPENDENTE (Tabella 1-16) ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    const testCases = [
        {
            id: "TC_RegistrazioneDipendente_1",
            obi: "M1: Matricola assente",
            inputs: { 
                matricola: "", 
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com", 
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Matricola obbligatoria",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_2",
            obi: "M2: Matricola già registrata",
            inputs: {
                matricola: "A1",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Matricola già registrata",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_3",
            obi: "LN1: Nome assente",
            inputs: {
                matricola: "A123",
                nome: "",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Nome obbligatorio",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_4",
            obi: "C1: Cognome assente",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Cognome obbligatorio",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_5",
            obi: "DN1: DataNascita assente",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Data di nascita obbligatoria",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_6",
            obi: "DN2: DataNascita non valida",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "2027-01-27",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "La data di nascita deve essere precedente a oggi",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_7",
            obi: "E1: Email assente",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Email obbligatoria",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_8",
            obi: "E2: Email già registrata",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "c@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Email già registrata",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_9",
            obi: "E3: Email non valida",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossigmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Inserisci un indirizzo email valido",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_10",
            obi: "P1: Password assente",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Password obbligatoria",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_11",
            obi: "P2: Password corta",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "1238A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "La password deve essere di almeno 8 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_12",
            obi: "P2: Password senza lettera maiuscola",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "La password deve contenere almeno una lettera maiuscola",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_13",
            obi: "P3: Password senza carattere speciale",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "La password deve contenere almeno un carattere speciale",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_14",
            obi: "CA1: CodiceAzienda assente",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: ""
            },
            oracolo: "Codice azienda obbligatorio",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_15",
            obi: "CA2: CodiceAzienda non valido",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINI26095"
            },
            oracolo: "Codice azienda non valido",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDipendente_16",
            obi: "CORRETTO: Dati validi",
            inputs: {
                matricola: "A123",
                nome: "Mario",
                cognome: "Rossi",
                dataNascita: "1999-01-20",
                email: "mariorossi@gmail.com",
                password: "12345678A!",
                codiceAzienda: "KINIT126095"
            },
            oracolo: "Corretto",
            tipo: "SUCCESS"
        }
    ];

    let passedCount = 0;

    for (const tc of testCases) {
        const logLabel = `🔹 [${tc.id}]`.padEnd(30);
        process.stdout.write(`${logLabel} ... `);

        try {
            const result = await registrazioneDipendente(prisma, tc.inputs);

            if (tc.tipo === "SUCCESS" && result.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passedCount++;
            } else {
                console.log(`❌ FALLITO (Atteso errore, ma successo)`);
            }
        } catch (error: any) {
            if (tc.tipo === "ERROR" && error.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passedCount++;
            } else {
                console.log(`❌ FALLITO (Messaggio: "${error.message}")`);
            }
        }
    }

    console.log("\n------------------------------------------------");
    console.log(`📊 RISULTATO: ${passedCount} / ${testCases.length} Test superati.`);

    await prisma.$disconnect();
    await pool.end();
    process.exit(passedCount === testCases.length ? 0 : 1);
}

runTestSuite();
