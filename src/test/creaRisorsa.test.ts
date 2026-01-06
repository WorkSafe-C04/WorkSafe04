/**
 * Test Creazione Risorsa
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 1. Carichiamo le variabili d'ambiente PRIMA di tutto
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   TEST CREAZIONE RISORSA (FIX EXPORT DEFAULT)  ║');
console.log('╚════════════════════════════════════════════════╝\n');

async function main() {
  
  // 2. Import dinamico correggendo l'accesso al "default"
  //    Il file prisma.ts usa "export default", quindi dobbiamo accedere alla proprietà .default
  const prismaModule = await import('../core/db/prisma');
  const prisma = prismaModule.default;

  console.log('🔍 1. Verifica connessione...');
  
  if (!prisma) {
      console.error('❌ ERRORE GRAVE: Impossibile caricare l\'istanza di Prisma dal modulo.');
      process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log('✅ Database connesso correttamente.');
  } catch (error) {
    console.error('❌ Errore critico di connessione:', error);
    process.exit(1);
  }

  console.log('\n🔍 2. Creazione risorsa di test...');
  const nomeTest = `TEST_FINAL_${Date.now()}`;
  let idRisorsa = null;

  try {
    const risorsa = await prisma.risorsa.create({
      data: {
        nome: nomeTest,
        tipo: 'Macchinario',
        descrizione: 'Risorsa creata dal test unitario',
        stato: 'Disponibile',
        schedaAllegata: null 
      },
    });
    
    idRisorsa = risorsa.id;
    console.log('✅ Risorsa creata con successo!');
    // Gestiamo il caso in cui l'ID sia un BigInt (che non si stampa bene nei log JSON)
    console.log(`   ID: ${idRisorsa.toString()}`);
    console.log(`   Nome: ${risorsa.nome}`);

  } catch (error) {
    console.error('❌ Errore durante la creazione della risorsa:', error);
    process.exit(1);
  }

  // 3. Pulizia
  if (idRisorsa) {
    console.log('\n🧹 3. Pulizia dati...');
    try {
      await prisma.risorsa.delete({
        where: { id: idRisorsa }
      });
      console.log('✅ Risorsa eliminata.');
    } catch (cleanupError) {
      console.warn('⚠️ Attenzione: Impossibile eliminare la risorsa di test.');
    }
  }

  await prisma.$disconnect();
  console.log('\n✅ TEST COMPLETATO - NESSUN ERRORE');
}

main().catch((e) => {
  console.error('Errore imprevisto:', e);
  process.exit(1);
});