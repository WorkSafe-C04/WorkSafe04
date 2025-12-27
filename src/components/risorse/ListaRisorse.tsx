"use client";
import React from 'react';
import { Table, Tag, Select, Card, Button } from 'antd';
import { useGetRisorse, useUpdateRisorsaStatus } from '@/hook/useRisorse';
import { Risorsa } from '@/model/risorsa';
import { SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

export const ListaRisorse: React.FC = () => {
  // Usiamo l'hook per scaricare i dati e quello per aggiornare lo stato
  const { risorse, loading, refresh } = useGetRisorse();
  const { updateStatus } = useUpdateRisorsaStatus();

  // Funzione chiamata quando cambi lo stato dal menu a tendina
  const handleStatoChange = async (id: number, nuovoStato: string) => {
    const success = await updateStatus(id, nuovoStato);
    if (success) {
      refresh(); // Ricarica la lista per vedere il cambiamento confermato
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => <Tag color="blue">{tipo}</Tag>,
    },
    {
      title: 'Descrizione',
      dataIndex: 'descrizione',
      key: 'descrizione',
    },
    {
      title: 'Stato Attuale',
      dataIndex: 'stato',
      key: 'stato',
      render: (stato: string, record: Risorsa) => (
        <Select
          defaultValue={stato}
          style={{ width: 160 }}
          onChange={(value) => handleStatoChange(record.id, value)}
          // Coloriamo lo stato per renderlo più visibile
          status={stato === 'Guasto' ? 'error' : stato === 'In Manutenzione' ? 'warning' : ''}
        >
          <Option value="Disponibile">🟢 Disponibile</Option>
          <Option value="In Manutenzione">🟠 In Manutenzione</Option>
          <Option value="Guasto">🔴 Guasto</Option>
          <Option value="Dismesso">⚫ Dismesso</Option>
        </Select>
      ),
    },
  ];

  return (
    <Card 
      title="Inventario Risorse" 
      extra={<Button icon={<SyncOutlined />} onClick={refresh}>Aggiorna Lista</Button>}
      style={{ marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Table
        dataSource={risorse}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};