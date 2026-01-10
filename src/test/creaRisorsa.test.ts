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

// --- LOGICA DI BUSINESS: CREAZIONE RISORSA ---
async function creaRisorsa(prisma: any, params: any, sessione: any) {

    // Controllo Sessione
    if (!sessione || !sessione.isValid) {
        throw new Error("Errore: Sessione scaduta");
    }

    const { nome, tipo, schedaAllegata, descrizione } = params;

    // TC_RIS_2: Controllo specifico per il Nome
    if (!nome) {
        throw new Error("Errore: Nome è obbligatorio");
    }

    // TC_RIS_3: Controllo specifico per il Tipo
    if (!tipo) {
        throw new Error("Errore: Tipo è obbligatorio");
    }

    // TC_RIS_1: Controllo Dimensione File (Limite 1GB)
    const LIMIT_1GB = 1073741824;
    let size = 0;

    if (schedaAllegata) {
        if (schedaAllegata.mockSize) {
            size = schedaAllegata.mockSize;
        } else if (Buffer.isBuffer(schedaAllegata)) {
            size = schedaAllegata.length;
        }
    }

    if (size > LIMIT_1GB) {
        throw new Error("Errore: File troppo grande (>1GB)");
    }

    // Creazione nel DB
    const bufferDaSalvare = Buffer.isBuffer(schedaAllegata) ? schedaAllegata : null;

    const risorsa = await prisma.risorsa.create({
        data: {
            nome,
            tipo,
            descrizione: descrizione || "Descrizione test",
            stato: "Disponibile",
            schedaAllegata: bufferDaSalvare
        }
    });

    return { success: true, message: "Risorsa creata con successo", id: risorsa.id };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║    TEST SUITE: CREAZIONE RISORSA (TC_RIS 1–4)          ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    // Dati mock
    const mockFileSmall = Buffer.alloc(1024, 'a'); // 1KB
    const mockFileHuge = { mockSize: 2 * 1024 * 1024 * 1024 }; // 2GB (Simulato)

    const testCases = [
        {
            id: "TC_RIS_1",
            frame: "TT4, DC1, NR1, SS1", // Robustezza, File Grande, Errore, Sessione OK
            obi: "File > 1GB",
            inputs: { 
                nome: "Trapano Heavy", 
                tipo: "Macchinario", 
                schedaAllegata: mockFileHuge 
            },
            sessione: { isValid: true },
            oracolo: "Errore: File troppo grande (>1GB)",
            tipo: "ERROR"
        },
        {
            id: "TC_RIS_2",
            frame: "TT1, DC4, NR1, SS1", // Funzionale, Dato Mancante, Errore, Sessione OK
            obi: "Nome Mancante",
            inputs: { 
                nome: null, 
                tipo: "Macchinario", 
                schedaAllegata: null 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Nome è obbligatorio",
            tipo: "ERROR"
        },
        {
            id: "TC_RIS_3",
            frame: "TT1, DC4, NR1, SS1", // Funzionale, Dato Mancante, Errore, Sessione OK
            obi: "Tipo Mancante",
            inputs: { 
                nome: "Trapano NoTipo", 
                tipo: null, 
                schedaAllegata: null 
            },
            sessione: { isValid: true },
            oracolo: "Errore: Tipo è obbligatorio",
            tipo: "ERROR"
        },
        {
            id: "TC_RIS_4",
            frame: "TT1, DC5, NR1, SS1", // Funzionale, Dati Validi, Successo, Sessione OK
            obi: "Inserimento Corretto",
            inputs: { 
                nome: `TRAPANO_OK_${Date.now()}`, 
                tipo: "Macchinario", 
                descrizione: "Trapano a percussione test",
                schedaAllegata: mockFileSmall
            },
            sessione: { isValid: true },
            oracolo: "Risorsa creata con successo",
            tipo: "SUCCESS"
        }
    ];

    let passed = 0;
    const createdIds: bigint[] = [];

    for (const tc of testCases) {
        process.stdout.write(`🔹 [${tc.id}] ... `);
        try {
            const result = await creaRisorsa(prisma, tc.inputs, tc.sessione);
            
            if (result.success && result.id) {
                createdIds.push(result.id);
            }

            if (tc.tipo === "SUCCESS" && result.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log("❌ FALLITO (Doveva dare errore ma ha avuto successo)");
            }
        } catch (e: any) {
            if (tc.tipo === "ERROR" && e.message === tc.oracolo) {
                console.log("✅ PASSATO");
                passed++;
            } else {
                console.log(`❌ FALLITO (Messaggio atteso: "${tc.oracolo}", ricevuto: "${e.message}")`);
            }
        }
    }

    console.log("\n------------------------------------------------");
    console.log(`📊 RISULTATO: ${passed} / ${testCases.length} Test superati.`);

    // Pulizia
    for (const id of createdIds) {
        try { await prisma.risorsa.delete({ where: { id } }); } catch (e) {}
    }

    await prisma.$disconnect();
    await pool.end();
    process.exit(passed === testCases.length ? 0 : 1);
}

runTestSuite();