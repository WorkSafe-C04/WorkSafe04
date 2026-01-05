"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateRisorsaForm } from '@/components/risorse/CreateRisorsaForm';
import { ListaRisorse } from '@/components/risorse/ListaRisorse';

export default function RisorsePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponsabileSicurezza, setIsResponsabileSicurezza] = useState(false);

  useEffect(() => {
    // Legge i dati dell'utente dal localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsResponsabileSicurezza(userData.ruolo === 'ResponsabileSicurezza');
      } catch (err) {
        console.error('Errore nel parsing dei dati utente', err);
      }
    }
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      borderRadius: '10px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '42px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            🔧 Gestione Risorse & Manutenzione
          </h1>

          {isResponsabileSicurezza && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                height: '50px',
                padding: '0 30px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Aggiungi Risorsa
            </Button>
          )}
        </div>

        {/* Lista Risorse */}
        <ListaRisorse />

        {/* Modale per Creazione Risorsa */}
        <Modal
          title={
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ✨ Aggiungi Nuova Risorsa
            </span>
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={700}
          centered
          style={{ top: 20 }}
          bodyStyle={{ padding: '24px' }}
        >
          <CreateRisorsaForm onSuccess={handleCloseModal} />
        </Modal>
      </div>
    </div>
  );
}