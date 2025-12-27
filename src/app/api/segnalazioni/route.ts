
import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

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