'use client';

import React from 'react';
import { Carousel } from 'antd';
import { SafetyOutlined, TeamOutlined, FileProtectOutlined, AlertOutlined } from '@ant-design/icons';

const contentStyle: React.CSSProperties = {
  height: '400px',
  color: '#fff',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px',
  borderRadius: '8px',
};

const Carosello: React.FC = () => {
  return (
    <Carousel autoplay autoplaySpeed={5000} dotPlacement="bottom">
      <div>
        <div style={{ ...contentStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <SafetyOutlined style={{ fontSize: '80px', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
            Benvenuto in WorkSafe
          </h2>
          <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            Il sistema completo per la gestione della sicurezza sul lavoro.
            Monitora, forma e proteggi il tuo team in modo efficace.
          </p>
        </div>
      </div>

      <div>
        <div style={{ ...contentStyle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <TeamOutlined style={{ fontSize: '80px', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
            Formazione del Personale
          </h2>
          <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            Corsi di formazione, quiz e videocorsi per mantenere il tuo team
            sempre aggiornato sulle normative di sicurezza.
          </p>
        </div>
      </div>

      <div>
        <div style={{ ...contentStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <FileProtectOutlined style={{ fontSize: '80px', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
            Documentazione Completa
          </h2>
          <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            Gestisci tutta la documentazione di sicurezza in un unico posto.
            Allegati, procedure e certificazioni sempre a portata di mano.
          </p>
        </div>
      </div>

      <div>
        <div style={{ ...contentStyle, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <AlertOutlined style={{ fontSize: '80px', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
            Sistema di Segnalazioni
          </h2>
          <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            Segnala incidenti e situazioni di rischio in tempo reale.
            Traccia e risolvi le problematiche per un ambiente di lavoro più sicuro.
          </p>
        </div>
      </div>
    </Carousel>
  );
};

export default Carosello;
