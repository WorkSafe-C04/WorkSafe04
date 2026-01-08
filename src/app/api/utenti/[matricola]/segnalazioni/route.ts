import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/db/prisma';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matricola: string }> }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { matricola } = await params;

    // Verifica che l'utente possa vedere solo le proprie segnalazioni (o sia admin)
    if (user.matricola !== matricola && user.ruolo !== 'Admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const segnalazioni = await prisma.segnalazione.findMany({
      where: {
        matricola: matricola,
        codiceAzienda: user.codiceAzienda,
      },
      orderBy: {
        dataCreazione: 'desc',
      },
      include: {
        Risorsa: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    const data = segnalazioni.map((s) => ({
      id: s.id,
      titolo: s.titolo,
      descrizione: s.descrizione,
      stato: s.stato,
      priorita: s.priorita,
      dataCreazione: s.dataCreazione,
      risorsa: s.Risorsa ? { id: s.Risorsa.id.toString(), nome: s.Risorsa.nome } : null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore nel recupero delle segnalazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle segnalazioni' },
      { status: 500 }
    );
  }
}
