'use client';
import Carosello from "@/components/home/Carosello";
import ListaAvvisi from "@/components/home/ListaAvvisi";
import ListaSegnalazioni from "@/components/home/ListaSegnalazioni";
import { Tabs } from 'antd';
import { BellOutlined, WarningOutlined } from '@ant-design/icons';

export default function HomePage() {
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

  return (
    <>
      <Carosello />
      <div style={{ marginTop: '24px' }}>
        <Tabs defaultActiveKey="1" items={items} size="large" />
      </div>
    </>
  );
}