'use client';
import Carosello from "@/components/home/Carosello";
import ListaAvvisi from "@/components/home/ListaAvvisi";
import ListaSegnalazioni from "@/components/home/ListaSegnalazioni";
import { Tabs } from 'antd';
import { BellOutlined, WarningOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const tabsRef = useRef<any>(null);
  const items = [
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