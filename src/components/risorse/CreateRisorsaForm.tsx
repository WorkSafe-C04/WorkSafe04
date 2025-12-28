"use client";
import React from 'react';
import { Form, Input, Button, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCreateRisorsa } from '@/hook/risorseHook';

const { Option } = Select;
const { TextArea } = Input;

interface CreateRisorsaFormProps {
  onSuccess?: () => void;
}

export const CreateRisorsaForm: React.FC<CreateRisorsaFormProps> = ({ onSuccess }) => {
  const { create, loading } = useCreateRisorsa();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const success = await create(values, () => {
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="nome"
          label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📝 Nome</span>}
          rules={[{ required: true, message: 'Inserisci il nome della risorsa' }]}
        >
          <Input
            size="large"
            placeholder="Es: Trapano industriale"
            style={{ borderRadius: '10px' }}
          />
        </Form.Item>
        <Form.Item
          name="tipo"
          label={<span style={{ fontWeight: '600', fontSize: '15px' }}>🏷️ Tipo</span>}
          rules={[{ required: true, message: 'Seleziona il tipo di risorsa' }]}
        >
          <Select
            size="large"
            placeholder="Seleziona una categoria"
            style={{ borderRadius: '10px' }}
          >
            <Option value="Macchinario">⚙️ Macchinario</Option>
            <Option value="Attrezzatura">🔨 Attrezzatura</Option>
            <Option value="DPI">🦺 DPI (Dispositivi di Protezione)</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="descrizione"
          label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📄 Descrizione</span>}
        >
          <TextArea
            rows={4}
            placeholder="Aggiungi dettagli sulla risorsa..."
            style={{ borderRadius: '10px' }}
          />
        </Form.Item>
        <Form.Item
          name="upload"
          label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📎 Scheda Tecnica</span>}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload maxCount={1} beforeUpload={() => false} listType="picture">
            <Button
              icon={<UploadOutlined />}
              size="large"
              style={{ borderRadius: '10px' }}
            >
              Allega Documento
            </Button>
          </Upload>
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            height: '48px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            marginTop: '10px'
          }}
        >
          🚀 Crea Risorsa
        </Button>
      </Form>
    </div>
  );
};