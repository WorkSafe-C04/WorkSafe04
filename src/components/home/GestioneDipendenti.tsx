'use client';
import React, { useEffect, useState } from 'react';
import { Table, Select, DatePicker, Button, message, Tag, Card, Modal } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { Role } from '@/model/role';
import dayjs from 'dayjs';

const { Option } = Select;

interface Dipendente {
  matricola: string;
  nome?: string;
  cognome?: string;
  email?: string;
  ruolo?: string;
  dataNascita?: Date;
  dataAssunzione?: Date;
}

export const GestioneDipendenti: React.FC = () => {
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [loading, setLoading] = useState(false);
  const [modifiche, setModifiche] = useState<Record<string, { ruolo?: string; dataAssunzione?: Date }>>({});
  const [currentUserMatricola, setCurrentUserMatricola] = useState<string>('');

  const fetchDipendenti = async () => {
    setLoading(true);
    try {
      // Ottieni la matricola dell'utente corrente
      const userStr = localStorage.getItem('user');
      let matricolaCorrente = '';
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          matricolaCorrente = userData.matricola;
          setCurrentUserMatricola(matricolaCorrente);
        } catch (err) {
          console.error('Errore nel parsing dei dati utente', err);
        }
      }

      const response = await fetch('/api/utenti', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filtra per escludere l'utente corrente (datore di lavoro)
        const dipendentiFiltrati = data.filter((dip: Dipendente) => dip.matricola !== matricolaCorrente);
        setDipendenti(dipendentiFiltrati);
      } else {
        message.error('Errore nel caricamento dei dipendenti');
      }
    } catch (error) {
      message.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDipendenti();
  }, []);

  const handleRuoloChange = (matricola: string, nuovoRuolo: string) => {
    setModifiche(prev => ({
      ...prev,
      [matricola]: {
        ...prev[matricola],
        ruolo: nuovoRuolo
      }
    }));
  };

  const handleDataAssunzioneChange = (matricola: string, data: any) => {
    setModifiche(prev => ({
      ...prev,
      [matricola]: {
        ...prev[matricola],
        dataAssunzione: data ? data.toDate() : undefined
      }
    }));
  };

  const handleSave = async (matricola: string) => {
    const modifica = modifiche[matricola];
    if (!modifica) {
      message.warning('Nessuna modifica da salvare');
      return;
    }

    try {
      const response = await fetch('/api/utenti', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          matricola,
          ...modifica
        }),
      });

      if (response.ok) {
        message.success('Dipendente aggiornato con successo!');
        // Rimuovi le modifiche salvate
        setModifiche(prev => {
          const newModifiche = { ...prev };
          delete newModifiche[matricola];
          return newModifiche;
        });
        // Ricarica i dati
        fetchDipendenti();
      } else {
        const error = await response.json();
        message.error(error.message || 'Errore nell\'aggiornamento');
      }
    } catch (error) {
      message.error('Errore di connessione');
    }
  };

  const getRuoloColor = (ruolo?: string) => {
    switch (ruolo) {
      case Role.DATORE_LAVORO:
        return 'purple';
      case Role.RESPONSABILE_SICUREZZA:
        return 'red';
      case Role.MANUTENTORE:
        return 'orange';
      case Role.DIPENDENTE:
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Matricola',
      dataIndex: 'matricola',
      key: 'matricola',
      width: 120,
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: Dipendente) => 
        `${text || ''} ${record.cognome || ''}`.trim() || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ruolo Attuale',
      dataIndex: 'ruolo',
      key: 'ruoloAttuale',
      render: (ruolo: string) => (
        <Tag color={getRuoloColor(ruolo)} style={{ fontSize: '13px', padding: '4px 12px' }}>
          {ruolo || 'Non assegnato'}
        </Tag>
      )
    },
    {
      title: 'Modifica Ruolo',
      key: 'modificaRuolo',
      width: 220,
      render: (text: any, record: Dipendente) => (
        <Select
          placeholder="Seleziona ruolo"
          defaultValue={record.ruolo}
          style={{ width: '100%' }}
          onChange={(value) => handleRuoloChange(record.matricola, value)}
        >
          <Option value={Role.DIPENDENTE}>{Role.DIPENDENTE}</Option>
          <Option value={Role.RESPONSABILE_SICUREZZA}>{Role.RESPONSABILE_SICUREZZA}</Option>
          <Option value={Role.MANUTENTORE}>{Role.MANUTENTORE}</Option>
        </Select>
      )
    },
    {
      title: 'Data Assunzione',
      key: 'dataAssunzione',
      width: 200,
      render: (text: any, record: Dipendente) => (
        <DatePicker
          defaultValue={record.dataAssunzione ? dayjs(record.dataAssunzione) : undefined}
          format="DD/MM/YYYY"
          placeholder="Seleziona data"
          style={{ width: '100%' }}
          onChange={(date) => handleDataAssunzioneChange(record.matricola, date)}
        />
      )
    },
    {
      title: 'Azioni',
      key: 'azioni',
      width: 120,
      render: (text: any, record: Dipendente) => (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => handleSave(record.matricola)}
          disabled={!modifiche[record.matricola]}
          style={{
            background: modifiche[record.matricola] 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : undefined
          }}
        >
          Salva
        </Button>
      )
    }
  ];

  return (
    <Card
      title={
        <span style={{ fontSize: '20px', fontWeight: '600' }}>
          <UserOutlined style={{ marginRight: '8px' }} />
          Gestione Dipendenti
        </span>
      }
      style={{
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
        border: 'none',
        background: 'linear-gradient(to bottom, #ffffff, #f8f9ff)'
      }}
      headStyle={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px 10px 0 0',
        fontSize: '18px',
        padding: '20px 24px'
      }}
    >
      <Table
        dataSource={dipendenti}
        columns={columns}
        rowKey="matricola"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};
