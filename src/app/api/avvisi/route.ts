import { NextResponse } from 'next/server'
import prisma from '@/core/db/prisma'

export async function GET() {
  try {
    const avvisi = await prisma.avviso.findMany()

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