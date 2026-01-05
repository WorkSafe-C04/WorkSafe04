'use client';

import { useAvvisi } from '@/hook/avvisoHook';
import { Card, Spin, Alert, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateAvvisoForm } from '@/components/avvisi/createAvvisoForm';
import { useState, useEffect } from 'react';

export default function ListaAvvisi() {
  const { data, loading, error, refetch } = useAvvisi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<{ matricola?: string; ruolo?: string } | null>(null);
  const [isDatoreLavoro, setIsDatoreLavoro] = useState(false);

  // Carica dati utente
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        setIsDatoreLavoro(user.ruolo === 'DatoreDiLavoro');
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
      }
    }
  }, []);

  // RIMOSSO: Non marcare automaticamente gli avvisi come letti
  // Ogni utente deve cliccare sulla notifica per marcarla come letta

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  if (loading) return <div className="p-10"><Spin size="large" /></div>;

  if (error) return <Alert message={error} type="error" />;

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="text-2xl font-bold">Lista Avvisi</h1>
        {isDatoreLavoro && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={handleOpenModal}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            Crea Avviso
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {data.map((avviso) => (
          <Card key={avviso.id} id={`avviso-${avviso.id}`} title={avviso.titolo} variant="outlined">
            <p className="text-gray-600 mb-2">{avviso.descrizione}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400">
                {avviso.dataCreazione ? new Date(avviso.dataCreazione).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Crea Nuovo Avviso"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <CreateAvvisoForm onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}