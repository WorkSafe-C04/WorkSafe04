import prisma from '@/core/db/prisma'; 

export const formazioneService = {
  getCorsiAssegnati: async (matricolaUtente: string) => {
    try {
      const corsi = await prisma.gestioneFormazione.findMany({
        where: {
          matricola: matricolaUtente,
        },
        include: {
          Formazione: {
            include: {
              VideoCorso: true,
              Quiz: true,
            }
          }
        }
      });
      
      return JSON.parse(JSON.stringify(corsi, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value 
      ));

    } catch (error) {
      console.error("Errore nel recupero corsi:", error);
      return [];
    }
  }
};