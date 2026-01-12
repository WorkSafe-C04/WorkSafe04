import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/* =================== ENV =================== */
function caricaVariabiliEnv() {
  const envFiles = [".env", ".env.local"];
  let caricato = false;

  for (const file of envFiles) {
    const p = path.resolve(__dirname, "../../", file);
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, "utf8");
      txt.split("\n").forEach(l => {
        const [k, ...v] = l.split("=");
        if (k && v.length) {
          // Rimuove virgolette e spazi
          let value = v.join("=").trim();
          value = value.replace(/^["']|["']$/g, '');
          process.env[k.trim()] ??= value;
        }
      });
      caricato = true;
      console.log(`✅ Caricato file ${file}`);
    }
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL non trovato");
    console.error("💡 Imposta DATABASE_URL come variabile d'ambiente o crea un file .env");
    console.error("   Esempio: DATABASE_URL=postgresql://user:password@host:5432/dbname");
    process.exit(1);
  }
  
  // Mostra il DATABASE_URL (nascondendo la password)
  const dbUrl = process.env.DATABASE_URL;
  const urlMasked = dbUrl.replace(/:([^@:]+)@/, ':***@');
  console.log(`✅ DATABASE_URL configurato: ${urlMasked}`);
}

/* =================== BUSINESS =================== */
async function filtroRisorse(prisma: any, params: any, sessione: any) {
  if (!sessione || !sessione.isValid) throw new Error("Sessione scaduta");

  const { filtroNome, filtroDescrizione, filtroStato } = params;

  if (filtroNome && filtroNome.length > 50) throw new Error("Nome troppo lungo");
  if (filtroDescrizione && filtroDescrizione.length > 100) throw new Error("Descrizione troppo lunga");

  const statiValidi = ["Disponibile", "In Manutenzione", "Segnalato"];
  if (filtroStato && !statiValidi.includes(filtroStato)) throw new Error("Stato non valido");

  const where: any = {};
  if (filtroNome) where.nome = { contains: filtroNome, mode: "insensitive" };
  if (filtroDescrizione) where.descrizione = { contains: filtroDescrizione, mode: "insensitive" };
  if (filtroStato) where.stato = filtroStato;

  return prisma.risorsa.findMany({ where });
}

/* =================== TEST SUITE =================== */
async function runTestSuite() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   TEST SUITE: FILTRO RISORSE            ║");
  console.log("╚════════════════════════════════════════╝");

  caricaVariabiliEnv();

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  let id: any;

  try {
    console.log("🛠️  Setup DB...");
    const r = await prisma.risorsa.create({
      data: {
        nome: "Trapano Bosch",
        descrizione: "Trapano professionale",
        tipo: "Strumento",
        stato: "Disponibile"
      } as any
    });
    id = r.id;

    const tests = [
      {
        id: "TC_R1",
        obi: "Nome > 50",
        input: { filtroNome: "X".repeat(60) },
        sessione: { isValid: true },
        oracolo: "Nome troppo lungo",
        tipo: "ERROR"
      },
      {
        id: "TC_R2",
        obi: "Descrizione > 100",
        input: { filtroDescrizione: "Y".repeat(120) },
        sessione: { isValid: true },
        oracolo: "Descrizione troppo lunga",
        tipo: "ERROR"
      },
      {
        id: "TC_R3",
        obi: "Stato invalido",
        input: { filtroStato: "ROTTO" },
        sessione: { isValid: true },
        oracolo: "Stato non valido",
        tipo: "ERROR"
      },
      {
        id: "TC_R4",
        obi: "Sessione scaduta",
        input: { filtroNome: "Trapano" },
        sessione: { isValid: false },
        oracolo: "Sessione scaduta",
        tipo: "ERROR"
      },
      {
        id: "TC_R5",
        obi: "Filtro nome OK",
        input: { filtroNome: "Trapano" },
        sessione: { isValid: true },
        tipo: "SUCCESS"
      },
      {
        id: "TC_R6",
        obi: "Filtro stato OK",
        input: { filtroStato: "Disponibile" },
        sessione: { isValid: true },
        tipo: "SUCCESS"
      }
    ];

    let ok = 0;

    for (const tc of tests) {
      process.stdout.write(`🔹 ${tc.id} ... `);
      try {
        const res = await filtroRisorse(prisma, tc.input, tc.sessione);
        if (tc.tipo === "SUCCESS" && res.some((x: any) => x.id === id)) {
          console.log("✅ PASSATO");
          ok++;
        } else {
          console.log("❌ FALLITO");
        }
      } catch (e: any) {
        if (tc.tipo === "ERROR" && e.message.includes(tc.oracolo)) {
          console.log("✅ PASSATO");
          ok++;
        } else {
          console.log("❌ FALLITO:", e.message);
        }
      }
    }

    console.log(`\n📊 ${ok}/${tests.length} superati`);

  } finally {
    if (id) await prisma.risorsa.delete({ where: { id } } as any);
    await prisma.$disconnect();
    await pool.end();
    console.log("🧹 Cleanup completato");
  }
}

runTestSuite();