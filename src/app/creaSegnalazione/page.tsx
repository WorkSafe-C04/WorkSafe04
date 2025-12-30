'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Form, Input, Button, Card, Typography, Upload, Select, Checkbox } from 'antd';
import { useCreaSegnalazione } from '@/hook/creaSegnalazioneHook';
import { useGetRisorse } from '@/hook/risorseHook';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';


const { Title } = Typography;
const { TextArea } = Input;

export default function NuovaSegnalazionePage() {
    const [form] = Form.useForm();
    const { creaSegnalazione, loading } = useCreaSegnalazione();
    const { risorse, loading: loadingRisorse } = useGetRisorse();
    const [isAnonima, setIsAnonima] = useState(false);
    const [userMatricola, setUserMatricola] = useState<string>('');

    // Recupera i dati dell'utente dal localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.matricola) {
                    setUserMatricola(user.matricola);
                    form.setFieldsValue({ matricola: user.matricola });
                }
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
            }
        }
    }, [form]);

    const onFinish = async (values: any) => {
        // Se la segnalazione è anonima, rimuovi la matricola
        const dataToSubmit = {
            ...values,
            matricola: isAnonima ? "Anonimo" : values.matricola
        };

        const success = await creaSegnalazione(dataToSubmit);
        if (success) {
            form.resetFields();
            setIsAnonima(false);
            // Ripristina la matricola dopo il reset
            if (userMatricola) {
                form.setFieldsValue({ matricola: userMatricola });
            }
        }
    };


    const normFile = (e: any) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    return (
        <AntdRegistry>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
                <Card>
                    <Title level={2}>Crea Nuova Segnalazione</Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Titolo"
                            name="titolo"
                            rules={[{ required: true, message: 'Inserisci un titolo' }]}
                        >
                            <Input placeholder="Es: Malfunzionamento hardware" />
                        </Form.Item>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Form.Item
                                label="Risorsa"
                                name="risorsa"
                                rules={[{ required: true, message: 'Seleziona una risorsa' }]}
                            >
                                <Select
                                    placeholder="Seleziona una risorsa"
                                    loading={loadingRisorse}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={risorse.map(risorsa => ({
                                        value: risorsa.id,
                                        label: risorsa.nome,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Matricola"
                                name="matricola"
                                rules={[
                                    {
                                        required: !isAnonima,
                                        message: 'La matricola è obbligatoria se non anonima'
                                    }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </div>

                        <Form.Item>
                            <Checkbox
                                checked={isAnonima}
                                onChange={(e) => {
                                    setIsAnonima(e.target.checked);
                                    if (e.target.checked) {
                                        form.setFieldsValue({ matricola: "Anonimo" });
                                    } else if (userMatricola) {
                                        form.setFieldsValue({ matricola: userMatricola });
                                    }
                                }}
                            >
                                Segnalazione anonima
                            </Checkbox>
                        </Form.Item>

                        <Form.Item
                            label="Descrizione"
                            name="descrizione"
                            rules={[{ required: true, message: 'Fornisci una descrizione dettagliata' }]}
                        >
                            <TextArea rows={4} placeholder="Descrivi qui il problema..." />
                        </Form.Item>

                        <Form.Item
                            label="Allegati"
                            name="allegati" // Questo nome deve essere uguale a quello usato nell'hook
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList;
                            }}
                        >
                            <Upload
                                beforeUpload={() => false} // Fondamentale: impedisce l'invio automatico
                                multiple
                                listType = "picture"
                                accept = ".png, .jpg, .jpeg, .heic"
                            >
                                <Button icon={<UploadOutlined />}>Seleziona Foto</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                Invia Segnalazione
                            </Button>
                        </Form.Item>

                    </Form>
                </Card>
            </div>

        </AntdRegistry>
    );
}