import { NextResponse } from 'next/server'
import prisma from '@/core/db/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const utente = await prisma.utente.findUnique({
      where: {
        matricola: id
      },
    })
    
    return NextResponse.json(utente, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'utente' },
      { status: 500 }
    )
  }
}