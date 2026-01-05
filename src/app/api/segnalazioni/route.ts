import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  try {
    const segnalazioni = await prisma.segnalazione.findMany({
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