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

      orderBy: { dataCreazione: 'desc' },
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
    return NextResponse.json({ success: true }); 
}