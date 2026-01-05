import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const codice = searchParams.get('codice');

  try {
    const azienda = await prisma.azienda.findUnique({
      where: {
        codiceAzienda: codice || user.codiceAzienda
      },
      select: {
        codiceAzienda: true,
        partitaIva: true,
        ragioneSociale: true,
        sede: true,
        recapito: true
      }
    });

    if (!azienda) {
      return NextResponse.json(
        { error: 'Azienda non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(azienda);
  } catch (error) {
    console.error('Errore nel recupero azienda:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
