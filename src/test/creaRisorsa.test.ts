/**
 * Test Suite: Gestione Risorse
 * Basato su Test Case Document (TC_RIS_1, TC_RIS_2, TC_RIS_3)
 * Author: Giuseppe Capriglione
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 1. Configurazione Ambiente
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║      TEST SUITE: CREAZIONE RISORSA (COMPLETO)  ║');
console.log('╚════════════════════════════════════════════════╝\n');

async function main() {
  
  // 2. Import Dinamico del Client Prisma (evita errori di init)
  const prismaModule = await import('../core/db/prisma');
  const prisma = prismaModule.default;

  if (!prisma) {
      console.error('❌ ERRORE CRITICO: Impossibile caricare Prisma Client.');
      process.exit(1);
  }

  // 3. Connessione Silenziosa
  try {
    await prisma.$connect();
    // Connessione OK (nessun log per pulizia output)
  } catch (error) {
    console.error('❌ Errore di connessione al Database:', error);
    process.exit(1);
  }

  let idRisorsaCreata = null;

  // ==================================================================================
  // 🟢 TC_RIS_3: Inserimento Corretto (Happy Path)
  // Obiettivo: Verificare inserimento con tutti i dati validi (Nome, Tipo, File)
  // ==================================================================================
  console.log('👉 [TC_RIS_3] Test Inserimento Valido (Nome, Tipo, Allegato)...');
  
  const nomeValido = `TRAPANO_TEST_${Date.now()}`;
  // Simuliamo un file PDF valido convertito in Buffer (Bytes)
  const fileValido = Buffer.from('Contenuto binario del PDF di test', 'utf-8');

  try {
    const risorsa = await prisma.risorsa.create({
      data: {
        nome: nomeValido,
        tipo: 'Macchinario',
        descrizione: 'Test automatico TC_RIS_3',
        stato: 'Disponibile',
        schedaAllegata: fileValido
      },
    });
    
    idRisorsaCreata = risorsa.id;
    
    // Verifica Oracolo (Controllo Dati)
    if (risorsa.id && risorsa.nome === nomeValido && risorsa.schedaAllegata) {
        console.log('✅ PASSATO: Risorsa creata correttamente.');
        console.log(`   Dettagli: ID=${risorsa.id} | Tipo=${risorsa.tipo} | File=${risorsa.schedaAllegata.length} bytes`);
    } else {
        throw new Error('Dati salvati incongruenti rispetto all\'input.');
    }

  } catch (error) {
    console.error('❌ FALLITO TC_RIS_3 (Errore inaspettato):', error);
    process.exit(1);
  }

  console.log('--------------------------------------------------\n');

  // ==================================================================================
  // 🔴 TC_RIS_2: Errore Campi Obbligatori (Nome e Tipo Vuoti)
  // Obiettivo: Verificare che il sistema blocchi l'inserimento se mancano dati chiave
  // ==================================================================================
  console.log('👉 [TC_RIS_2] Test Campi Obbligatori (Nome e Tipo Assenti)...');

  try {
    await prisma.risorsa.create({
      data: {
        nome: null as any, // ⚠️ Errore forzato: Nome mancante
        tipo: null as any, // ⚠️ Errore forzato: Tipo mancante
        descrizione: 'Test Fallimento TC_RIS_2',
        stato: 'Disponibile',
        schedaAllegata: null 
      },
    });

    // Se arriva qui, il test ha fallito perché DOVEVA dare errore
    console.error('❌ FALLITO TC_RIS_2: Il sistema ha permesso la creazione senza Nome/Tipo!');
    process.exit(1);

  } catch (error) {
    // Oracolo: Ci aspettiamo un errore di validazione
    console.log('✅ PASSATO: Il sistema ha bloccato l\'inserimento (Campi mancanti).');
  }

  console.log('--------------------------------------------------\n');

  // ==================================================================================
  // 🔴 TC_RIS_1: Errore File Non Valido
  // Obiettivo: Verificare comportamento con payload file errato/corrotto
  // ==================================================================================
  console.log('👉 [TC_RIS_1] Test File Invalido (Tipo Errato)...');

  try {
    await prisma.risorsa.create({
      data: {
        nome: `TEST_FAIL_FILE_${Date.now()}`,
        tipo: 'Macchinario',
        descrizione: 'Test Fallimento TC_RIS_1',
        stato: 'Disponibile',
        // ⚠️ Errore forzato: Passiamo una stringa invece di un Buffer (Bytes)
        schedaAllegata: "QUESTO_NON_E_UN_BUFFER_VALIDO" as any 
      },
    });

    console.error('❌ FALLITO TC_RIS_1: Il sistema ha accettato un file non valido!');
    process.exit(1);

  } catch (error) {
    console.log('✅ PASSATO: Il sistema ha bloccato l\'inserimento (File non valido).');
  }

  console.log('--------------------------------------------------\n');

  // 4. Pulizia Finale (Rollback)
  if (idRisorsaCreata) {
    try {
      await prisma.risorsa.delete({ where: { id: idRisorsaCreata } });
      // Pulizia silenziosa
    } catch (e) {
      console.warn('⚠️ Attenzione: Pulizia risorsa di test fallita.');
    }
  }

  await prisma.$disconnect();
  console.log('🎉 TUTTI I TEST COMPLETATI CON SUCCESSO');
}

main().catch((e) => {
  console.error('Errore imprevisto nello script di test:', e);
  process.exit(1);
});