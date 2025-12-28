
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
      include: {
        Allegato: true
      },
      orderBy: {
        dataCreazione: 'desc'
      },
    });
    
    const segnalazioniConAllegati = segnalazioni.map(segnalazione => {
      const allegatiBase64 = segnalazione.Allegato.map(allegato => {
        if (!allegato.contenuto || allegato.contenuto.length === 0) {
          return null;
        }
        
        const base64 = Buffer.from(allegato.contenuto).toString('base64');
        return `data:image/jpeg;base64,${base64}`;
      }).filter(Boolean);

      return {
        id: segnalazione.id.toString(),
        titolo: segnalazione.titolo,
        descrizione: segnalazione.descrizione,
        risorsa: segnalazione.risorsa?.toString(),
        matricola: segnalazione.matricola,
        dataCreazione: segnalazione.dataCreazione,
        stato: segnalazione.stato,
        allegati: allegatiBase64
      };
    });

    return NextResponse.json(segnalazioniConAllegati);
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