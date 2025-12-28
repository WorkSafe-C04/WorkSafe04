'use client';

import React from 'react';
import { Card, Empty, Spin, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { CorsoFormazione } from '@/model/formazione';
import { CardCorsoFormazione } from '@/components/formazione/CardCorsoFormazione';

const { Text } = Typography;

type Props = {
  corsi: CorsoFormazione[];
  loading: boolean;
  error: string | null;
  onComplete: (idGestione: string) => void;
  completing?: boolean;
};

export function ListaCorsiFormazione({ corsi, loading, error, onComplete, completing }: Props) {
  return (
    <Card title="Corsi assegnati" extra={<BookOutlined style={{ fontSize: 20, color: '#1890ff' }} />}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spin />
        </div>
      )}

      {!loading && error && (
        <div style={{ border: '1px solid #ffccc7', background: '#fff2f0', padding: 16, borderRadius: 6 }}>
          <Text strong style={{ color: '#cf1322' }}>Errore</Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ color: '#cf1322' }}>{error}</Text>
          </div>
        </div>
      )}

      {!loading && !error && corsi.length === 0 && <Empty description="Nessun corso assegnato al momento." />}

      {!loading && !error && corsi.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {corsi.map((item) => (
            <CardCorsoFormazione
              key={item.id}
              item={item}
              onComplete={onComplete}
              completing={completing}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
