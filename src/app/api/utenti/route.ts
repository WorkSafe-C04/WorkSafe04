import { NextResponse } from 'next/server'
import prisma from '@/core/db/prisma'

export async function GET() {
  try {
    const utenti = await prisma.utente.findMany()

    return NextResponse.json(utenti, { status: 200 })
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    )
  }
}