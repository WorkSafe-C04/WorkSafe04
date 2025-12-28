'use client';

import React from 'react';
import { Button, Card, Space, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { CorsoFormazione } from '@/model/formazione';

const { Title, Text } = Typography;

const getStatoTag = (stato?: string | null) => {
  const s = stato || 'Non Iniziato';
  if (s === 'Completato') return <Tag color="green" icon={<CheckCircleOutlined />}>{s}</Tag>;
  if (s === 'In Corso') return <Tag color="blue" icon={<ClockCircleOutlined />}>{s}</Tag>;
  return <Tag color="gold">{s}</Tag>;
};

type Props = {
  item: CorsoFormazione;
  onComplete: (idGestione: string) => void;
  completing?: boolean;
};

export function CardCorsoFormazione({ item, onComplete, completing }: Props) {
  const titolo = item.Formazione?.argomento ?? 'Argomento non specificato';
  const videoCount = item.Formazione?.VideoCorso?.length ?? 0;
  const quizCount = item.Formazione?.Quiz?.length ?? 0;

  const disabled = (item.stato ?? '').toLowerCase() === 'completato';

  return (
    <Card hoverable styles={{ body: { padding: 18 } }}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space align="start" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ maxWidth: '75%' }}>
            <Title level={5} style={{ margin: 0 }}>
              {titolo}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID Formazione: {item.idFormazione}
            </Text>
          </div>
          {getStatoTag(item.stato)}
        </Space>

        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: 12,
            borderRadius: 8,
            background: '#fafafa',
            border: '1px solid #f0f0f0',
          }}
        >
          <Space size={8}>
            <PlayCircleOutlined />
            <Text>{videoCount} video</Text>
          </Space>
          <Space size={8}>
            <FileTextOutlined />
            <Text>{quizCount} quiz</Text>
          </Space>
        </div>

        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Button type="link" icon={<EyeOutlined />} href={`/formazione/${item.idFormazione}`}>
            Vai al corso
          </Button>

          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => onComplete(item.id)}
            disabled={disabled}
            loading={completing}
          >
            Segna completato
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
