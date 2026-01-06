/**
 * Test di validazione token per il Chatbot WorkSafe
 * 
 * Questo script verifica che il token API di Cerebras sia valido
 * e che il chatbot possa comunicare correttamente con l'API
 * 
 * COMANDO PER ESEGUIRE IL TEST:
 * npx ts-node src/test/chatbot.test.tsx
 * 
 * oppure con il comando npm:
 * npm run test:chatbot
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carica le variabili d'ambiente dal file .env
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   TEST VALIDAZIONE TOKEN CHATBOT WORKSAFE     ║');
console.log('╚════════════════════════════════════════════════╝\n');

async function testChatbotToken() {
    // Step 1: Verifica che il token esista
    console.log('🔍 Step 1: Verifica esistenza token...');
    const apiKey = process.env.CEREBRAS_API_KEY;
    
    if (!apiKey) {
        console.error('❌ ERRORE: Token CEREBRAS_API_KEY non trovato nelle variabili d\'ambiente');
        console.error('   Assicurati di aver configurato il file .env o .env.local\n');
        process.exit(1);
    }
    
    console.log('✅ Token trovato nelle variabili d\'ambiente');
    console.log(`   Lunghezza token: ${apiKey.length} caratteri\n`);

    // Step 2: Verifica formato token
    console.log('🔍 Step 2: Verifica formato token...');
    if (apiKey.length < 10) {
        console.error('❌ ERRORE: Token troppo corto, formato non valido\n');
        process.exit(1);
    }
    console.log('✅ Formato token valido\n');

    // Step 3: Test chiamata API
    console.log('🔍 Step 3: Test connessione API Cerebras...');
    console.log('   Invio richiesta di test...\n');
    
    const testMessages = [
        {
            role: 'system',
            content: 'Sei un assistente di test.'
        },
        {
            role: 'user',
            content: 'Rispondi solo con "OK" per il test'
        }
    ];

    try {
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama3.1-8b',
                messages: testMessages,
                stream: false,
                temperature: 0.7,
                max_tokens: 20,
            }),
        });

        // Verifica la risposta
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ ERRORE: Token non valido o richiesta fallita`);
            console.error(`   Status: ${response.status} ${response.statusText}`);
            console.error(`   Dettaglio: ${errorText}\n`);
            
            if (response.status === 401 || response.status === 403) {
                console.error('⚠️  Il token fornito non è autorizzato o è scaduto');
            } else if (response.status === 429) {
                console.error('⚠️  Troppe richieste, limite API raggiunto');
            }
            
            process.exit(1);
        }

        const data = await response.json();
        
        // Verifica struttura risposta
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            console.error('❌ ERRORE: Risposta API non valida\n');
            process.exit(1);
        }

        const message = data.choices[0]?.message?.content || '';
        
        console.log('✅ TOKEN VALIDO! Il chatbot funziona correttamente');
        console.log(`   Modello: ${data.model || 'N/A'}`);
        console.log(`   Risposta ricevuta: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
        console.log(`   Token utilizzati: ${data.usage?.total_tokens || 'N/A'}\n`);
        
        console.log('╔════════════════════════════════════════════════╗');
        console.log('║          ✅ TEST COMPLETATO CON SUCCESSO       ║');
        console.log('║     Il token del chatbot è valido e attivo    ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ ERRORE: Errore durante la chiamata API');
        if (error instanceof Error) {
            console.error(`   Messaggio: ${error.message}`);
        }
        console.error('   Verifica la connessione internet e riprova\n');
        process.exit(1);
    }
}

// Esegui il test
testChatbotToken().catch((error) => {
    console.error('❌ ERRORE CRITICO:', error);
    process.exit(1);
});
