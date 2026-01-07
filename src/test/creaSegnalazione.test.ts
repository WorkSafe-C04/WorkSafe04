import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// --- CONFIGURAZIONE AMBIENTE ---
function caricaVariabiliEnv() {
    const envFiles = ['.env', '.env.local'];
    envFiles.forEach(file => {
        try {
            const envPath = path.resolve(__dirname, '../../', file);
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf-8');
                envConfig.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const [key, ...valueParts] = trimmed.split('=');
                        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                        if (!process.env[key]) process.env[key] = value;
                    }
                });
            }
        } catch (_) {}
    });
}

// --- LOGICA DI BUSINESS: CREAZIONE SEGNALAZIONE ---
async function creaSegnalazione(prisma: any, params: any, sessione: any) {

    // SU2: Sessione scaduta
    if (!sessione || !sessione.isValid) {
        throw new Error("Errore: Sessione scaduta");
    }

    const { titolo, risorsa, descrizione } = params;

    // LT1: Titolo assente
    if (!titolo || titolo === "") {
        throw new Error("Errore: Inserisci un titolo");
    }

    // LT2: Titolo < 3 caratteri
    if (titolo.length < 3) {
        throw new Error("Errore: Il titolo deve contenere almeno 3 caratteri");
    }

    // LT3: Titolo > 50 caratteri
    if (titolo.length > 50) {
        throw new Error("Errore: Il titolo non può superare i 50 caratteri");
    }

    // SR1: Risorsa non selezionata
    if (!risorsa) {
        throw new Error("Errore: Seleziona una risorsa");
    }

    // LD1: Descrizione assente
    if (!descrizione || descrizione === "") {
        throw new Error("Errore: Inserisci una descrizione");
    }

    // LD2: Descrizione troppo corta
    if (descrizione.length < 20) {
        throw new Error("Errore: Descrizione troppo corta");
    }

    // LD3: Descrizione troppo lunga
    if (descrizione.length > 300) {
        throw new Error("Errore: Descrizione troppo lunga");
    }

    // TC_CreaSegnalazione_9
    return { success: true, message: "Segnalazione creata con successo" };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║    TEST SUITE: CREAZIONE SEGNALAZIONE (TC 1–9)         ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    const testCases = [
        {
            id: "TC_CreaSegnalazione_1",
            frame: "LT1, SR2, LD4, SU1",
            inputs: { 
                titolo: "", 
                descrizione: "Saldatore non funzionante a causa della punta eccessivamente usurata", 
                risorsa: "Saldatore a Stagno 7" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Inserisci un titolo",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_2",
            frame: "LT2, SR2, LD4, SU1",
            inputs: { 
                titolo: "Sa", 
                descrizione: "Saldatore non funzionante a causa della punta eccessivamente usurata", 
                risorsa: "Saldatore a Stagno 1" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Il titolo deve contenere almeno 3 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_3",
            frame: "LT3, SR2, LD4, SU1",
            inputs: { 
                titolo: "Riparazione urgente del saldatore a stagno laboratorio", 
                descrizione: "Saldatore non funzionante a causa della punta eccessivamente usurata", 
                risorsa: "Saldatore a Stagno 3" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Il titolo non può superare i 50 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_4",
            frame: "LT4, SR1, LD4, SU1",
            inputs: { titolo: "Saldatore a stagno", descrizione: "Riparazione urgente del saldatore a stagno laboratorio", risorsa: null },
            sessione: { isValid: true },
            oracolo: "Errore: Seleziona una risorsa",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_5",
            frame: "LT4, SR2, LD1, SU1",
            inputs: { 
                titolo: "Saldatore a stagno", 
                descrizione: "", 
                risorsa: "Saldatore a Stagno 4" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Inserisci una descrizione",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_6",
            frame: "LT4, SR2, LD2, SU1",
            inputs: { 
                titolo: "Saldatore a stagno", 
                descrizione: "Non funziona", 
                risorsa: "Saldatore a Stagno 6" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Descrizione troppo corta",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_7",
            frame: "LT4, SR2, LD3, SU1",
            inputs: { 
                titolo: "Saldatore a stagno", 
                descrizione: "Il saldatore a stagno non è più funzionante a causa della punta eccessivamente usurata e ossidata. Questo problema impedisce di raggiungere la temperatura necessaria per sciogliere lo stagno in modo uniforme, rendendo impossibile proseguire con le normali attività di riparazione dei circuiti nel laboratorio.", 
                risorsa: "Saldatore a Stagno 2" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Descrizione troppo lunga",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_8",
            frame: "LT4, SR2, LD4, SU2",
            inputs: { 
                titolo: "Saldatore a stagno", 
                descrizione: "“Saldatore non funzionante a causa della punta eccessivamente usurata”", 
                risorsa: "Saldatore a Stagno 13" 
            },
            sessione: { isValid: false },
            oracolo: "Errore: Sessione scaduta",
            tipo: "ERROR"
        },
        {
            id: "TC_CreaSegnalazione_9",
            frame: "LT4, SR2, LD4, SU1",
            inputs: { 
                titolo: "Saldatore a stagno",  
                descrizione: "Saldatore non funzionante a causa della punta eccessivamente usurata",
                risorsa: "Saldatore a Stagno 13"
            },
            sessione: { isValid: true },
            oracolo: "Segnalazione creata con successo",
            tipo: "SUCCESS"
        }
    ];

    let passed = 0;

    for (const tc of testCases) {
        process.stdout.write(`🔹 [${tc.id}] ... `);
        try {
            const result = await creaSegnalazione(prisma, tc.inputs, tc.sessione);
            if (tc.tipo === "SUCCESS" && result.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log("❌ FALLITO");
            }
        } catch (e: any) {
            if (tc.tipo === "ERROR" && e.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log(`❌ FALLITO (${e.message})`);
            }
        }
    }

    console.log("\n------------------------------------------------");
    console.log(`📊 RISULTATO: ${passed} / ${testCases.length} Test superati.`);

    await prisma.$disconnect();
    await pool.end();
    process.exit(passed === testCases.length ? 0 : 1);
}

runTestSuite();
