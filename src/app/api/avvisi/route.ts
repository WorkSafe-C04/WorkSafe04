import { NextResponse } from 'next/server'
import prisma from '@/core/db/prisma'

export async function GET() {
  try {
    const avvisi = await prisma.avviso.findMany({
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

export async function POST(request: Request) {
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