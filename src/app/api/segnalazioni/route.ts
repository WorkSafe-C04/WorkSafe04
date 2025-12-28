
import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

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

    const segnalazioni = await prisma.segnalazione.findMany({
      orderBy: {
        dataCreazione: 'desc'
      },
    });

    const serializedSegnalazioni = JSON.parse(JSON.stringify(segnalazioni, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serializedSegnalazioni);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const nuovaSegnalazione = await prisma.segnalazione.create({
      data: {
        titolo: formData.get('titolo') as string,
        descrizione: formData.get('descrizione') as string,
        risorsa: BigInt(formData.get('risorsa') as string),
        matricola: formData.get('matricola') as string,
        Allegato: {
          create: await Promise.all(files.map(async (f) => ({
            contenuto: Buffer.from(await f.arrayBuffer()),
            dimensione: BigInt(f.size),
          })))
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Errore salvataggio:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}