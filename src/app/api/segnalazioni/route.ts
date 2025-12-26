
import prisma from '@/core/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {

    const segnalazioni = await prisma.segnalazione.findMany({
      orderBy: {
         dataCreazione: 'desc'
      },
    });
    
    const serializedSegnalazioni = JSON.parse(JSON.stringify(segnalazioni, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json(serializedSegnalazioni);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}