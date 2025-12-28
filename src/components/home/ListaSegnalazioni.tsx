'use client';

import { useSegnalazioni } from '@/hook/segnalazioniHook';
import { Card, Tag, Spin, Alert, Empty, Row, Col, Space, Badge } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

export default function ListaSegnalazioni() {
  const { data, loading, error } = useSegnalazioni();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Caricamento segnalazioni..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Errore nel caricamento"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty
        description="Nessuna segnalazione presente"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '60px 0' }}
      />
    );
  }

  const getStatoConfig = (stato?: string) => {
    switch (stato) {
      case 'APERTA':
        return { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Aperta' };
      case 'IN_CORSO':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'In Corso' };
      case 'RISOLTA':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Risolta' };
      case 'CHIUSA':
        return { color: 'blue', icon: <CheckCircleOutlined />, text: 'Chiusa' };
      default:
        return { color: 'default', icon: <FileTextOutlined />, text: stato || 'Sconosciuto' };
    }
  };

  const getPrioritaColor = (priorita?: string) => {
    switch (priorita) {
      case 'ALTA': return 'red';
      case 'MEDIA': return 'orange';
      case 'BASSA': return 'green';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Space direction="vertical" size={0}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            Segnalazioni Recenti
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Totale: {data.length} segnalazioni
          </p>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((segnalazione) => {
          const statoConfig = getStatoConfig(segnalazione.stato);

          return (
            <Col xs={24} sm={24} md={12} lg={8} key={segnalazione.id}>
              <Badge.Ribbon
                text={statoConfig.text}
                color={statoConfig.color}
              >
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  styles={{
                    body: { padding: '20px' }
                  }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <WarningOutlined style={{
                        fontSize: '20px',
                        color: '#ff4d4f',
                        marginTop: '2px'
                      }} />
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        flex: 1,
                        lineHeight: '1.4'
                      }}>
                        {segnalazione.titolo}
                      </h3>
                    </div>

                    <p style={{
                      margin: 0,
                      color: '#666',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '63px'
                    }}>
                      {segnalazione.descrizione}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <Space size={4} style={{ fontSize: '12px', color: '#999' }}>
                        <CalendarOutlined />
                        <span>
                          {new Date(segnalazione.dataCreazione).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}