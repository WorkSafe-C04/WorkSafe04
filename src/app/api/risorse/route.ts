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

  // Solo Admin e RSPP possono creare risorse
  if (!['Admin', 'RSPP'].includes(user.ruolo)) {
    return NextResponse.json(
      { error: 'Permessi insufficienti. Solo Admin e RSPP possono creare risorse.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    let bufferFile = null;
    if (body.schedaAllegata) {
       const base64Clean = body.schedaAllegata.split(',')[1] || body.schedaAllegata;
       bufferFile = Buffer.from(base64Clean, 'base64');
    }

    const nuovaRisorsa = await prisma.risorsa.create({
      data: {
        nome: body.nome,
        tipo: body.tipo,
        descrizione: body.descrizione,
        stato: "Disponibile",
        schedaAllegata: bufferFile
      }
    });

    return NextResponse.json(serializeData(nuovaRisorsa), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stato } = body;
    const MOCK_ROLE = "MANUTENTORE";
    if (MOCK_ROLE !== "MANUTENTORE") return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

    if (!id || !stato) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const risorsaAggiornata = await prisma.risorsa.update({
      where: { id: BigInt(id) },
      data: { stato: stato }
    });

    return NextResponse.json(serializeData(risorsaAggiornata));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}