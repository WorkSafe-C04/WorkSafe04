import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

type AuthedUser = { matricola: string; ruolo?: string };

const SUPERVISOR_ROLES = new Set(['DatoreDiLavoro', 'ResponsabileSicurezza']);
const isSupervisor = (ruolo?: string) => (ruolo ? SUPERVISOR_ROLES.has(ruolo) : false);

const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

export async function GET(request: NextRequest) {
  const user = requireAuth(request) as AuthedUser | null;
  if (!user) return NextResponse.json({ error: 'Non autorizzato. Effettua il login.' }, { status: 401 });
  if (!user.matricola) return NextResponse.json({ error: 'Sessione valida ma matricola non disponibile.' }, { status: 400 });

  try {
    const url = new URL(request.url);
    const targetMatricolaParam = url.searchParams.get('matricola')?.trim();

    let targetMatricola = user.matricola;

    if (targetMatricolaParam && targetMatricolaParam !== user.matricola) {
      if (!isSupervisor(user.ruolo)) {
        return NextResponse.json(
          { error: 'Permessi insufficienti per visualizzare la formazione di altri dipendenti.' },
          { status: 403 }
        );
      }
      targetMatricola = targetMatricolaParam;
    }

    const rows = await prisma.gestioneFormazione.findMany({
      where: { matricola: targetMatricola },
      select: { stato: true },
    });

    const totaleCorsi = rows.length;
    let completati = 0;
    let inCorso = 0;
    let nonIniziati = 0;

    for (const r of rows) {
      const s = norm(r.stato);
      if (s === 'completato') completati += 1;
      else if (s === 'in corso' || s === 'incorso') inCorso += 1;
      else nonIniziati += 1;
    }

    const percentuale = totaleCorsi === 0 ? 0 : Math.round((completati / totaleCorsi) * 100);

    return NextResponse.json({ totaleCorsi, completati, inCorso, nonIniziati, percentuale });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
