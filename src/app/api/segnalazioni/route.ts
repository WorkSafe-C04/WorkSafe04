import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Recupera il parametro risorsaId dall'URL
  const { searchParams } = new URL(request.url);
  const risorsaId = searchParams.get('risorsaId');

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
      // qui aggiungo la clausola WHERE 
      // cosi se c'è un risorsaId, filtra per quello altrimenti prendi tutto
      where: risorsaId ? { risorsa: parseInt(risorsaId) } : {},

      orderBy: { id: 'desc' },
      include: {
        Allegato: true,
        Risorsa: { 
          select: { id: true, nome: true }
        }
      }
    });
    
    const data = segnalazioni.map(s => {
      const allegati = s.Allegato.map(a => 
        a.contenuto ? `data:image/jpeg;base64,${Buffer.from(a.contenuto).toString('base64')}` : null
      ).filter(Boolean);

      return {
        id: s.id.toString(),
        titolo: s.titolo,
        descrizione: s.descrizione,
        risorsa: s.risorsa?.toString(),
        matricola: s.matricola,
        dataCreazione: s.dataCreazione,
        stato: s.stato,
        priorita: s.priorita, 
        allegati: allegati,
        
        Risorsa: s.Risorsa ? {
            id: s.Risorsa.id.toString(),
            nome: s.Risorsa.nome
        } : null
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const titolo = formData.get('titolo') as string;
    const descrizione = formData.get('descrizione') as string;
    const risorsa = formData.get('risorsa') as string;
    const priorita = formData.get('priorita') as string;
    const files = formData.getAll('files') as File[];

    // Prepara gli allegati dai file caricati
    const allegatiData = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          contenuto: buffer,
          dimensione: BigInt(buffer.length),
          codiceAzienda: user.codiceAzienda
        };
      })
    );

    // Crea la segnalazione
    const segnalazione = await prisma.segnalazione.create({
      data: {
        titolo,
        descrizione,
        risorsa: risorsa ? BigInt(risorsa) : null,
        matricola: user.matricola,
        stato: 'Aperto',
        priorita: priorita || 'Media',
        codiceAzienda: user.codiceAzienda,
        Allegato: allegatiData.length > 0 ? {
          create: allegatiData
        } : undefined
      }
    });

    // Se c'è una risorsa associata, aggiorna il suo stato a "Segnalata"
    if (risorsa) {
      await prisma.risorsa.update({
        where: { id: BigInt(risorsa) },
        data: { stato: 'Segnalata' }
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        id: segnalazione.id.toString() 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Errore nella creazione della segnalazione:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}