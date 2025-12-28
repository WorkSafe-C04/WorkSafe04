'use client';

import React from 'react';
import { Card, Space, Tag, Typography, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons';
import type { StatoFormazione } from '@/model/formazione';

const { Text, Title } = Typography;

type Props = {
  stato: StatoFormazione;
  loading?: boolean;
  error?: string | null;
};


export function DashboardFormazione({ stato }: Props) {
  return (
    <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space size={10}>
            <BookOutlined style={{ fontSize: 18, color: '#1677ff' }} />
            <Title level={5} style={{ margin: 0 }}>Avanzamento formazione</Title>
          </Space>
          <Tag color="blue" style={{ padding: '2px 10px' }}>
            Totale: {stato.totaleCorsi}
          </Tag>
        </Space>

        <Progress percent={stato.percentuale} />

        <Space wrap size={8}>
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Completati: {stato.completati}
          </Tag>
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            In corso: {stato.inCorso}
          </Tag>
          <Tag color="gold">
            Non iniziati: {stato.nonIniziati}
          </Tag>
          <Text type="secondary">
            Percentuale: <b>{stato.percentuale}%</b>
          </Text>
        </Space>
      </Space>
    </Card>
  );
}
