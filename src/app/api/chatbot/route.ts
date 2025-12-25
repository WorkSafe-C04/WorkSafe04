import { StreamingTextResponse } from 'ai';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);

        if (response.status === 429 && i < retries - 1) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
        }

        return response;
    }

    throw new Error('Max retries reached');
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    // System prompt per la sicurezza sul lavoro
    const systemPrompt = {
        role: 'system',
        content: `Sei un assistente esperto in sicurezza sul lavoro per il sistema WorkSafe. 

Il tuo ruolo è fornire supporto tecnico e informazioni su:
- Normative e regolamenti sulla sicurezza sul lavoro (D.Lgs. 81/2008 e successive modifiche)
- Procedure di sicurezza e best practices
- Utilizzo corretto dei DPI (Dispositivi di Protezione Individuale)
- Gestione delle emergenze e primo soccorso
- Formazione obbligatoria per i lavoratori
- Valutazione dei rischi e misure preventive
- Segnalazione di incidenti e near-miss
- Funzionamento delle risorse e strumenti disponibili nel sistema WorkSafe

Rispondi sempre in italiano in modo chiaro, professionale e preciso. Se non sei sicuro di una risposta tecnica specifica, indica di consultare il responsabile della sicurezza aziendale o la documentazione ufficiale. 

Mantieni un tono cordiale ma professionale, e cerca sempre di essere pratico e applicabile nelle tue risposte.`
    };

    // Aggiungi il system prompt all'inizio dei messaggi
    const messagesWithSystem = [systemPrompt, ...messages];

    try {
        const response = await fetchWithRetry('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama3.1-8b',
                messages: messagesWithSystem,
                stream: true,
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cerebras API error:', errorText);

            if (response.status === 429) {
                return new Response(
                    JSON.stringify({
                        error: 'Il servizio è momentaneamente sovraccarico. Riprova tra qualche secondo.'
                    }),
                    { status: 429, headers: { 'Content-Type': 'application/json' } }
                );
            }

            throw new Error(`API error: ${response.status}`);
        }

        // Transform the Cerebras SSE stream to text stream with proper formatting
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body!.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6).trim();
                                if (data === '[DONE]') continue;

                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        // Send with proper formatting for useChat
                                        controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
                                    }
                                } catch (e) {
                                    // Skip invalid JSON
                                }
                            }
                        }
                    }
                } catch (error) {
                    controller.error(error);
                } finally {
                    controller.close();
                }
            },
        });

        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Cerebras API error:', error);
        return new Response(
            JSON.stringify({ error: 'Si è verificato un errore. Riprova più tardi.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}