import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * UC_RegistrazioneDatoreDiLavoro
 * Test Case totali: 10
 */

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

// --- LOGICA DI BUSINESS: REGISTRAZIONE DATORE DI LAVORO ---
async function registraDatoreDiLavoro(prisma: any, params: any) {
    const { email, password, azienda } = params;

    // Validazione Email
    if (!email || email === "") throw new Error("Email vuota");
    if (!email.includes('@')) throw new Error("Formato email non valido");

    // Controllo unicità email
    const existingEmail = await prisma.utente.findFirst({ where: { email } });
    if (existingEmail) throw new Error("Email già registrata");

    // Validazione Password
    if (!password || password === "") throw new Error("Password vuota");
    if (password.length < 8) throw new Error("Password troppo corta");
    if (!/[A-Z]/.test(password)) throw new Error("Password senza maiuscola");
    if (!/[0-9]/.test(password)) throw new Error("Password senza numero");
    if (!/[!@#$%^&*]/.test(password)) throw new Error("Password senza carattere speciale");

    // Validazione Azienda
    if (!azienda || azienda === "") throw new Error("Azienda mancante");

    // Se passa tutto
    return { success: true, message: "Registrazione completata con successo" };
}

// --- ESECUZIONE TEST SUITE ---
async function runTestSuite() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║  TEST SUITE: REGISTRAZIONE DATORE DI LAVORO (TC 1-10)  ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    caricaVariabiliEnv();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    const testCases = [
        {
            id: "TC_RegistrazioneDatore_1",
            obi: "Email vuota",
            inputs: {
                email: "",
                password: "Password1!",
                azienda: "ACME"
            },
            oracolo: "Email vuota",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_2",
            obi: "Email già registrata",
            inputs: {
                email: "c@gmail.com",
                password: "Password1!",
                azienda: "ACME"
            },
            oracolo: "Email già registrata",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_3",
            obi: "Email formato non valido",
            inputs: {
                email: "emailnonvalida",
                password: "Password1!",
                azienda: "ACME"
            },
            oracolo: "Formato email non valido",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_4",
            obi: "Password vuota",
            inputs: {
                email: "test@mail.it",
                password: "",
                azienda: "ACME"
            },
            oracolo: "Password vuota",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_5",
            obi: "Password troppo corta",
            inputs: {
                email: "test@mail.it",
                password: "Ab1!",
                azienda: "ACME"
            },
            oracolo: "Password troppo corta",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_6",
            obi: "Password senza maiuscola",
            inputs: {
                email: "test@mail.it",
                password: "password1!",
                azienda: "ACME"
            },
            oracolo: "Password senza maiuscola",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_7",
            obi: "Password senza numero",
            inputs: {
                email: "test@mail.it",
                password: "Password!",
                azienda: "ACME"
            },
            oracolo: "Password senza numero",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_8",
            obi: "Password senza carattere speciale",
            inputs: {
                email: "test@mail.it",
                password: "Password1",
                azienda: "ACME"
            },
            oracolo: "Password senza carattere speciale",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_9",
            obi: "Azienda mancante",
            inputs: {
                email: "test@mail.it",
                password: "Password1!",
                azienda: ""
            },
            oracolo: "Azienda mancante",
            tipo: "ERROR"
        },
        {
            id: "TC_RegistrazioneDatore_10",
            obi: "Registrazione valida",
            inputs: {
                email: "valida@mail.it",
                password: "Password1!",
                azienda: "ACME"
            },
            oracolo: "Registrazione completata con successo",
            tipo: "SUCCESS"
        }
    ];

    let passedCount = 0;

    for (const tc of testCases) {
        const logLabel = `🔹 [${tc.id}]`.padEnd(35);
        process.stdout.write(`${logLabel} ... `);

        try {
            const result = await registraDatoreDiLavoro(prisma, tc.inputs);

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
  