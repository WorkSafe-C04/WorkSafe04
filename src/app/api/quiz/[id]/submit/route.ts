import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/db/prisma';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { risposte, idFormazione } = await request.json();
    const { id } = await params;
    const quizId = BigInt(id);

    // Recupera tutte le domande del quiz
    const domande = await prisma.domanda.findMany({
      where: {
        idQuiz: quizId,
      },
    });

    // Verifica se tutte le risposte sono corrette
    let tutteCorrette = true;
    for (const domanda of domande) {
      const rispostaUtente = risposte[domanda.id.toString()];
      if (rispostaUtente !== domanda.rispostaCorretta) {
        tutteCorrette = false;
        break;
      }
    }

    // Se tutte le risposte sono corrette, salva in GestioneFormazione
    if (tutteCorrette && idFormazione) {
      await prisma.gestioneFormazione.create({
        data: {
          idFormazione: BigInt(idFormazione),
          idQuiz: quizId,
          matricola: user.matricola,
          stato: 'Superato',
        },
      });
    }

    return NextResponse.json({
      superato: tutteCorrette,
      totaleDomande: domande.length,
    });
  } catch (error) {
    console.error('Errore nel submit del quiz:', error);
    return NextResponse.json(
      { error: 'Errore nel submit del quiz' },
      { status: 500 }
    );
  }
}
