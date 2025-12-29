import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { GestioneSegnalazioniService } from '@/service/GestioneSegnalazioniService';

type ErrorWithCode = {
  code?: string;
  message?: string;
};

function isErrorWithCode(e: unknown): e is ErrorWithCode {
  return typeof e === 'object' && e !== null && ('code' in e || 'message' in e);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await ctx.params;

  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  const ruolo = (user?.ruolo ?? '').toString().trim().toUpperCase();
  const isManutentore =
    ruolo === 'MANUTENTORE' || ruolo === 'ROLE_MANUTENTORE' || ruolo === 'M';

  if (!isManutentore) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  }

  const segnalazioneId = Number(idParam);
  if (!segnalazioneId || Number.isNaN(segnalazioneId)) {
    return NextResponse.json(
      { error: 'ID segnalazione non valido' },
      { status: 400 }
    );
  }

  try {
    const body: unknown = await request.json();

    const nuovoStato =
      typeof body === 'object' && body !== null && 'stato' in body
        ? (body as { stato?: unknown }).stato
        : undefined;

    const updated = await GestioneSegnalazioniService.updateStatoSegnalazione({
      segnalazioneId,
      nuovoStato,
    });

    return NextResponse.json({
      success: true,
      segnalazione: {
        id: updated.id.toString(),
        stato: updated.stato,
      },
    });
  } catch (error: unknown) {
    if (isErrorWithCode(error) && error.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: error.message ?? 'Segnalazione non trovata' },
        { status: 404 }
      );
    }

    const msg = error instanceof Error ? error.message : String(error);

    if (
      msg.includes('Dati mancanti: stato') ||
      msg.includes('Stato non valido')
    ) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
