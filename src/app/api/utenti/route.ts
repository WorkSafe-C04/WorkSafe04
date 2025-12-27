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
      select: {
        matricola: true,
        nome: true,
        cognome: true,
        email: true,
        ruolo: true,
        dataNascita: true,
        dataAssunzione: true,
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