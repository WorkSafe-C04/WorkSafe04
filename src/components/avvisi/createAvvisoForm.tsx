'use client';

import React from 'react';
import { Form, Input, Button, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCreateAvviso } from '@/hook/avvisoHook';

const { TextArea } = Input;

interface CreateAvvisoFormProps {
    onSuccess?: () => void;
}

export const CreateAvvisoForm: React.FC<CreateAvvisoFormProps> = ({ onSuccess }) => {
    const { create, loading } = useCreateAvviso();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const success = await create(values, () => {
            form.resetFields();
            if (onSuccess) {
                onSuccess();
            }
        });
    };

    return (
        <div style={{ padding: '10px 0' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="nome"
                    label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📝 Titolo</span>}
                    rules={[{ required: true, message: 'Inserisci il titolo dell avviso' }]}
                >
                    <Input
                        size="large"
                        placeholder="Es: Comunicazione importante"
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Item>
                <Form.Item
                    name="descrizione"
                    label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📄 Descrizione</span>}
                >
                    <TextArea
                        rows={4}
                        placeholder="Aggiungi dettagli sull avviso..."
                        style={{ borderRadius: '10px' }}
                    />
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
    )
}