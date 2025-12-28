'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Button, Space, Tag, Spin } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import { UtenteNoPass } from '@/model/utente';

export default function ProfiloPage() {
    const [userData, setUserData] = useState<UtenteNoPass | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recupera i dati dell'utente dal localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserData(user);
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
            }
        }
        setLoading(false);
    }, []);

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
                    <Button type="primary" icon={<EditOutlined />} size="large">
                        Modifica Profilo
                    </Button>
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
        </div>
    );
}
