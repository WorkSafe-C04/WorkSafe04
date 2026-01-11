import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import dayjs from 'dayjs';

//CONFIGURAZIONE AMBIENTE
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
    } catch (e) {}
  });
  if (!caricato && !process.env.DATABASE_URL) {
    console.error("❌ ERRORE: Impossibile trovare DATABASE_URL.");
    process.exit(1);
  }
}

//LOGICA DI BUSINESS 
async function filtroSegnalazioni(prisma: any, params: any, sessione: any) {
  
  if (!sessione || !sessione.isValid) {
    throw new Error("Sessione scaduta");
  }

  const { titolo, dataCreazione, nomeRisorsa, stato, priorita } = params;

  // TC_1: Controllo Titolo
  if (titolo && titolo.length > 50) {
    throw new Error("Il testo di ricerca è troppo lungo");
  }

  // TC_2 & TC_3: Controllo Data
  if (dataCreazione) {
    const data = dayjs(dataCreazione);
    
    const isFormatValid = data.isValid() && data.format('YYYY-MM-DD') === dataCreazione;
    
    if (!isFormatValid) {
        throw new Error("Formato data non valido");
    }

    if (data.isAfter(dayjs(), 'day')) {
        throw new Error("La data selezionata non può essere nel futuro");
    }
  }

  // TC_4: Risorsa
  if (nomeRisorsa) {
    const risorsaTrovata = await prisma.risorsa.findFirst({
      where: { nome: nomeRisorsa }
    });
    if (!risorsaTrovata) {
      throw new Error("Risorsa non trovata nel sistema");
    }
  }

  // TC_5: Stato 
  const statiValidi = ['APERTA', 'IN_LAVORAZIONE', 'COMPLETATA']; 
  if (stato && !statiValidi.includes(stato)) {
    throw new Error("Valore stato non valido");
  }

  // TC_6: 
  const prioritaValide = ['ALTA', 'MEDIA', 'BASSA'];
  if (priorita && !prioritaValide.includes(priorita)) {
    throw new Error("Valore priorità non valido");
  }

  // TC_8: 
  const whereClause: any = {};
  if (titolo && titolo !== "(Nessun filtro)") whereClause.titolo = { contains: titolo };
  if (stato && stato !== "(Nessun filtro)") whereClause.stato = stato;
  if (priorita && priorita !== "(Nessun filtro)") whereClause.priorita = priorita;
  
  if (nomeRisorsa && nomeRisorsa !== "(Nessun filtro)") {
      whereClause.Risorsa = { nome: nomeRisorsa };
  }
  return await prisma.segnalazione.findMany({
    where: whereClause
  });
}

//ESECUZIONE TEST SUITE
async function runTestSuite() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║   TEST SUITE: FILTRO SEGNALAZIONI                      ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  caricaVariabiliEnv();
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  let idRisorsaCreated: any = null;
  let idSegnalazioneCreated: any = null;

  try {
    console.log("🛠️  SETUP: Creazione dati nel DB...");
    const risorsa = await prisma.risorsa.create({
      data: { nome: "TrapanoTest", tipo: "Strumento", stato: "DISPONIBILE" } as any
    });
    idRisorsaCreated = risorsa.id;

    const segnalazione = await prisma.segnalazione.create({
      data: {
        titolo: "Guasto Test Unitario",
        descrizione: "Descrizione di prova",
        stato: "APERTA",
        priorita: "ALTA",
        risorsa: risorsa.id
      } as any
    });
    idSegnalazioneCreated = segnalazione.id;
    console.log(`✅ Dati creati correttamente.\n`);

    const testCases = [
      {
        id: "TC_FiltraSegn_1",
        obi: "Titolo > 50 caratteri", 
        inputs: { titolo: "QuestaStringaÈSicuramenteMaggioreDiCinquantaCaratteri12345" },
        sessione: { isValid: true },
        oracolo: "Il testo di ricerca è troppo lungo",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_2",
        obi: "Data non valida (31-02)",
        inputs: { dataCreazione: "2025-02-31" }, 
        sessione: { isValid: true },
        oracolo: "Formato data non valido",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_3",
        obi: "Data futura",
        inputs: { dataCreazione: dayjs().add(1, 'year').format('YYYY-MM-DD') },
        sessione: { isValid: true },
        oracolo: "La data selezionata non può essere nel futuro",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_4",
        obi: "Risorsa inesistente",
        inputs: { nomeRisorsa: "Macchinario_Che_Non_Esiste" },
        sessione: { isValid: true },
        oracolo: "Risorsa non trovata nel sistema",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_5",
        obi: "Stato non valido",
        inputs: { stato: "STATO_FANTASMA" },
        sessione: { isValid: true },
        oracolo: "Valore stato non valido",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_6",
        obi: "Priorità non valida",
        inputs: { priorita: "SUPER_URGENTE" },
        sessione: { isValid: true },
        oracolo: "Valore priorità non valido",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_7",
        obi: "Sessione scaduta",
        inputs: { titolo: "Guasto" },
        sessione: { isValid: false }, 
        oracolo: "Sessione scaduta",
        tipo: "ERROR"
      },
      {
        id: "TC_FiltraSegn_8",
        obi: "Happy Path (Tutto OK)",
        inputs: { 
          titolo: "Guasto", 
          risorsa: "TrapanoTest",
          priorita: "ALTA",
          stato: "APERTA",
          dataCreazione: dayjs().format('YYYY-MM-DD') 
        },
        sessione: { isValid: true },
        oracolo: "Successo",
        tipo: "SUCCESS"
      }
    ];

    let passedCount = 0;

    for (const tc of testCases) {
      const titoloLog = `🔹 [${tc.id}]`.padEnd(20);
      process.stdout.write(`${titoloLog} ... `);
      
      try {
        const result = await filtroSegnalazioni(prisma, tc.inputs, tc.sessione);
        
        if (tc.tipo === "SUCCESS") {
          const found = result.some((s: any) => s.id === idSegnalazioneCreated);
          if (found) {
            console.log("✅ PASSATO");
            passedCount++;
          } else {
            console.log("❌ FALLITO (Record creato non trovato nei risultati)");
          }
        } else {
          console.log(`❌ FALLITO (Atteso errore "${tc.oracolo}", ma la funzione ha avuto successo)`);
        }

      } catch (error: any) {
        if (tc.tipo === "ERROR") {
          if (error.message.includes(tc.oracolo)) {
             console.log(`✅ PASSATO`);
             passedCount++;
          } else {
             console.log(`❌ FALLITO (Messaggio errore diverso. Ricevuto: "${error.message}")`);
          }
        } else {
          console.log(`❌ FALLITO (Errore imprevisto non gestito: ${error.message})`);
        }
      }
    }

    console.log("\n------------------------------------------------");
    console.log(`📊 TOTALE: ${passedCount} / ${testCases.length} Test superati.`);
    
    if (passedCount !== testCases.length) {
      process.exit(1);
    }

  } catch (error) {
    console.error("\n🟥 ERRORE CRITICO DI SISTEMA:", error);
    process.exit(1);
  } finally {
    if (idSegnalazioneCreated) {
      await prisma.segnalazione.delete({ where: { id: idSegnalazioneCreated } as any }).catch(() => {});
    }
    if (idRisorsaCreated) {
      await prisma.risorsa.delete({ where: { id: idRisorsaCreated } as any }).catch(() => {});
    }
    await prisma.$disconnect();
    await pool.end();
    console.log("🧹 Ambiente ripulito e connessioni chiuse.");
  }
}

runTestSuite();