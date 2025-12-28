'use client';

import { useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

export function useCreaSegnalazione() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const creaSegnalazione = async (values: any) => {
    setLoading(true);
    try {
      // Usiamo FormData per supportare i file
      const formData = new FormData();
      formData.append('titolo', values.titolo || '');
      formData.append('descrizione', values.descrizione || '');
      formData.append('risorsa', values.risorsa || '');
      
      // Passa la matricola come ricevuta, incluso "Anonimo" se flaggato
      const matricola = values.matricola || 'Anonimo';
      formData.append('matricola', matricola);

     if (values.allegati) {
        values.allegati.forEach((fileItem: any) => {
          // originFileObj è il file reale richiesto dal backend
          if (fileItem.originFileObj) {
            formData.append('files', fileItem.originFileObj);
          }
        });
      }

      const response = await fetch('/api/segnalazioni', {
        method: 'POST',
        // Nota: Non impostare Content-Type header, il browser lo farà da solo con il boundary corretto
        body: formData, 
      });

      if (response.ok) {
        message.success('Segnalazione creata con successo!');
        router.push('/home');
        router.refresh();
        return true;
      } else {
        const errorData = await response.json();
        message.error(`Errore: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      message.error('Errore di connessione al server');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { creaSegnalazione, loading };
}