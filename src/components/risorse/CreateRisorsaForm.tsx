"use client";
import React from 'react';
import { Form, Input, Button, Select, Card, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCreateRisorsa } from '@/hook/useRisorse';

const { Option } = Select;
const { TextArea } = Input;

export const CreateRisorsaForm: React.FC = () => {
  const { create, loading } = useCreateRisorsa();
  const [form] = Form.useForm();

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onFinish = async (values: any) => {
    let scheda = undefined;
    if (values.upload && values.upload.length > 0) {
      scheda = await getBase64(values.upload[0].originFileObj);
    }

    await create({ 
      nome: values.nome,
      tipo: values.tipo,
      descrizione: values.descrizione,
      schedaAllegata: scheda
    });
    
    form.resetFields();
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <Card title="Aggiungi Nuova Risorsa" style={{ maxWidth: 600, margin: "20px auto" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="nome" label="Nome" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
          <Select>
            <Option value="Macchinario">Macchinario</Option>
            <Option value="Attrezzatura">Attrezzatura</Option>
            <Option value="DPI">DPI</Option>
          </Select>
        </Form.Item>
        <Form.Item name="descrizione" label="Descrizione">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="upload" label="Scheda Tecnica" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload maxCount={1} beforeUpload={() => false} listType="picture">
            <Button icon={<UploadOutlined />}>Allega</Button>
          </Upload>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Crea Risorsa
        </Button>
      </Form>
    </Card>
  );
};
