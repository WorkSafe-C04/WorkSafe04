'use client';

import { useAvvisi } from '@/hook/avvisoHook';
import { Card, Tag, Spin, Alert } from 'antd';

export default function ListaAvvisi() {
  const { data, loading, error } = useAvvisi();

  if (loading) return <div className="p-10"><Spin size="large" /></div>;

  if (error) return <Alert message={error} type="error" />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista Avvisi</h1>

      <div className="grid gap-4">
        {data.map((avviso) => (
          <Card key={avviso.id} title={avviso.titolo} variant="outlined">
            <p className="text-gray-600 mb-2">{avviso.contenuto}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400">
                {avviso.dataCreazione ? new Date(avviso.dataCreazione).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}