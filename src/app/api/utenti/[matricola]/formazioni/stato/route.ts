import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/db/prisma';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matricola: string }> }
) {
  // Verifica autenticazione
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  const { matricola } = await params;

  try {
    // Verifica che l'utente richiesto appartenga alla stessa azienda
    const dipendente = await prisma.utente.findFirst({
      where: {
        matricola,
        codiceAzienda: user.codiceAzienda
      }
    });

    if (!dipendente) {
      return NextResponse.json(
        { error: 'Dipendente non trovato o non appartiene alla tua azienda' },
        { status: 404 }
      );
    }

    // Recupera TUTTE le formazioni esistenti nell'azienda
    const formazioniTotali = await prisma.formazione.count({
      where: {
        codiceAzienda: user.codiceAzienda
      }
    });

    // Recupera le formazioni UNICHE che il dipendente ha completato (stato "Superato")
    const formazioniCompletateResult = await prisma.gestioneFormazione.groupBy({
      by: ['idFormazione'],
      where: {
        matricola,
        stato: 'Superato'
      }
    });

    const totale = formazioniTotali;
    const completate = formazioniCompletateResult.length;
    const percentuale = totale > 0 ? Math.round((completate / totale) * 100) : 0;

    return NextResponse.json({
      formazioniTotali: totale,
      formazioniCompletate: completate,
      percentuale
    });
  } catch (error) {
    console.error('Errore nel recupero dello stato formazione:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dello stato formazione' },
      { status: 500 }
    );
  }
}
