'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Button, Space, Tag, Spin, Table, Timeline, Empty } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, SafetyCertificateOutlined, EditOutlined, AlertOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { UtenteNoPass } from '@/model/utente';
import axios from 'axios';

interface Segnalazione {
    id: number;
    titolo: string;
    descrizione: string | null;
    stato: string | null;
    priorita: string | null;
    dataCreazione: Date | null;
    risorsa: { id: string; nome: string } | null;
}

interface FormazioneSuperata {
    id: string;
    stato: string | null;
    formazione: {
        id: string;
        argomento: string | null;
        numeroCorsi: string;
    } | null;
    quiz: {
        id: string;
        nome: string;
        durata: string | null;
    } | null;
}

export default function ProfiloPage() {
    const [userData, setUserData] = useState<UtenteNoPass | null>(null);
    const [loading, setLoading] = useState(true);
    const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
    const [formazioni, setFormazioni] = useState<FormazioneSuperata[]>([]);
    const [loadingSegnalazioni, setLoadingSegnalazioni] = useState(false);
    const [loadingFormazioni, setLoadingFormazioni] = useState(false);

    useEffect(() => {
        // Recupera i dati dell'utente dal localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserData(user);
                
                // Carica segnalazioni e formazioni
                if (user.matricola) {
                    loadSegnalazioni(user.matricola);
                    loadFormazioni(user.matricola);
                }
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
            }
        }
        setLoading(false);
    }, []);

    const loadSegnalazioni = async (matricola: string) => {
        setLoadingSegnalazioni(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/utenti/${matricola}/segnalazioni`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSegnalazioni(response.data);
        } catch (error) {
            console.error('Errore nel caricamento delle segnalazioni:', error);
        } finally {
            setLoadingSegnalazioni(false);
        }
    };

    const loadFormazioni = async (matricola: string) => {
        setLoadingFormazioni(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/utenti/${matricola}/formazioni`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormazioni(response.data);
        } catch (error) {
            console.error('Errore nel caricamento delle formazioni:', error);
        } finally {
            setLoadingFormazioni(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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

    const displayName = userData.nome && userData.cognome
        ? `${userData.nome} ${userData.cognome}`
        : 'Utente';

    const avatarText = userData.nome && userData.cognome
        ? `${userData.nome[0]}${userData.cognome[0]}`.toUpperCase()
        : 'U';

    const getRuoloColor = (ruolo?: string) => {
        switch (ruolo) {
            case 'Admin': return 'red';
            case 'Manager': return 'blue';
            case 'RSPP': return 'purple';
            case 'Dipendente': return 'green';
            default: return 'default';
        }
    };

    const formatDate = (date?: Date | string) => {
        if (!date) return 'Non disponibile';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('it-IT');
    };

    const getStatoColor = (stato?: string | null) => {
        switch (stato) {
            case 'Risolta': return 'success';
            case 'In Lavorazione': return 'processing';
            case 'Aperta': return 'warning';
            case 'Chiusa': return 'default';
            default: return 'default';
        }
    };

    const getPrioritaColor = (priorita?: string | null) => {
        switch (priorita) {
            case 'Alta': return 'red';
            case 'Media': return 'orange';
            case 'Bassa': return 'green';
            default: return 'default';
        }
    };

    const segnalazioniColumns = [
        {
            title: 'Titolo',
            dataIndex: 'titolo',
            key: 'titolo',
        },
        {
            title: 'Risorsa',
            dataIndex: 'risorsa',
            key: 'risorsa',
            render: (risorsa: { id: string; nome: string } | null) => risorsa?.nome || 'N/A',
        },
        {
            title: 'Priorità',
            dataIndex: 'priorita',
            key: 'priorita',
            render: (priorita: string | null) => (
                <Tag color={getPrioritaColor(priorita)}>{priorita || 'Non definita'}</Tag>
            ),
        },
        {
            title: 'Stato',
            dataIndex: 'stato',
            key: 'stato',
            render: (stato: string | null) => (
                <Tag color={getStatoColor(stato)}>{stato || 'Non definito'}</Tag>
            ),
        },
        {
            title: 'Data',
            dataIndex: 'dataCreazione',
            key: 'dataCreazione',
            render: (date: Date | null) => date ? new Date(date).toLocaleDateString('it-IT') : 'N/A',
        },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Card
                style={{ marginBottom: '24px' }}
                styles={{
                    body: { padding: '32px' }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <Avatar
                        size={100}
                        style={{
                            backgroundColor: '#1890ff',
                            fontSize: '36px',
                            fontWeight: 'bold'
                        }}
                    >
                        {avatarText}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
                            {displayName}
                        </h1>
                        <Space size="middle">
                            <Tag color={getRuoloColor(userData.ruolo)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                                {userData.ruolo || 'Dipendente'}
                            </Tag>
                            {userData.email && (
                                <span style={{ color: '#666', fontSize: '15px' }}>
                                    <MailOutlined /> {userData.email}
                                </span>
                            )}
                        </Space>
                    </div>
                    {/* <Button type="primary" icon={<EditOutlined />} size="large">
                        Modifica Profilo
                    </Button> */}
                </div>
            </Card>

            <Card
                title="Informazioni Personali"
                extra={<UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
            >
                <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered>
                    <Descriptions.Item label="Matricola">
                        {userData.matricola || 'Non disponibile'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nome">
                        {userData.nome || 'Non disponibile'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cognome">
                        {userData.cognome || 'Non disponibile'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {userData.email || 'Non disponibile'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Data di Nascita">
                        <Space>
                            <CalendarOutlined />
                            {formatDate(userData.dataNascita)}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Data di Assunzione">
                        <Space>
                            <CalendarOutlined />
                            {formatDate(userData.dataAssunzione)}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ruolo">
                        <Tag color={getRuoloColor(userData.ruolo)}>
                            <SafetyCertificateOutlined /> {userData.ruolo || 'Dipendente'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Segnalazioni */}
            <Card
                title={
                    <Space>
                        <AlertOutlined style={{ color: '#ff4d4f' }} />
                        <span>Le Mie Segnalazioni</span>
                    </Space>
                }
                style={{ marginTop: '24px' }}
            >
                {loadingSegnalazioni ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin />
                    </div>
                ) : segnalazioni.length > 0 ? (
                    <Table
                        dataSource={segnalazioni}
                        columns={segnalazioniColumns}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                ) : (
                    <Empty description="Nessuna segnalazione effettuata" />
                )}
            </Card>

            {/* Formazioni Superate */}
            <Card
                title={
                    <Space>
                        <TrophyOutlined style={{ color: '#52c41a' }} />
                        <span>Formazioni Superate</span>
                    </Space>
                }
                style={{ marginTop: '24px' }}
            >
                {loadingFormazioni ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin />
                    </div>
                ) : formazioni.length > 0 ? (
                    <Timeline
                        items={formazioni.map((f) => ({
                            color: 'green',
                            dot: <TrophyOutlined style={{ fontSize: '16px' }} />,
                            children: (
                                <div>
                                    <strong style={{ fontSize: '16px' }}>
                                        {f.formazione?.argomento || 'Formazione'}
                                    </strong>
                                    {f.quiz && (
                                        <div style={{ marginTop: '8px' }}>
                                            <Tag color="green">Quiz: {f.quiz.nome}</Tag>
                                            {f.quiz.durata && (
                                                <Tag icon={<ClockCircleOutlined />}>
                                                    {f.quiz.durata} minuti
                                                </Tag>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ),
                        }))}
                    />
                ) : (
                    <Empty description="Nessuna formazione completata" />
                )}
            </Card>
        </div>
    );
}
