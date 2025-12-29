'use client';

import { useSegnalazioni } from '@/hook/segnalazioniHook';
import {
  Card,
  Tag,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Space,
  Badge,
  Descriptions,
  Image,
  Button,
  Modal,
  Divider,
  Select,
  message
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
  PaperClipOutlined,
  FolderOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Segnalazione } from '@/model/segnalazione';

export default function ListaSegnalazioni() {
  const { data, loading, error } = useSegnalazioni();

  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [selectedSegnalazione, setSelectedSegnalazione] = useState<Segnalazione | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updatingStato, setUpdatingStato] = useState(false);
  const [statoDraft, setStatoDraft] = useState<string>('');

  useEffect(() => {
    if (data) setSegnalazioni(data);
  }, [data]);

  const getUserRuolo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return '';
      const u = JSON.parse(userStr);
      return (u?.ruolo || '').toString().toUpperCase();
    } catch {
      return '';
    }
  };

  const isManutentore = getUserRuolo() === 'MANUTENTORE';

  const getStatoConfig = (stato?: string) => {
    const s = (stato || '').toString().toUpperCase();

    switch (s) {
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

  const patchStatoSegnalazione = async (idString: string, stato: string) => {
    const res = await fetch(`/api/segnalazioni/${idString}/stato`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stato })
    });

    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || 'Errore aggiornamento stato');
    return payload;
  };

  const handleUpdateStato = async () => {
    if (!selectedSegnalazione) return;

    const idString = selectedSegnalazione.id?.toString();
    const newStato = (statoDraft || '').toUpperCase();

    if (!idString) {
      message.error('ID segnalazione non valido');
      return;
    }

    if (!newStato) {
      message.error('Seleziona uno stato');
      return;
    }

    setUpdatingStato(true);

    const prevSelected = selectedSegnalazione;
    const prevList = segnalazioni;


    setSelectedSegnalazione({ ...selectedSegnalazione, stato: newStato });
    setSegnalazioni((list) =>
      list.map((s) => (s.id?.toString() === idString ? { ...s, stato: newStato } : s))
    );

    try {
      await patchStatoSegnalazione(idString, newStato);
      message.success('Stato aggiornato');
    } catch (e: unknown) {

      setSelectedSegnalazione(prevSelected);
      setSegnalazioni(prevList);

      const msg = e instanceof Error ? e.message : 'Errore aggiornamento';
      message.error(msg);
    } finally {
      setUpdatingStato(false);
    }
  };

  const handleCardClick = (segnalazione: Segnalazione) => {
    setSelectedSegnalazione(segnalazione);
    setStatoDraft((segnalazione.stato || 'APERTA').toString().toUpperCase());
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSegnalazione(null);
  };

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

  if (!segnalazioni || segnalazioni.length === 0) {
    return (
      <Empty
        description="Nessuna segnalazione presente"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '60px 0' }}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <Space direction="vertical" size={0}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Segnalazioni Recenti</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Totale: {segnalazioni.length} segnalazioni
          </p>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {segnalazioni.map((segnalazione) => {
          const statoConfig = getStatoConfig(segnalazione.stato);

          return (
            <Col xs={24} key={segnalazione.id?.toString()}>
              <Badge.Ribbon text={statoConfig.text} color={statoConfig.color}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(segnalazione)}
                  style={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={16}>
                      <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <WarningOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginTop: '4px' }} />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', lineHeight: '1.4' }}>
                              {segnalazione.titolo}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {segnalazione.descrizione}
                            </p>
                          </div>
                        </div>

                        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                          <Descriptions.Item label={<><IdcardOutlined /> Matricola</>}>
                            {segnalazione.matricola === 'Anonimo' ? (
                              <Tag color="orange">Anonimo</Tag>
                            ) : (
                              <span style={{ fontWeight: '500' }}>{segnalazione.matricola || 'N/D'}</span>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label={<><CalendarOutlined /> Data</>}>
                            {new Date(segnalazione.dataCreazione).toLocaleDateString('it-IT')}
                          </Descriptions.Item>
                        </Descriptions>
                      </Space>
                    </Col>

                    {segnalazione.allegati && segnalazione.allegati.length > 0 && (
                      <Col xs={24} md={8}>
                        <div
                          style={{
                            borderLeft: '1px solid #f0f0f0',
                            paddingLeft: '16px',
                            textAlign: 'center'
                          }}
                        >
                          <PaperClipOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#333' }}>
                            {segnalazione.allegati.length} Allegato{segnalazione.allegati.length !== 1 ? 'i' : ''}
                          </p>
                          <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>Clicca per visualizzare</p>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <span>{selectedSegnalazione?.titolo}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        width={900}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Chiudi
          </Button>,
          selectedSegnalazione?.allegati && selectedSegnalazione.allegati.length > 0 && (
            <Button
              key="view"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                (document.querySelector('[aria-label="View"]') as HTMLElement)?.click();
              }}
            >
              Visualizza Allegati
            </Button>
          )
        ]}
      >
        {selectedSegnalazione && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <h4 style={{ marginBottom: '8px', fontWeight: '600' }}>Descrizione</h4>
              <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>{selectedSegnalazione.descrizione}</p>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label={<><IdcardOutlined /> Matricola</>}>
                {selectedSegnalazione.matricola === 'Anonimo' ? (
                  <Tag color="orange">Anonimo</Tag>
                ) : (
                  <span style={{ fontWeight: '500' }}>{selectedSegnalazione.matricola || 'N/D'}</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label={<><FolderOutlined /> Risorsa</>}>
                <span style={{ fontWeight: '500' }}>ID: {selectedSegnalazione.risorsa}</span>
              </Descriptions.Item>

              <Descriptions.Item label={<><CalendarOutlined /> Data Creazione</>}>
                {new Date(selectedSegnalazione.dataCreazione).toLocaleString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>

              <Descriptions.Item label={<><FileTextOutlined /> Stato</>}>
                {isManutentore ? (
                  <Space>
                    <Select
                      value={statoDraft}
                      style={{ width: 160 }}
                      onChange={(v) => setStatoDraft(v)}
                      options={[
                        { value: 'APERTA', label: 'Aperta' },
                        { value: 'IN_CORSO', label: 'In Corso' },
                        { value: 'RISOLTA', label: 'Risolta' },
                        { value: 'CHIUSA', label: 'Chiusa' }
                      ]}
                    />
                    <Button
                      type="primary"
                      onClick={handleUpdateStato}
                      loading={updatingStato}
                      disabled={!selectedSegnalazione}
                    >
                      Aggiorna
                    </Button>
                  </Space>
                ) : (
                  <Tag
                    color={getStatoConfig(selectedSegnalazione.stato).color}
                    icon={getStatoConfig(selectedSegnalazione.stato).icon}
                  >
                    {getStatoConfig(selectedSegnalazione.stato).text}
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            {selectedSegnalazione.allegati && selectedSegnalazione.allegati.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <PaperClipOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                  <h4 style={{ margin: 0, fontWeight: '600' }}>Allegati ({selectedSegnalazione.allegati.length})</h4>
                </div>

                <Image.PreviewGroup>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {selectedSegnalazione.allegati.map((allegato, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <Image
                          src={allegato}
                          alt={`Allegato ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid #f0f0f0'
                          }}
                          preview={{
                            mask: (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white' }}>
                                <EyeOutlined style={{ fontSize: '16px' }} />
                                <span>Visualizza</span>
                              </div>
                            )
                          }}
                        />
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                          Allegato {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}
