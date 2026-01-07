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
                    name="titolo"
                    label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📝 Titolo</span>}
                    rules={[{ required: true, message: 'Inserisci un titolo' },
                                { min: 5, message: 'Il titolo deve contenere almeno 5 caratteri' },
                                { max: 35, message: 'Il titolo non può superare i 35 caratteri' }
                            ]}
                >
                    <Input
                        size="large"
                        placeholder="Es: Comunicazione importante"
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Item>
                <Form.Item
                    name="contenuto"
                    label={<span style={{ fontWeight: '600', fontSize: '15px' }}>📄 Descrizione</span>}
                    rules={[{ required: true, message: 'Inserisci una descrizione' },
                                { min: 20, message: 'La descrizione deve contenere almeno 20 caratteri' },
                                { max: 150, message: 'La descrizione non può superare i 150 caratteri' }
                            ]}
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
                    🚀 Crea Avviso
                </Button>
            </Form>
        </div>
    )
}