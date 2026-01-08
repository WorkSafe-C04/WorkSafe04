import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// GET - Ottieni tutte le formazioni dell'azienda
export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const formazioneId = searchParams.get('id');

  try {
    // Se c'è un ID, restituisci il dettaglio della formazione con tutti i contenuti
    if (formazioneId) {
      const formazione = await prisma.formazione.findFirst({
        where: {
          id: BigInt(formazioneId),
          codiceAzienda: user.codiceAzienda
        },
        include: {
          VideoCorso: true,
          Quiz: {
            where: {
              GestioneFormazione: {
                none: {
                  matricola: user.matricola,
                  stato: 'Superato'
                }
              }
            }
          },
          Documentazione: true
        }
      });

      if (!formazione) {
        return NextResponse.json(
          { error: 'Formazione non trovata' },
          { status: 404 }
        );
      }

      // Converti i contenuti delle documentazioni in base64
      const formazioneConDocumenti = {
        ...formazione,
        videoCorsi: formazione.VideoCorso,
        quiz: formazione.Quiz,
        documentazioni: formazione.Documentazione.map(doc => ({
          ...doc,
          contenuto: doc.contenuto ? Buffer.from(doc.contenuto).toString('base64') : null
        }))
      };

      return NextResponse.json(serializeData(formazioneConDocumenti));
    }

    // Altrimenti restituisci tutte le formazioni
    const formazioni = await prisma.formazione.findMany({
      where: {
        codiceAzienda: user.codiceAzienda
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(serializeData(formazioni));
  } catch (error) {
    console.error('Errore nel recupero delle formazioni:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
