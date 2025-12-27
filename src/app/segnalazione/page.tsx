'use client';
import React, { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AppLayout from '@/components/AppLayout';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { TextArea } = Input;

export default function NuovaSegnalazionePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/segnalazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Segnalazione creata con successo!');
        form.resetFields();
        router.push('/segnalazioni'); // Reindirizza alla lista
        router.refresh();
      } else {
        const errorData = await response.json();
        message.error(`Errore: ${errorData.error}`);
      }
    } catch (error) {
      message.error('Errore durante la connessione al server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AntdRegistry>
      
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
          <Card>
            <Title level={2}>Crea Nuova Segnalazione</Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Titolo"
                name="titolo"
                rules={[{ required: true, message: 'Inserisci un titolo' }]}
              >
                <Input placeholder="Es: Malfunzionamento hardware" />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label="Risorsa"
                  name="risorsa"
                  rules={[{ required: true, message: 'Specifica la risorsa' }]}
                >
                  <Input placeholder="Es: Stampante Piano 1" />
                </Form.Item>

                <Form.Item
                  label="Matricola"
                  name="matricola"
                  rules={[{ required: true, message: 'Inserisci la matricola' }]}
                >
                  <Input placeholder="Es: ABC12345" />
                </Form.Item>
              </div>

              <Form.Item
                label="Descrizione"
                name="descrizione"
                rules={[{ required: true, message: 'Fornisci una descrizione dettagliata' }]}
              >
                <TextArea rows={4} placeholder="Descrivi qui il problema..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  Invia Segnalazione
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      
    </AntdRegistry>
  );
}