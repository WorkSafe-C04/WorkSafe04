'use client'; 

import { useSegnalazioni } from '@/hook/useSegnalazioni';
import { Card, Tag, Spin, Alert } from 'antd'; 

export default function SegnalazioniPage() {
  const { data, loading, error } = useSegnalazioni();

  if (loading) return <div className="p-10"><Spin size="large" /></div>;
  
  if (error) return <Alert message={error} type="error" />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista Segnalazioni</h1>
      
      <div className="grid gap-4">
        {data.map((segnalazione) => (
        <Card key={segnalazione.id} title={segnalazione.titolo} variant="outlined">
            <p className="text-gray-600 mb-2">{segnalazione.descrizione}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400">
                {new Date(segnalazione.dataCreazione).toLocaleDateString()}
              </span>
              <Tag color={segnalazione.stato === 'APERTA' ? 'red' : 'green'}>
                {segnalazione.stato}
              </Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}