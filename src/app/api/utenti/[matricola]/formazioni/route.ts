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

    // Verifica che l'utente possa vedere solo le proprie formazioni (o sia admin/manager)
    if (user.matricola !== matricola && !['Admin', 'Manager'].includes(user.ruolo)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const formazioniSuperate = await prisma.gestioneFormazione.findMany({
      where: {
        matricola: matricola,
        stato: 'Superato',
      },
      include: {
        Formazione: {
          select: {
            id: true,
            argomento: true,
            numeroCorsi: true,
          },
        },
        Quiz: {
          select: {
            id: true,
            nome: true,
            durata: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    const data = formazioniSuperate.map((gf) => ({
      id: gf.id.toString(),
      stato: gf.stato,
      formazione: gf.Formazione ? {
        id: gf.Formazione.id.toString(),
        argomento: gf.Formazione.argomento,
        numeroCorsi: gf.Formazione.numeroCorsi.toString(),
      } : null,
      quiz: gf.Quiz ? {
        id: gf.Quiz.id.toString(),
        nome: gf.Quiz.nome,
        durata: gf.Quiz.durata?.toString(),
      } : null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore nel recupero delle formazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle formazioni' },
      { status: 500 }
    );
  }
}
