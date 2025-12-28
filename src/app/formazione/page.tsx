'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, Empty, Space, Spin, Tag, Typography, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  BookOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

type UserLS = {
  matricola?: string;
  ruolo?: string;
  nome?: string;
  cognome?: string;
  email?: string;
};

type VideoCorsoDTO = {
  id: string;
  nome: string;
  url: string;
  durata?: string | null;
  descrizione?: string | null;
  stato?: string | null;
};

type QuizDTO = {
  id: string;
  nome: string;
  durata?: string | null;
  punteggio?: string | null;
};

type CorsoDTO = {
  id: string; // GestioneFormazione.id (BigInt -> string)
  idFormazione: string;
  matricola: string;
  stato?: string | null;
  Formazione?: {
    id: string;
    numeroCorsi: string;
    argomento?: string | null;
    VideoCorso: VideoCorsoDTO[];
    Quiz: QuizDTO[];
  } | null;
};

const { Title, Text } = Typography;

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Errore imprevisto.';
};

const getRuoloColor = (ruolo?: string) => {
  // mantengo mapping simile al profilo, ma copre i ruoli del vostro progetto
  switch (ruolo) {
    case 'Admin':
      return 'red';
    case 'Manager':
      return 'blue';
    case 'RSPP':
    case 'ResponsabileSicurezza':
      return 'purple';
    case 'DatoreDiLavoro':
      return 'volcano';
    case 'Dipendente':
      return 'green';
    default:
      return 'default';
  }
};

const getStatoTag = (stato?: string | null) => {
  const s = stato || 'Non Iniziato';
  if (s === 'Completato') return <Tag color="green" icon={<CheckCircleOutlined />}>{s}</Tag>;
  if (s === 'In Corso') return <Tag color="blue" icon={<ClockCircleOutlined />}>{s}</Tag>;
  return <Tag color="gold">{s}</Tag>;
};

export default function FormazionePage() {
  const [userData, setUserData] = useState<UserLS | null>(null);
  const [loading, setLoading] = useState(true);

  const [corsi, setCorsi] = useState<CorsoDTO[]>([]);
  const [loadingCorsi, setLoadingCorsi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (!userData) return 'Utente';
    return userData.nome && userData.cognome ? `${userData.nome} ${userData.cognome}` : 'Utente';
  }, [userData]);

  const avatarText = useMemo(() => {
    if (!userData?.nome || !userData?.cognome) return 'U';
    return `${userData.nome[0]}${userData.cognome[0]}`.toUpperCase();
  }, [userData]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as UserLS;
        setUserData(user);
      } catch (e) {
        console.error('Errore parsing user localStorage:', e);
      }
    }
    setLoading(false);
  }, []);

  const loadCorsi = async () => {
    setLoadingCorsi(true);
    setError(null);

    try {
      const res = await fetch('/api/formazione', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error?: unknown }).error ?? `Errore (HTTP ${res.status})`)
            : `Errore (HTTP ${res.status})`;

        setError(msg);
        setCorsi([]);
        return;
      }

      const data = (await res.json()) as CorsoDTO[];
      setCorsi(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Errore di rete nel recupero corsi.');
      setCorsi([]);
    } finally {
      setLoadingCorsi(false);
    }
  };

  useEffect(() => {
    if (userData) void loadCorsi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.matricola]);

  const segnaCompletato = async (idGestione: string) => {
    try {
      const res = await fetch('/api/formazione', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idGestione, stato: 'Completato' }),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error?: unknown }).error ?? `Errore aggiornamento (HTTP ${res.status})`)
            : `Errore aggiornamento (HTTP ${res.status})`;

        message.error(msg);
        return;
      }

      message.success('Corso segnato come completato.');
      await loadCorsi();
    } catch (e: unknown) {
      message.error(getErrorMessage(e) || 'Errore di rete durante aggiornamento.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <Card>
        <p>Nessun dato utente disponibile. Effettua il login.</p>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* HERO HEADER (stile Profilo) */}
      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: 32 } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Avatar
            size={100}
            style={{
              backgroundColor: '#1890ff',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {avatarText}
          </Avatar>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600 }}>
              Formazione
            </h1>

            <Space size="middle" wrap>
              <Tag
                color={getRuoloColor(userData.ruolo)}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {userData.ruolo || 'Dipendente'}
              </Tag>

              <span style={{ color: '#666', fontSize: 15 }}>
                <UserOutlined /> {displayName}
              </span>

              <span style={{ color: '#666', fontSize: 15 }}>
                Matricola: <b>{userData.matricola ?? 'N/D'}</b>
              </span>

              {userData.email && (
                <span style={{ color: '#666', fontSize: 15 }}>
                  <MailOutlined /> {userData.email}
                </span>
              )}
            </Space>
          </div>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="large"
            onClick={loadCorsi}
            loading={loadingCorsi}
          >
            Aggiorna
          </Button>
        </div>
      </Card>

      {/* CONTENUTO */}
      <Card
        title="Corsi assegnati"
        extra={<BookOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
      >
        {loadingCorsi && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spin />
          </div>
        )}

        {!loadingCorsi && error && (
          <div style={{ border: '1px solid #ffccc7', background: '#fff2f0', padding: 16, borderRadius: 6 }}>
            <Text strong style={{ color: '#cf1322' }}>Errore</Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ color: '#cf1322' }}>{error}</Text>
            </div>
          </div>
        )}

        {!loadingCorsi && !error && corsi.length === 0 && (
          <Empty description="Nessun corso assegnato al momento." />
        )}

        {!loadingCorsi && !error && corsi.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {corsi.map((item) => {
              const titolo = item.Formazione?.argomento ?? 'Argomento non specificato';
              const videoCount = item.Formazione?.VideoCorso?.length ?? 0;
              const quizCount = item.Formazione?.Quiz?.length ?? 0;

              return (
                <Card key={item.id} hoverable styles={{ body: { padding: 18 } }}>
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
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        href={`/formazione/${item.idFormazione}`}
                      >
                        Vai al corso
                      </Button>

                      <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => segnaCompletato(item.id)}
                        disabled={(item.stato ?? '').toLowerCase() === 'completato'}
                      >
                        Segna completato
                      </Button>
                    </Space>
                  </Space>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
