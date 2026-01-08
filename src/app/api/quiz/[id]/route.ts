import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = BigInt(id);

    const domande = await prisma.domanda.findMany({
      where: {
        idQuiz: quizId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Converti BigInt in stringa per la serializzazione JSON
    const domandeSerializzate = domande.map((domanda) => ({
      id: domanda.id.toString(),
      descrizione: domanda.descerizione,
      rispostaCorretta: domanda.rispostaCorretta,
      codiceAzienda: domanda.codiceAzienda,
      idQuiz: domanda.idQuiz?.toString(),
    }));

    return NextResponse.json(domandeSerializzate);
  } catch (error) {
    console.error('Errore nel recupero delle domande:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle domande' },
      { status: 500 }
    );
  }
}
