import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const serializeData = <T,>(data: T): T =>
  JSON.parse(
    JSON.stringify(data, (_k, v: unknown) => (typeof v === 'bigint' ? v.toString() : v))
  ) as T;

type AuthedUser = { matricola: string; ruolo?: string };

const SUPERVISOR_ROLES = new Set(['DatoreDiLavoro', 'ResponsabileSicurezza']);
const isSupervisor = (ruolo?: string) => (ruolo ? SUPERVISOR_ROLES.has(ruolo) : false);

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

    const corsi = await prisma.gestioneFormazione.findMany({
      where: { matricola: targetMatricola },
      include: { Formazione: { include: { VideoCorso: true, Quiz: true } } },
      orderBy: [{ idFormazione: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json(serializeData(corsi));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
