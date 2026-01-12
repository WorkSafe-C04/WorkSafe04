'use client';
import Carosello from "@/components/home/Carosello";
import ListaAvvisi from "@/components/home/ListaAvvisi";
import ListaSegnalazioni from "@/components/home/ListaSegnalazioni";
import { GestioneDipendenti } from "@/components/home/GestioneDipendenti";
import { Role } from "@/model/role";
import { Tabs } from 'antd';
import { BellOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [isDatoreLavoro, setIsDatoreLavoro] = useState(false);
  const [isResponsabileSicurezza, setIsResponsabileSicurezza] = useState(false);
  const tabsRef = useRef<any>(null);

  useEffect(() => {
    // Verifica ruolo utente
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsDatoreLavoro(userData.ruolo === Role.DATORE_LAVORO);
        setIsResponsabileSicurezza(userData.ruolo === Role.RESPONSABILE_SICUREZZA);
      } catch (err) {
        console.error('Errore nel parsing dei dati utente', err);
      }
    }
  }, []);

  const baseItems = [
    {
      key: '1',
      label: (
        <span>
          <WarningOutlined />
          Segnalazioni
        </span>
      ),
      children: <ListaSegnalazioni />,
    },
    {
      key: '2',
      label: (
        <span>
          <BellOutlined />
          Avvisi
        </span>
      ),
      children: <ListaAvvisi />,
    },
  ];

  // Aggiungi il tab Gestione Dipendenti per Datore Di Lavoro e ResponsabileSicurezza
  let items = [...baseItems];

  if (isDatoreLavoro) {
    items.push({
      key: '3',
      label: (
        <span>
          <UserOutlined />
          Gestione Dipendenti
        </span>
      ),
      children: <GestioneDipendenti viewMode="datoreLavoro" />,
    });
  } else if (isResponsabileSicurezza) {
    items.push({
      key: '3',
      label: (
        <span>
          <UserOutlined />
          Visualizza stato formazione
        </span>
      ),
      children: <GestioneDipendenti viewMode="responsabileSicurezza" />,
    });
  }

  useEffect(() => {
    // Prima priorità: localStorage (click da notifica)
    const avvisoToScroll = localStorage.getItem('avvisoToScroll');
    if (avvisoToScroll) {
      setActiveTab('2');
      setTimeout(() => {
        const el = document.getElementById(`avviso-${avvisoToScroll}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        localStorage.removeItem('avvisoToScroll');
      }, 600);
      return;
    }
    // Seconda priorità: query string
    const tab = searchParams.get('tab');
    const avvisoId = searchParams.get('avvisoId');
    if (tab === 'avvisi') {
      setActiveTab('2');
      if (avvisoId) {
        setTimeout(() => {
          const el = document.getElementById(`avviso-${avvisoId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
      }
    }
  }, [searchParams]);

  return (
    <>
      <Carosello />
      <div style={{ marginTop: '24px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          size="large"
          ref={tabsRef}
        />
      </div>
    </>
  );
}