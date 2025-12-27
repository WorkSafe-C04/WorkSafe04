"use client";
import React from 'react';
import { CreateRisorsaForm } from '@/components/risorse/CreateRisorsaForm';
import { ListaRisorse } from '@/components/risorse/ListaRisorse';

export default function RisorsePage() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', background: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#001529' }}>
        Gestione Risorse & Manutenzione
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* SEZIONE 1: Creazione */}
        <CreateRisorsaForm />

        {/* SEZIONE 2: Lista e Modifica */}
        <ListaRisorse />
      </div>
    </div>
  );
}