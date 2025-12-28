"use client";
import React from 'react';
import { Table, Tag, Select, Card, Button } from 'antd';
import { useRisorseTable, getTipoIcon, getTipoColor } from '@/hook/risorseHook';
import { Risorsa } from '@/model/risorsa';
import { SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

export const ListaRisorse: React.FC = () => {
  const { risorse, loading, refresh, handleStatoChange } = useRisorseTable();

  const columns = [
    {
      title: <span style={{ fontWeight: '700', fontSize: '15px' }}>📦 Nome</span>,
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string) => (
        <strong style={{
          fontSize: '15px',
          color: '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {text}
        </strong>
      ),
    },
    {
      title: <span style={{ fontWeight: '700', fontSize: '15px' }}>🏷️ Tipo</span>,
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => (
        <Tag
          color={getTipoColor(tipo)}
          style={{
            fontSize: '14px',
            padding: '4px 12px',
            borderRadius: '10px',
            fontWeight: '600'
          }}
        >
          {getTipoIcon(tipo)} {tipo}
        </Tag>
      ),
    },
    {
      title: <span style={{ fontWeight: '700', fontSize: '15px' }}>📝 Descrizione</span>,
      dataIndex: 'descrizione',
      key: 'descrizione',
      render: (text: string) => (
        <span style={{ color: '#666', fontSize: '14px' }}>{text || 'Nessuna descrizione'}</span>
      ),
    },
    {
      title: <span style={{ fontWeight: '700', fontSize: '15px' }}>📎 Scheda Allegata</span>,
      dataIndex: 'schedaAllegata',
      key: 'schedaAllegata',
      render: (scheda: string | undefined, record: Risorsa) => {
        if (!scheda) {
          return <span style={{ color: '#999', fontSize: '14px' }}>Nessun allegato</span>;
        }

        const handleOpen = () => {
          // Apre il file tramite l'endpoint API dedicato
          window.open(scheda, '_blank');
        };

        return (
          <a
            onClick={handleOpen}
            style={{
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📄 {record.nomeFile || 'Visualizza allegato'}
          </a>
        );
      },
    },
    {
      title: <span style={{ fontWeight: '700', fontSize: '15px' }}>⚡ Stato Attuale</span>,
      dataIndex: 'stato',
      key: 'stato',
      render: (stato: string, record: Risorsa) => (
        <Select
          defaultValue={stato}
          style={{ width: 180 }}
          size="large"
          onChange={(value) => handleStatoChange(record.id, value)}
          status={stato === 'Guasto' ? 'error' : stato === 'In Manutenzione' ? 'warning' : ''}
        >
          <Option value="Disponibile">✅ Disponibile</Option>
          <Option value="In Manutenzione">⚠️ In Manutenzione</Option>
          <Option value="Guasto">❌ Guasto</Option>
          <Option value="Dismesso">⛔ Dismesso</Option>
        </Select>
      ),
    },
  ];

  return (
    <Card
      title={<span style={{ fontSize: '20px', fontWeight: '600' }}>📋 Inventario Risorse</span>}
      extra={
        <Button
          icon={<SyncOutlined />}
          onClick={refresh}
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          Aggiorna
        </Button>
      }
      style={{
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
        border: 'none',
        background: 'linear-gradient(to bottom, #ffffff, #f8f9ff)'
      }}
      headStyle={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px 10px 0 0',
        fontSize: '18px',
        padding: '20px 24px'
      }}
    >
      <Table
        dataSource={risorse}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          pageSizeOptions: ['6', '12', '20', '50'],
          style: { marginTop: '20px' }
        }}
        style={{
          borderRadius: '10px'
        }}
        rowClassName={() => 'hover-row'}
      />
      <style jsx global>{`
        .hover-row:hover {
          background-color: #f0f5ff !important;
          transition: all 0.3s ease;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%) !important;
          font-weight: 700 !important;
        }
      `}</style>
    </Card>
  );
};