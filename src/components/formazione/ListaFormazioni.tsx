'use client';

import { Card, Row, Col, Spin, Tag } from 'antd';
import { BookOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useFormazioni } from '@/hook/formazioneHook';
import { useRouter } from 'next/navigation';

export default function ListaFormazioni() {
  const { formazioni, loading } = useFormazioni();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        <BookOutlined style={{ marginRight: '8px' }} />
        Le Mie Formazioni
      </h2>
      <Row gutter={[16, 16]}>
        {formazioni.map((formazione) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={formazione.id}>
            <Card
              hoverable
              onClick={() => router.push(`/formazione/${formazione.id}`)}
              style={{
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              cover={
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircleOutlined
                    style={{ fontSize: '48px', color: 'white' }}
                  />
                </div>
              }
            >
              <Card.Meta
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {formazione.argomento}
                  </div>
                }
                description={
                  <div>
                    <Tag color="blue">{formazione.numeroCorsi} Corsi</Tag>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
