
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Recupero segnalazioni dal DB 
    const segnalazioni = await prisma.segnalazione.findMany({
      orderBy: {
        dataCreazione: 'desc', 
      },
    });
    
    return NextResponse.json(segnalazioni);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
  }
}