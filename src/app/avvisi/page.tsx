'use client';
import { CreateAvvisoForm } from "@/components/avvisi/createAvvisoForm";
import { useEffect, useState } from 'react';
import { Alert } from 'antd';

export default function HomePage() {
  const [isDatoreLavoro, setIsDatoreLavoro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se l'utente è Datore Di Lavoro
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsDatoreLavoro(userData.ruolo === 'DatoreDiLavoro');
      } catch (err) {
        console.error('Errore nel parsing dei dati utente', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!isDatoreLavoro) {
    return (
      <Alert
        message="Accesso Negato"
        description="Solo il Datore Di Lavoro può creare nuovi avvisi."
        type="warning"
        showIcon
        style={{ marginTop: '20px' }}
      />
    );
  }

  return (
    <>
      <CreateAvvisoForm />
    </>
  );
}