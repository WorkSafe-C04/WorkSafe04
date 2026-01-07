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

// --- LOGICA DI BUSINESS: CREAZIONE AVVISO ---
async function creaAvviso(prisma: any, params: any, sessione: any) {

    // SU2: Sessione scaduta
    // Nota: Controllo preliminare sulla validità della sessione
    if (!sessione || !sessione.isValid) {
        throw new Error("Errore: Sessione scaduta");
    }

    const { titolo, descrizione } = params;

    // LT1: Titolo assente
    if (!titolo || titolo === "") {
        throw new Error("Errore: Inserisci un titolo");
    }

    // LT2: Titolo troppo corto (es. < 5 caratteri)
    if (titolo.length < 5) {
        throw new Error("Errore: Il titolo deve contenere almeno 5 caratteri");
    }

    // LT3: Titolo troppo lungo (es. > 35 caratteri)
    if (titolo.length > 35) {
        throw new Error("Errore: Il titolo non può superare i 35 caratteri");
    }

    // LD1: Descrizione assente
    if (!descrizione || descrizione === "") {
        throw new Error("Errore: Inserisci una descrizione");
    }

    // LD2: Descrizione troppo corta (es. < 20 caratteri)
    if (descrizione.length < 20) {
        throw new Error("Errore: La descrizione deve contenere almeno 20 caratteri");
    }

    // LD3: Descrizione troppo lunga (es. > 150 caratteri)
    if (descrizione.length > 150) {
        throw new Error("Errore: La descrizione non può superare i 150 caratteri");
    }

    // TC_CreAvviso_8 (Caso Felice)
    return { success: true, message: "Corretto l’avviso viene creato correttamente" };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║      TEST SUITE: CREAZIONE AVVISO (TC 1–8)             ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    // Stringhe di supporto per generare i casi di test
    const validTitle = "Titolo test";
    const validDesc = "Controllo funzionamento descrizione valida standard.";

    const testCases = [
        {
            id: "TC_CreAvviso_1",
            frame: "LT1, LD4, SU1",
            inputs: { 
                titolo: "", 
                descrizione: validDesc 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Inserisci un titolo",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_2",
            frame: "LT2, LD4, SU1",
            inputs: { 
                titolo: "Test", // < 5 chars
                descrizione: validDesc
            },
            sessione: { isValid: true },
            oracolo: "Errore: Il titolo deve contenere almeno 5 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_3",
            frame: "LT3, LD4, SU1",
            inputs: { 
                titolo: "ATTENZIONE: Questo titolo supera volutamente i limiti consentiti", 
                descrizione: validDesc
            },
            sessione: { isValid: true },
            oracolo: "Errore: Il titolo non può superare i 35 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_4",
            frame: "LT4, LD1, SU1",
            inputs: { 
                titolo: validTitle, 
                descrizione: "" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Inserisci una descrizione",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_5",
            frame: "LT4, LD2, SU1",
            inputs: { 
                titolo: validTitle, 
                descrizione: "Troppo breve" // < 20 chars
            },
            sessione: { isValid: true },
            oracolo: "Errore: La descrizione deve contenere almeno 20 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_6",
            frame: "LT4, LD3, SU1",
            inputs: { 
                titolo: validTitle, 
                descrizione: "Si richiede attenzione immediata per un problema di sicurezza rilevato nel settore B. Il protocollo di emergenza deve essere attivato immediatamente da tutto il personale autorizzato presente in loco senza esitazione alcuna." // > 150 chars
            },
            sessione: { isValid: true },
            oracolo: "Errore: La descrizione non può superare i 150 caratteri",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_7",
            frame: "LT4, LD4, SU2",
            inputs: { 
                titolo: validTitle, 
                descrizione: validDesc 
            },
            sessione: { isValid: false }, // Sessione scaduta (SU2)
            oracolo: "Errore: Sessione scaduta",
            tipo: "ERROR"
        },
        {
            id: "TC_CreAvviso_8",
            frame: "LT4, LD4, SU1",
            inputs: { 
                titolo: validTitle, 
                descrizione: validDesc
            },
            sessione: { isValid: true },
            oracolo: "Corretto l’avviso viene creato correttamente",
            tipo: "SUCCESS"
        }
    ];

    let passed = 0;

    for (const tc of testCases) {
        process.stdout.write(`🔹 [${tc.id}] ... `);
        try {
            const result = await creaAvviso(prisma, tc.inputs, tc.sessione);
            if (tc.tipo === "SUCCESS" && result.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log(`❌ FALLITO (Atteso: "${tc.oracolo}", Ottenuto: "${result.message}")`);
            }
        } catch (e: any) {
            if (tc.tipo === "ERROR" && e.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log(`❌ FALLITO (Atteso: "${tc.oracolo}", Ottenuto: "${e.message}")`);
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