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
    const avvisi = await prisma.avviso.findMany({
      where: {
        codiceAzienda: user.codiceAzienda
      },
      orderBy: { id: 'desc' },
    })

    const serializedAvvisi = JSON.parse(JSON.stringify(avvisi, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serializedAvvisi, { status: 200 })
  } catch (error) {
    console.error('Errore nel recupero degli avvisi:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli avvisi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verifica autenticazione
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json()
    const { titolo, contenuto, dataCreazione, matricola } = body

    if (!titolo || !matricola) {
      return NextResponse.json(
        { error: 'Titolo e matricola sono obbligatori' },
        { status: 400 }
      )
    }

    const avviso = await prisma.avviso.create({
      data: {
        titolo,
        descrizione: contenuto || null,
        matricola,
        codiceAzienda: user.codiceAzienda,
        dataCreazione: dataCreazione ? new Date(dataCreazione) : new Date(), // salva anche ora
      },
    })

    const serializedAvviso = JSON.parse(JSON.stringify(avviso, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serializedAvviso, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione dell\'avviso:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'avviso' },
      { status: 500 }
    )
  }
}