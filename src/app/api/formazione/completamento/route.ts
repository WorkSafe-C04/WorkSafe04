import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const serializeData = <T,>(data: T): T =>
  JSON.parse(
    JSON.stringify(data, (_k, v: unknown) => (typeof v === 'bigint' ? v.toString() : v))
  ) as T;

type AuthedUser = { matricola: string; ruolo?: string };

type Body = {
  id: string;            
  matricola?: string;    
};

const SUPERVISOR_ROLES = new Set(['DatoreDiLavoro', 'ResponsabileSicurezza']);
const isSupervisor = (ruolo?: string) => (ruolo ? SUPERVISOR_ROLES.has(ruolo) : false);

export async function POST(request: NextRequest) {
  const user = requireAuth(request) as AuthedUser | null;
  if (!user) return NextResponse.json({ error: 'Non autorizzato. Effettua il login.' }, { status: 401 });
  if (!user.matricola) return NextResponse.json({ error: 'Sessione valida ma matricola non disponibile.' }, { status: 400 });

  try {
    const body = (await request.json()) as Partial<Body>;
    const id = body.id?.toString().trim();
    const targetMatricolaBody = body.matricola?.toString().trim();

    if (!id) {
      return NextResponse.json({ error: 'Dati mancanti: id' }, { status: 400 });
    }

    let targetMatricola = user.matricola;

    if (targetMatricolaBody && targetMatricolaBody !== user.matricola) {
      if (!isSupervisor(user.ruolo)) {
        return NextResponse.json(
          { error: 'Permessi insufficienti per aggiornare la formazione di altri dipendenti.' },
          { status: 403 }
        );
      }
      targetMatricola = targetMatricolaBody;
    }

    const updateRes = await prisma.gestioneFormazione.updateMany({
      where: { id: BigInt(id), matricola: targetMatricola },
      data: { stato: 'Completato' },
    });

    if (updateRes.count === 0) {
      return NextResponse.json(
        { error: 'Nessun record aggiornato (id non valido o record non trovato).' },
        { status: 404 }
      );
    }

    const after = await prisma.gestioneFormazione.findFirst({
      where: { id: BigInt(id), matricola: targetMatricola },
      include: { Formazione: { include: { VideoCorso: true, Quiz: true } } },
    });

    return NextResponse.json(serializeData(after));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
