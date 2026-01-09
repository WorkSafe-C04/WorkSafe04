import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// NUOVA FUNZIONE: Legge tutte le risorse
export async function GET(request: NextRequest) {
  // Verifica autenticazione
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  try {
    const risorse = await prisma.risorsa.findMany({
      where: {
        codiceAzienda: user.codiceAzienda
      },
      orderBy: { id: 'desc' }
    });

    // Mappiamo le risorse indicando se hanno un allegato o meno
    const risorseConAllegati = risorse.map(risorsa => ({
      ...risorsa,
      schedaAllegata: risorsa.schedaAllegata ? true : null
    }));

    return NextResponse.json(serializeData(risorseConAllegati));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Verifica autenticazione e ruolo
  const user = requireAuth(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  // Solo DatoreDiLavoro e ResponsabileSicurezza possono creare risorse
  if (!['DatoreDiLavoro', 'ResponsabileSicurezza'].includes(user.ruolo)) {
    return NextResponse.json(
      { error: 'Permessi insufficienti. Solo DatoreDiLavoro e ResponsabileSicurezza possono creare risorse.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    let bufferFile = null;
    if (body.schedaAllegata) {
      // Pulizia Base64 (rimozione header 'data:image/xyz;base64,')
      const base64Clean = body.schedaAllegata.split(',')[1] || body.schedaAllegata;
      
      // =================================================================
      // 🛡️ IMPLEMENTAZIONE CATEGORY PARTITION (TC_RIS_1)
      // Controllo Dimensione File: Limite 1GB (1 * 1024 * 1024 * 1024 bytes)
      // =================================================================
      const sizeInBytes = Buffer.byteLength(base64Clean, 'base64');
      const LIMIT_1GB = 1 * 1024 * 1024 * 1024; // 1 Gigabyte

      if (sizeInBytes > LIMIT_1GB) {
        return NextResponse.json(
          { error: "File troppo grande. Il limite massimo è 1GB." },
          { status: 413 } // 413 Payload Too Large
        );
      }
      // =================================================================

      bufferFile = Buffer.from(base64Clean, 'base64');
    }

    const nuovaRisorsa = await prisma.risorsa.create({
      data: {
        nome: body.nome,
        tipo: body.tipo,
        descrizione: body.descrizione,
        stato: "Disponibile",
        schedaAllegata: bufferFile,
        codiceAzienda: user.codiceAzienda
      }
    });

    return NextResponse.json(serializeData(nuovaRisorsa), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Verifica autenticazione
  const user = requireAuth(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  // SOLO IL MANUTENTORE può modificare lo stato della risorsa
  if (user.ruolo !== 'Manutentore') {
    return NextResponse.json(
      { error: 'Solo il Manutentore può modificare lo stato delle risorse' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, stato } = body;

    if (!id || !stato) {
      return NextResponse.json({ error: "ID e stato sono obbligatori" }, { status: 400 });
    }

    // Aggiorna lo stato della risorsa
    const risorsaAggiornata = await prisma.risorsa.update({
      where: { id: BigInt(id) },
      data: { stato: stato }
    });

    // Trova tutte le segnalazioni aperte per questa risorsa
    const segnalazioniAperte = await prisma.segnalazione.findMany({
      where: {
        risorsa: BigInt(id),
        stato: { notIn: ['Completata', 'Chiusa'] }
      }
    });

    // Aggiorna lo stato delle segnalazioni in base allo stato della risorsa
    if (segnalazioniAperte.length > 0) {
      let nuovoStatoSegnalazione = '';
      
      if (stato === 'In Manutenzione') {
        nuovoStatoSegnalazione = 'In Lavorazione';
      } else if (stato === 'Disponibile') {
        nuovoStatoSegnalazione = 'Completata';
      } else if (stato === 'Guasto') {
        nuovoStatoSegnalazione = 'In Attesa';
      } else if (stato === 'Segnalata') {
        nuovoStatoSegnalazione = 'Aperta';
      }

      // Aggiorna tutte le segnalazioni aperte
      if (nuovoStatoSegnalazione) {
          await prisma.segnalazione.updateMany({
            where: {
              risorsa: BigInt(id),
              stato: { notIn: ['Completata', 'Chiusa'] }
            },
            data: {
              stato: nuovoStatoSegnalazione
            }
          });
      }
    }

    return NextResponse.json(serializeData(risorsaAggiornata));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}