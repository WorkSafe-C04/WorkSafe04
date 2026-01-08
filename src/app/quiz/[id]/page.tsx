'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Radio,
  Space,
  Spin,
  Modal,
  Progress,
  Row,
  Col,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuiz } from '@/hook/quizHook';

const { Title, Paragraph } = Typography;

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params.id as string;
  const idFormazione = searchParams.get('formazione') || '';
  const nomeQuiz = searchParams.get('nome') || 'Quiz';

  const {
    domande,
    loading,
    currentDomandaIndex,
    currentDomanda,
    risposte,
    submitting,
    loadDomande,
    rispondi,
    vaiAProssimaDomanda,
    vaiADomandaPrecedente,
    vaiADomanda,
    submitQuiz,
    isUltimaDomanda,
    isPrimaDomanda,
  } = useQuiz(quizId, idFormazione);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadDomande();
  }, [quizId]);

  const handleRisposta = (risposta: boolean) => {
    if (currentDomanda) {
      rispondi(currentDomanda.id, risposta);
    }
  };

  const handleSubmit = async () => {
    // Controlla se tutte le domande hanno una risposta
    const domandeNonRisposte = domande.filter(
      (d) => risposte[d.id] === undefined
    );

    if (domandeNonRisposte.length > 0) {
      Modal.warning({
        title: 'Attenzione',
        content: `Ci sono ancora ${domandeNonRisposte.length} domande senza risposta. Rispondi a tutte le domande prima di consegnare.`,
      });
      return;
    }

    const risultato = await submitQuiz();
    if (risultato) {
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    router.push('/home');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentDomanda || domande.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Nessuna domanda trovata per questo quiz</Title>
        <Button type="primary" onClick={() => router.back()}>
          Torna Indietro
        </Button>
      </div>
    );
  }

  const progressPercent = ((currentDomandaIndex + 1) / domande.length) * 100;
  const domandeRisposte = Object.keys(risposte).length;

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
          {nomeQuiz}
        </Title>
        <Paragraph style={{ color: 'white', marginBottom: '16px' }}>
          Domanda {currentDomandaIndex + 1} di {domande.length}
        </Paragraph>
        <Progress
          percent={progressPercent}
          strokeColor="#52c41a"
          trailColor="rgba(255,255,255,0.3)"
          showInfo={false}
        />
        <Paragraph style={{ color: 'white', marginTop: '8px', marginBottom: 0 }}>
          Risposte date: {domandeRisposte} / {domande.length}
        </Paragraph>
      </Card>

      {/* Domanda Corrente */}
      <Card
        style={{
          marginBottom: '24px',
          minHeight: '300px',
        }}
      >
        <Title level={4} style={{ marginBottom: '32px' }}>
          {currentDomanda.descrizione}
        </Title>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
            hoverable
            onClick={() => handleRisposta(true)}
            style={{
              background:
                risposte[currentDomanda.id] === true ? '#e6f7ff' : 'white',
              borderColor:
                risposte[currentDomanda.id] === true ? '#1890ff' : '#d9d9d9',
              borderWidth: '2px',
              cursor: 'pointer',
            }}
          >
            <Radio 
              checked={risposte[currentDomanda.id] === true}
              style={{ fontSize: '18px', pointerEvents: 'none' }}
            >
              <strong>VERO</strong>
            </Radio>
          </Card>
          <Card
            hoverable
            onClick={() => handleRisposta(false)}
            style={{
              background:
                risposte[currentDomanda.id] === false ? '#e6f7ff' : 'white',
              borderColor:
                risposte[currentDomanda.id] === false ? '#1890ff' : '#d9d9d9',
              borderWidth: '2px',
              cursor: 'pointer',
            }}
          >
            <Radio 
              checked={risposte[currentDomanda.id] === false}
              style={{ fontSize: '18px', pointerEvents: 'none' }}
            >
              <strong>FALSO</strong>
            </Radio>
          </Card>
        </Space>
      </Card>

      {/* Navigazione Numerata */}
      <Card style={{ marginBottom: '24px' }}>
        <Paragraph strong>Vai alla domanda:</Paragraph>
        <Row gutter={[8, 8]}>
          {domande.map((domanda, index) => (
            <Col key={domanda.id}>
              <Button
                type={index === currentDomandaIndex ? 'primary' : 'default'}
                shape="circle"
                onClick={() => vaiADomanda(index)}
                style={{
                  backgroundColor:
                    risposte[domanda.id] !== undefined && index !== currentDomandaIndex
                      ? '#52c41a'
                      : undefined,
                  borderColor:
                    risposte[domanda.id] !== undefined && index !== currentDomandaIndex
                      ? '#52c41a'
                      : undefined,
                  color:
                    risposte[domanda.id] !== undefined && index !== currentDomandaIndex
                      ? 'white'
                      : undefined,
                }}
              >
                {index + 1}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Controlli Navigazione */}
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button
            icon={<LeftOutlined />}
            onClick={vaiADomandaPrecedente}
            disabled={isPrimaDomanda}
            size="large"
          >
            Precedente
          </Button>

          {isUltimaDomanda ? (
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={submitting}
              style={{
                background: '#52c41a',
                borderColor: '#52c41a',
              }}
            >
              Consegna Quiz
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={vaiAProssimaDomanda}
              size="large"
            >
              Successiva
            </Button>
          )}
        </Space>
      </Card>

      {/* Modal Risultato */}
      <Modal
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        closable={false}
        centered
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {domandeRisposte === domande.length &&
          Object.entries(risposte).every(
            ([domandaId, risposta]) =>
              risposta ===
              domande.find((d) => d.id === domandaId)?.rispostaCorretta
          ) ? (
            <>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined
                  style={{ fontSize: '64px', color: 'white' }}
                />
              </div>
              <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
                🎉 Complimenti!
              </Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                Hai superato il quiz con successo! Tutte le risposte sono corrette.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                onClick={handleModalClose}
                style={{
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Vai alla Dashboard
              </Button>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloseCircleOutlined
                  style={{ fontSize: '64px', color: 'white' }}
                />
              </div>
              <Title level={2} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                Quiz Non Superato
              </Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: '8px' }}>
                Non hai risposto correttamente a tutte le domande.
              </Paragraph>
              <Paragraph style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '24px' }}>
                Studia il materiale e riprova più tardi.
              </Paragraph>
              <Space>
                <Button
                  size="large"
                  onClick={handleModalClose}
                  style={{
                    height: '48px',
                    fontSize: '16px',
                  }}
                >
                  Torna alla Dashboard
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => window.location.reload()}
                  style={{
                    height: '48px',
                    fontSize: '16px',
                  }}
                >
                  Riprova Quiz
                </Button>
              </Space>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
