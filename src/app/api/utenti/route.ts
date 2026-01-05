import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/db/prisma'
import { requireAuth } from '@/lib/apiAuth'

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
    const utenti = await prisma.utente.findMany({
      where: {
        codiceAzienda: user.codiceAzienda
      },
      select: {
        matricola: true,
        nome: true,
        cognome: true,
        email: true,
        ruolo: true,
        dataNascita: true,
        dataAssunzione: true,
        codiceAzienda: true,
        // Escludiamo la password per sicurezza
      }
    })

    return NextResponse.json(utenti, { status: 200 })
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // Verifica autenticazione
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  // Solo il Datore Di Lavoro può modificare i dipendenti
  if (user.ruolo !== 'DatoreDiLavoro') {
    return NextResponse.json(
      { error: 'Solo il Datore Di Lavoro può modificare i dipendenti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { matricola, ruolo, dataAssunzione } = body;

    if (!matricola) {
      return NextResponse.json(
        { error: 'Matricola obbligatoria' },
        { status: 400 }
      );
    }

    // Verifica che il dipendente appartenga alla stessa azienda
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

    // Prepara i dati da aggiornare
    const dataToUpdate: any = {};
    if (ruolo) dataToUpdate.ruolo = ruolo;
    if (dataAssunzione) dataToUpdate.dataAssunzione = new Date(dataAssunzione);

    // Aggiorna il dipendente
    const utenteAggiornato = await prisma.utente.update({
      where: { matricola },
      data: dataToUpdate,
      select: {
        matricola: true,
        nome: true,
        cognome: true,
        email: true,
        ruolo: true,
        dataNascita: true,
        dataAssunzione: true,
        codiceAzienda: true,
      }
    });

    return NextResponse.json(utenteAggiornato, { status: 200 });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del dipendente:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del dipendente' },
      { status: 500 }
    );
  }
}