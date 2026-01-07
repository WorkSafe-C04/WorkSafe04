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

// --- LOGICA DI BUSINESS: REGISTRAZIONE AZIENDA ---
async function registrazioneAzienda(prisma: any, params: any, sessione: any) {

    // TC_11: Verifica Sessione (SU1 = Scaduta, SU2 = Valida)
    if (!sessione || !sessione.isValid) {
        throw new Error("Errore: Sessione scaduta");
    }

    const { partitaIva, ragioneSociale, sede, recapito } = params;

    // Validazione Partita IVA (LPI)
    if (!partitaIva || partitaIva === "") throw new Error("Errore: Partita IVA non inserita");
    if (partitaIva.length > 0 && partitaIva.length < 11) throw new Error("Errore: Partita IVA troppo corta");
    if (partitaIva.length > 11) throw new Error("Errore: Partita IVA troppo lunga");

    // Validazione Ragione Sociale (LRS)
    if (!ragioneSociale || ragioneSociale === "") throw new Error("Errore: Ragione Sociale non inserita");
    if (ragioneSociale.length > 64) throw new Error("Errore: Ragione Sociale troppo lunga");

    // Validazione Sede (LS)
    if (!sede || sede === "") throw new Error("Errore: Sede non inserita");
    if (sede.length > 100) throw new Error("Errore: Sede troppo lunga");

    // Validazione Recapito (LR)
    if (!recapito || recapito === "") throw new Error("Errore: Recapito non inserito");
    if (recapito.length > 0 && recapito.length < 10) throw new Error("Errore: Recapito troppo corto");
    if (recapito.length > 10) throw new Error("Errore: Recapito troppo lungo");

    // Se passa tutto (TC_12)
    return { success: true, message: "Corretto" };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║    TEST SUITE: REGISTRAZIONE AZIENDA (Tabella 1-12)    ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    const testCases = [
        {
            id: "TC_RegistrazioneAzienda_1",
            obi: "LPI1: P.IVA assente",
            inputs: { 
                partitaIva: "", 
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma", 
                recapito: "3331234567" 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Partita IVA non inserita",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_2",
            obi: "LPI2: P.IVA < 11",
            inputs: {
                partitaIva: "IT12345",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Partita IVA troppo corta",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_3",
            obi: "LPI3: P.IVA > 11",
            inputs: {
                partitaIva: "IT1234567892345",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Partita IVA troppo lunga",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_4",
            obi: "LRS1: Ragione Soc. assente",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Ragione Sociale non inserita",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_5",
            obi: "LRS2: Ragione Soc. lunga",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "A".repeat(101),
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Ragione Sociale troppo lunga",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_6",
            obi: "LS1: Sede assente",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Sede non inserita",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_7",
            obi: "LS2: Sede lunga",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "S".repeat(151),
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Sede troppo lunga",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_8",
            obi: "LR1: Recapito assente",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: ""
            },
            sessione: { isValid: true },
            oracolo: "Errore: Recapito non inserito",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_9",
            obi: "LR2: Recapito corto",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "123"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Recapito troppo corto",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_10",
            obi: "LR3: Recapito lungo",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "333123456789"
            },
            sessione: { isValid: true },
            oracolo: "Errore: Recapito troppo lungo",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_11",
            obi: "SU1: Sessione scaduta",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Tech Safety Solutions S.r.l.",
                sede: "Via dell'Innovazione 42, Roma",
                recapito: "3331234567"
            },
            sessione: { isValid: false },
            oracolo: "Errore: Sessione scaduta",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneAzienda_12",
            obi: "CORRETTO: Dati validi",
            inputs: {
                partitaIva: "IT123456789",
                ragioneSociale: "Azienda Valida SRL",
                sede: "Corso Italia 10",
                recapito: "3331234567"
            },
            sessione: { isValid: true },
            oracolo: "Corretto",
            tipo: "SUCCESS"
        }
    ];

    let passedCount = 0;

    for (const tc of testCases) {
        const logLabel = `🔹 [${tc.id}]`.padEnd(30);
        process.stdout.write(`${logLabel} ... `);

        try {
            const result = await registrazioneAzienda(prisma, tc.inputs, tc.sessione);

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