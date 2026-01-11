'use client';

import { useSegnalazioni } from '@/hook/segnalazioniHook';
import { Card, Tag, Spin, Alert, Empty, Row, Col, Space, Badge, Descriptions, Button, Modal, Divider, Input, DatePicker, Select } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  PaperClipOutlined,
  FolderOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { Segnalazione } from '@/model/segnalazione';
import dayjs from 'dayjs';
import 'dayjs/locale/it';

const { RangePicker } = DatePicker;

export default function ListaSegnalazioni() {
  const { data, loading, error } = useSegnalazioni();
  const [selectedSegnalazione, setSelectedSegnalazione] = useState<Segnalazione | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterTitolo, setFilterTitolo] = useState('');
  const [filterRisorsa, setFilterRisorsa] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [filterStato, setFilterStato] = useState<string | null>(null);
  const [filterPriorita, setFilterPriorita] = useState<string | null>(null);

  const resourceOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const names = data
      .map(item => {
        const r = item.Risorsa || (item as any).Risorsa;
        return r?.nome;
      })
      .filter(name => name !== undefined && name !== null && name !== '');
    
    const uniqueNames = [...new Set(names)];
    
    return uniqueNames.sort().map(name => ({ label: name, value: name }));
  }, [data]);

  const statoOptions = [
    { label: 'Aperto', value: 'APERTO' },
    { label: 'In Lavorazione', value: 'IN_LAVORAZIONE' },
    { label: 'Completata', value: 'COMPLETATA' },
  ];

  const prioritaOptions = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Bassa', value: 'BASSA' },
  ];

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(item => {
      const titoloMatch = (item.titolo || '').toLowerCase().includes(filterTitolo.toLowerCase());

      let risorsaMatch = true;
      if (filterRisorsa) {
          const rObj = item.Risorsa || (item as any).Risorsa;
          const nomeRisorsa = rObj?.nome || '';
          risorsaMatch = nomeRisorsa === filterRisorsa;
      }

      let dateMatch = true;
      if (filterDate && item.dataCreazione) {
        const itemDate = dayjs(item.dataCreazione);
        const startDate = filterDate[0].startOf('day');
        const endDate = filterDate[1].endOf('day');
        dateMatch = itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      }

      let statoMatch = true;
      if (filterStato) {
        const s = (item.stato || '').toUpperCase();
        const f = filterStato.toUpperCase();
        statoMatch = s === f || s.replace(/ /g, '_') === f || s.replace(/_/g, ' ') === f;
      }

      let prioritaMatch = true;
      if (filterPriorita) {
        const p = ((item as any).priorita || '').toUpperCase();
        prioritaMatch = p === filterPriorita;
      }

      return titoloMatch && risorsaMatch && dateMatch && statoMatch && prioritaMatch;
    });
  }, [data, filterTitolo, filterRisorsa, filterDate, filterStato, filterPriorita]);

  const resetFilters = () => {
    setFilterTitolo('');
    setFilterRisorsa(null); 
    setFilterDate(null);
    setFilterStato(null);
    setFilterPriorita(null);
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
      <Alert message="Errore nel caricamento" description={error} type="error" showIcon style={{ margin: '20px' }} />
    );
  }

  const getStatoConfig = (stato?: string) => {
    const s = (stato || '').toUpperCase().replace(/ /g, '_');
    switch (s) {
      case 'APERTO': return { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Aperto' };
      case 'IN_LAVORAZIONE': 
      case 'IN_CORSO':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'In Lavorazione' };
      case 'COMPLETATA': 
      case 'RISOLTA':
      case 'CHIUSA':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Completata' };
      default: return { color: 'default', icon: <FileTextOutlined />, text: stato || 'Sconosciuto' };
    }
  };

  const getPrioritaConfig = (priorita?: string) => {
    const p = (priorita || 'N/D').toUpperCase();
    switch (p) {
        case 'ALTA': return { color: 'red', text: 'Alta' };
        case 'MEDIA': return { color: 'orange', text: 'Media' };
        case 'BASSA': return { color: 'blue', text: 'Bassa' };
        default: return { color: 'default', text: priorita };
    }
  };

  const handleCardClick = (segnalazione: Segnalazione) => {
    setSelectedSegnalazione(segnalazione);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSegnalazione(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Segnalazioni</h2>
        
        <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Row gutter={[16, 16]} align="top"> 
           
           <Col xs={24} md={6}>
              <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>Cerca nel titolo</div>
              <Input
                placeholder="Es. Guasto..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={filterTitolo}
                onChange={e => setFilterTitolo(e.target.value)}
                allowClear
                maxLength={50}
                status={filterTitolo.length === 50 ? 'warning' : ''}
              />
              {filterTitolo.length === 50 && (
                <div style={{ color: '#faad14', fontSize: '11px', marginTop: '2px' }}>
                   ⚠️ Limite caratteri raggiunto (50)
                </div>
              )}
            </Col>
            
            <Col xs={24} md={6}>
              <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>Seleziona Risorsa</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Scegli dalla lista..."
                allowClear
                showSearch 
                options={resourceOptions} 
                value={filterRisorsa}
                onChange={setFilterRisorsa}
                optionFilterProp="label" 
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} md={6}>
               <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>Priorità</div>
               <Select
                  style={{ width: '100%' }}
                  placeholder="Tutte"
                  allowClear
                  options={prioritaOptions}
                  value={filterPriorita}
                  onChange={setFilterPriorita}
               />
            </Col>

            <Col xs={24} md={6}>
               <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>Stato</div>
               <Select
                  style={{ width: '100%' }}
                  placeholder="Tutti"
                  allowClear
                  options={statoOptions}
                  value={filterStato}
                  onChange={setFilterStato}
               />
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>Data Creazione</div>
              <RangePicker 
                style={{ width: '100%' }} 
                placeholder={['Dal', 'Al']}
                format="DD/MM/YYYY"
                value={filterDate}
                onChange={(dates) => setFilterDate(dates as any)}
                disabledDate={(current) => current && current > dayjs().endOf('day')} 
              />
            </Col>

            <Col xs={24} md={16} style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button 
                icon={<ClearOutlined />} 
                onClick={resetFilters}
                disabled={!filterTitolo && !filterRisorsa && !filterDate && !filterStato && !filterPriorita}
                style={{ marginTop: '20px' }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {(!filteredData || filteredData.length === 0) ? (
        <Empty
          description="Nessuna segnalazione trovata con i filtri selezionati"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '60px 0' }}
        >
            <Button type="primary" onClick={resetFilters}>Rimuovi Filtri</Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={24}>
             <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>
                Trovate {filteredData.length} segnalazioni
             </p>
          </Col>
          {filteredData.map((segnalazione) => {
            const statoConfig = getStatoConfig(segnalazione.stato);
            const priorita = (segnalazione as any).priorita || 'N/D';
            const prioritaConfig = getPrioritaConfig(priorita);

            return (
              <Col xs={24} key={segnalazione.id}>
                <Badge.Ribbon text={prioritaConfig.text} color={prioritaConfig.color}>
                  <Card
                    hoverable
                    onClick={() => handleCardClick(segnalazione)}
                    style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={16}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <WarningOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginTop: '4px' }} />
                            <div>
                              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                                {segnalazione.titolo}
                              </h3>
                              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {segnalazione.descrizione}
                              </p>
                            </div>
                          </div>

                          <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small" layout="vertical">
                            <Descriptions.Item label={<><FolderOutlined /> Risorsa ID</>}>
                                <span style={{ fontWeight: '500' }}>
                                    {segnalazione.risorsa?.toString()}
                                </span>
                            </Descriptions.Item>
                            
                            <Descriptions.Item label={<><CalendarOutlined /> Data</>}>
                              {new Date(segnalazione.dataCreazione).toLocaleDateString('it-IT')}
                            </Descriptions.Item>

                            <Descriptions.Item label="Stato">
                                <Tag color={statoConfig.color} icon={statoConfig.icon}>
                                    {statoConfig.text}
                                </Tag>
                            </Descriptions.Item>
                          </Descriptions>
                        </Space>
                      </Col>
                      
                      {segnalazione.allegati && segnalazione.allegati.length > 0 && (
                        <Col xs={24} md={8}>
                          <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: '16px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <PaperClipOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#333' }}>
                              {segnalazione.allegati.length} Allegato{segnalazione.allegati.length !== 1 ? 'i' : ''}
                            </p>
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
      )}

      <Modal
        title={<Space><WarningOutlined style={{ color: '#ff4d4f' }} /> {selectedSegnalazione?.titolo}</Space>}
        open={isModalOpen}
        onCancel={handleModalClose}
        width={900}
        footer={[<Button key="close" onClick={handleModalClose}>Chiudi</Button>]}
      >
        {selectedSegnalazione && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <h4 style={{ fontWeight: '600' }}>Descrizione</h4>
              <p style={{ color: '#666' }}>{selectedSegnalazione.descrizione}</p>
            </div>
            <Divider />
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Matricola">{selectedSegnalazione.matricola || 'N/D'}</Descriptions.Item>
              <Descriptions.Item label="Risorsa">
                 {(() => {
                    const rObj = selectedSegnalazione.Risorsa || (selectedSegnalazione as any).Risorsa;
                    return rObj?.nome 
                        ? `${rObj.nome} (ID: ${selectedSegnalazione.risorsa})` 
                        : selectedSegnalazione.risorsa?.toString();
                 })()}
              </Descriptions.Item>
              
              <Descriptions.Item label="Priorità">
                 <Tag>{(selectedSegnalazione as any).priorita || 'N/D'}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Stato"><Tag>{selectedSegnalazione.stato}</Tag></Descriptions.Item>
              
              <Descriptions.Item label="Data">{new Date(selectedSegnalazione.dataCreazione).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
            {selectedSegnalazione.allegati && selectedSegnalazione.allegati.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h4>Allegati ({selectedSegnalazione.allegati.length})</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {selectedSegnalazione.allegati.map((img, idx) => (
                             <img key={idx} src={img} alt="allegato" style={{ height: '100px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        ))}
                    </div>
                </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}