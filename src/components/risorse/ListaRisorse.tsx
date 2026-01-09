"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Select,
  Card,
  Button,
  Modal,
  Descriptions,
  Spin,
  List,
  Typography
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import {
  useRisorseTable,
  getTipoIcon,
  getTipoColor,
} from "@/hook/risorseHook";
import { Risorsa } from "@/model/risorsa";

const { Option } = Select;
const { Text } = Typography;


type Segnalazione = {
  id: string;
  titolo: string;
  descrizione?: string;
  risorsa?: string;
  dataCreazione?: string;
  stato?: string;
};

interface ListaRisorseProps {
  filtroNome?: string;
  filtroDescrizione?: string;
  filtroStato?: string;
}

export const ListaRisorse: React.FC<ListaRisorseProps> = ({ 
  filtroNome = '', 
  filtroDescrizione = '', 
  filtroStato 
}) => {
  const { risorse, loading, refresh, handleStatoChange } = useRisorseTable();
  const [isManutentore, setIsManutentore] = useState(false);

  useEffect(() => {
    // Legge i dati dell'utente dal localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsManutentore(userData.ruolo === 'Manutentore');
      } catch (err) {
        console.error('Errore nel parsing dei dati utente', err);
      }
    }
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedRisorsa, setSelectedRisorsa] = useState<Risorsa | null>(null);
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [loadingSegnalazioni, setLoadingSegnalazioni] = useState(false);

  /* 
     FETCH SEGNALAZIONI 
      */
  const fetchSegnalazioni = async (risorsaId: string) => {
    setLoadingSegnalazioni(true);
    setSegnalazioni([]);
    
    try {
      // Chiama l'API passando l'ID della risorsa come filtro
      const res = await fetch(`/api/segnalazioni?risorsaId=${risorsaId}`);
      
      if (!res.ok) {
        throw new Error("Errore API segnalazioni");
      }

      const data: Segnalazione[] = await res.json();
      setSegnalazioni(data);
    } catch (error) {
      console.error("Errore caricamento segnalazioni:", error);
      // In caso di errore la lista rimane vuota
      setSegnalazioni([]);
    } finally {
      setLoadingSegnalazioni(false);
    }
  };

  const columns = [
    {
      title: "📦 Nome",
      dataIndex: "nome",
      key: "nome",
      render: (text: string, record: Risorsa) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRisorsa(record);
            setOpen(true);
            fetchSegnalazioni(record.id.toString());
          }}
          style={{ 
            fontWeight: "bold", 
            fontSize: 15,
            cursor: "pointer",   
            color: "inherit",     
            display: "inline-block",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          {text}
        </div>
      ),
    },
    {
      title: "🏷️ Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={getTipoColor(tipo)}>
          {getTipoIcon(tipo)} {tipo}
        </Tag>
      ),
    },
    {
      title: "📝 Descrizione",
      dataIndex: "descrizione",
      key: "descrizione",
      render: (text?: string) => text || <Text type="secondary">Nessuna descrizione</Text>,
    },
    {
      title: "📎 Allegato",
      dataIndex: "schedaAllegata",
      key: "schedaAllegata",
      render: (scheda: string | undefined, record: Risorsa) =>
        scheda ? (
          <a
            href={scheda}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            📄 {record.nomeFile ?? "Apri Scheda"}
          </a>
        ) : (
          <Text type="secondary">Nessun allegato</Text>
        ),
    },
    {
      title: "⚡ Stato",
      dataIndex: "stato",
      key: "stato",
      render: (stato: string, record: Risorsa) => (
        <Select
          value={stato}
          style={{ width: 180 }}
          disabled={!isManutentore}
          // Impedisce l'apertura della modale quando si clicca sul select
          onClick={(e) => e.stopPropagation()} 
          onChange={(value) => handleStatoChange(record.id, value)}
          status={
            stato === "Guasto"
              ? "error"
              : stato === "In Manutenzione"
              ? "warning"
              : ""
          }
        >
          <Option value="Disponibile">✅ Disponibile</Option>
          <Option value="In Manutenzione">⚠️ In Manutenzione</Option>
          <Option value="Segnalato">⛔ Segnalato</Option>
        </Select>
      ),
    },
  ];

  // Filtra le risorse in base ai criteri
  const risorseFiltrate = risorse.filter((risorsa) => {
    const matchNome = !filtroNome || 
      risorsa.nome?.toLowerCase().includes(filtroNome.toLowerCase());
    
    const matchDescrizione = !filtroDescrizione || 
      risorsa.descrizione?.toLowerCase().includes(filtroDescrizione.toLowerCase());
    
    const matchStato = !filtroStato || risorsa.stato === filtroStato;

    return matchNome && matchDescrizione && matchStato;
  });

  return (
    <Card
      title={
        <span>
          📋 Inventario Risorse
          {(filtroNome || filtroDescrizione || filtroStato) && (
            <span style={{ 
              marginLeft: '12px', 
              fontSize: '14px', 
              fontWeight: 'normal',
              color: '#1890ff'
            }}>
              ({risorseFiltrate.length} di {risorse.length} risorse)
            </span>
          )}
        </span>
      }
      extra={
        <Button
          icon={<SyncOutlined />}
          onClick={refresh}
          type="primary"
        >
          Aggiorna
        </Button>
      }
    >
      <Table
        dataSource={risorseFiltrate}
        columns={columns}
        rowKey={(record) => record.id.toString()}
        loading={loading}
        pagination={{ pageSize: 6 }}
        onRow={(record) => ({
          style: { cursor: "default" }, 
        })}
      />

      {/*  MODALE DETTAGLI  */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
        title={
          <span>
            📦 Dettagli Risorsa: <strong>{selectedRisorsa?.nome}</strong>
          </span>
        }
      >
        {selectedRisorsa && (
          <>
            {/* Dettagli Generali */}
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Nome">
                {selectedRisorsa.nome}
              </Descriptions.Item>

              <Descriptions.Item label="Tipo">
                <Tag color={getTipoColor(selectedRisorsa.tipo || "")}>
                  {getTipoIcon(selectedRisorsa.tipo || "")}{" "}
                  {selectedRisorsa.tipo}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Descrizione">
                {selectedRisorsa.descrizione || "Nessuna descrizione"}
              </Descriptions.Item>

              <Descriptions.Item label="Stato Attuale">
                <strong>{selectedRisorsa.stato}</strong>
              </Descriptions.Item>
            </Descriptions>

            {/* Sezione Cronologia Segnalazioni */}
            <div style={{ marginTop: 24 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: "1px solid #f0f0f0", 
                paddingBottom: 8,
                marginBottom: 12
              }}>
                <h3 style={{ margin: 0 }}>🛠️ Cronologia Segnalazioni</h3>
              </div>

              {loadingSegnalazioni ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <Spin tip="Caricamento storico..." />
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={segnalazioni}
                  locale={{ emptyText: "Nessuna segnalazione registrata per questa risorsa." }}
                  renderItem={(s) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <span style={{ color: "#1890ff", fontWeight: 500 }}>
                            {s.titolo}
                          </span>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              {s.descrizione || "Nessun dettaglio fornito"}
                            </div>
                            <small style={{ color: "#8c8c8c" }}>
                              📅 Data: {s.dataCreazione 
                                ? new Date(s.dataCreazione).toLocaleDateString("it-IT") 
                                : "N/A"}
                            </small>
                          </div>
                        }
                      />
                      {s.stato && (
                        <Tag color={s.stato === 'RISOLTA' ? 'green' : 'volcano'}>
                          {s.stato}
                        </Tag>
                      )}
                    </List.Item>
                  )}
                />
              )}
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
};