'use client';

import { Tabs, Card, Row, Col, Spin, Button, Typography, Tag } from 'antd';
import {
  PlayCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useFormazioneDettaglio } from '@/hook/formazioneHook';
import { useParams } from 'next/navigation';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function FormazioneDettaglioPage() {
  const params = useParams();
  const id = params.id as string;
  const { formazione, loading } = useFormazioneDettaglio(id);

  if (loading || !formazione) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'Completato':
        return 'success';
      case 'InCorso':
        return 'processing';
      case 'NonIniziato':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'Completato':
        return <CheckCircleOutlined />;
      case 'InCorso':
        return <LoadingOutlined />;
      case 'NonIniziato':
        return <ClockCircleOutlined />;
      default:
        return null;
    }
  };

  const handleDownloadDoc = (doc: any) => {
    try {
      // Decodifica il contenuto base64
      const binaryString = atob(doc.contenuto);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Crea il blob e scarica
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore nel download:', error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '12px',
          marginBottom: '24px',
          color: 'white',
        }}
      >
        <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
          {formazione.argomento}
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '16px', marginBottom: 0 }}>
          {formazione.numeroCorsi} Corsi Disponibili
        </Paragraph>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="videocorsi" size="large">
        {/* Video Corsi */}
        <TabPane
          tab={
            <span>
              <PlayCircleOutlined />
              Video Corsi ({formazione.videoCorsi?.length || 0})
            </span>
          }
          key="videocorsi"
        >
          <Row gutter={[16, 16]}>
            {formazione.videoCorsi?.map((video) => {
              const statoVideo = video.stato || 'NonIniziato';
              return (
              <Col xs={24} md={12} key={video.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      Guarda Video
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <PlayCircleOutlined
                        style={{ fontSize: '32px', color: '#667eea' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {video.nome}
                        <Tag color={getStatoColor(statoVideo)} icon={getStatoIcon(statoVideo)}>
                          {statoVideo === 'NonIniziato' ? 'Non Iniziato' : 
                           statoVideo === 'InCorso' ? 'In Corso' : 
                           'Completato'}
                        </Tag>
                      </div>
                    }
                    description={
                      <>
                        <Paragraph style={{ marginBottom: '8px' }}>
                          {video.descrizione}
                        </Paragraph>
                        <div>
                          <ClockCircleOutlined /> {video.durata} minuti
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            )})}

          </Row>
        </TabPane>

        {/* Documentazioni */}
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Documentazioni ({formazione.documentazioni?.length || 0})
            </span>
          }
          key="documentazioni"
        >
          <Row gutter={[16, 16]}>
            {formazione.documentazioni?.map((doc) => (
              <Col xs={24} md={12} key={doc.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadDoc(doc)}
                    >
                      Scarica PDF
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <FileTextOutlined
                        style={{ fontSize: '32px', color: '#f5222d' }}
                      />
                    }
                    title={doc.nome}
                    description={doc.descrizione}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        {/* Quiz */}
        <TabPane
          tab={
            <span>
              <EditOutlined />
              Quiz ({formazione.quiz?.length || 0})
            </span>
          }
          key="quiz"
        >
          <Row gutter={[16, 16]}>
            {formazione.quiz?.map((quiz) => (
              <Col xs={24} md={12} key={quiz.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button type="primary" icon={<EditOutlined />}>
                      Inizia Quiz
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <EditOutlined
                        style={{ fontSize: '32px', color: '#52c41a' }}
                      />
                    }
                    title={quiz.nome}
                    description={
                      <>
                        <div>
                          <ClockCircleOutlined /> Durata: {quiz.durata} minuti
                        </div>
                        <div>
                          <TrophyOutlined /> Punteggio: {quiz.punteggio || 0}/100
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}
