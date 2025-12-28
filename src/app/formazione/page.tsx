'use client';

import React, { useMemo, useState } from 'react';
import { Avatar, Button, Card, Space, Spin, Tag, Typography, message } from 'antd';
import { MailOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';

import type { UserLS } from '@/model/formazione';
import { useCorsiFormazione } from '@/hook/useCorsiFormazioneHook';
import { useStatoFormazione } from '@/hook/useStatoFormazioneHook';
import { useCompleteFormazione } from '@/hook/useCompleteFormazioneHook';

import { DashboardFormazione } from '@/components/formazione/DashboardFormazione';
import { ListaCorsiFormazione } from '@/components/formazione/ListaCorsiFormazione';

const { Text } = Typography;

const getRuoloColor = (ruolo?: string) => {
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

export default function FormazionePage() {
  const [userData] = useState<UserLS | null>(() => {
    if (typeof window === 'undefined') return null;
    const userStr = window.localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserLS;
    } catch (e) {
      console.error('Errore parsing user localStorage:', e);
      return null;
    }
  });

  const enabled = Boolean(userData?.matricola);
  const targetMatricola: string | undefined = undefined;

  const { corsi, loadingCorsi, error, reload } = useCorsiFormazione(enabled, targetMatricola);
  const { stato, loadingStato, errorStato, reloadStato } = useStatoFormazione(enabled, targetMatricola);

  const { complete, loadingComplete } = useCompleteFormazione(async () => {
    await Promise.all([reload(), reloadStato()]);
  }, targetMatricola);

  const displayName = useMemo(() => {
    if (!userData) return 'Utente';
    return userData.nome && userData.cognome ? `${userData.nome} ${userData.cognome}` : 'Utente';
  }, [userData]);

  const avatarText = useMemo(() => {
    if (!userData?.nome || !userData?.cognome) return 'U';
    return `${userData.nome[0]}${userData.cognome[0]}`.toUpperCase();
  }, [userData]);

  const onComplete = async (idGestione: string) => {
    const res = await complete(idGestione);
    if (!res.ok) message.error(res.error);
    else message.success('Corso segnato come completato.');
  };

  const onRefresh = async () => {
    await Promise.all([reload(), reloadStato()]);
  };

  if (!userData) {
    return (
      <Card>
        <p>Nessun dato utente disponibile. Effettua il login.</p>
      </Card>
    );
  }

  if (loadingStato && corsi.length === 0 && !error && !errorStato) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: 32 } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Avatar size={100} style={{ backgroundColor: '#1890ff', fontSize: 36, fontWeight: 700 }}>
            {avatarText}
          </Avatar>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600 }}>Formazione</h1>

            <Space size="middle" wrap>
              <Tag color={getRuoloColor(userData.ruolo)} style={{ fontSize: 14, padding: '4px 12px' }}>
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
            onClick={onRefresh}
            loading={loadingCorsi || loadingStato}
          >
            Aggiorna
          </Button>
        </div>
      </Card>

      <DashboardFormazione stato={stato} />

      <ListaCorsiFormazione
        corsi={corsi}
        loading={loadingCorsi}
        error={error}
        onComplete={onComplete}
        completing={loadingComplete}
      />

      {(error || errorStato) && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">
            Verifica login/sessione e le route: <b>/api/formazione/corsi</b>, <b>/api/formazione/stato</b>, <b>/api/formazione/completamento</b>.
          </Text>
        </div>
      )}
    </div>
  );
}
