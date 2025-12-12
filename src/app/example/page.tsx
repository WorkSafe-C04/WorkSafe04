'use client';

import { useExample } from '@/hook/exampleHook';

export default function ExamplePage() {
  const { data, loading, error, refetch } = useExample();

  if (loading) {
    return <div className="p-8">Caricamento...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>{error}</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pagina di Esempio</h1>
      
      {data.length === 0 ? (
        <p>Nessun dato disponibile</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="p-4 border rounded">
              {item.numeroTelefono}
            </li>
          ))}
        </ul>
      )}
      
      <button 
        onClick={refetch} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ricarica dati
      </button>
    </div>
  );
}