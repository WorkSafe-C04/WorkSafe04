import prisma from '@/core/db/prisma';

export const ALLOWED_STATI = ['APERTA', 'IN_CORSO', 'RISOLTA', 'CHIUSA'] as const;
export type StatoSegnalazione = typeof ALLOWED_STATI[number];

export class GestioneSegnalazioniService {
  private static normalizeStato(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error('Dati mancanti: stato');
    }
    return value.trim().toUpperCase();
  }

  private static validateStato(value: unknown): StatoSegnalazione {
    const stato = this.normalizeStato(value);

    if (!(ALLOWED_STATI as readonly string[]).includes(stato)) {
      throw new Error(`Stato non valido. Ammessi: ${ALLOWED_STATI.join(', ')}`);
    }

    return stato as StatoSegnalazione;
  }

  static async updateStatoSegnalazione(params: {
    segnalazioneId: number;
    nuovoStato: unknown;   // ⬅️ QUI È unknown (corretto)
  }) {
    const { segnalazioneId, nuovoStato } = params;

    const statoValidato = this.validateStato(nuovoStato);

    const existing = await prisma.segnalazione.findUnique({
      where: { id: segnalazioneId },
    });

    if (!existing) {
      const err = new Error('Segnalazione non trovata');
      (err as { code?: string }).code = 'NOT_FOUND';
      throw err;
    }

    return prisma.segnalazione.update({
      where: { id: segnalazioneId },
      data: { stato: statoValidato },
    });
  }
}
