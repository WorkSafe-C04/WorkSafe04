'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Form, Input, Button, Card, Typography, Upload } from 'antd';
import { useCreaSegnalazione } from '@/hook/creaSegnalazioneHook';
import { UploadOutlined } from '@ant-design/icons';


const { Title } = Typography;
const { TextArea } = Input;

export default function NuovaSegnalazionePage() {
    const [form] = Form.useForm();
    const { creaSegnalazione, loading } = useCreaSegnalazione();

    const onFinish = async (values: any) => {
        const success = await creaSegnalazione(values);
        if (success) {
            form.resetFields();
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
                                rules={[{ required: true, message: 'Specifica la risorsa' }]}
                            >
                                <Input placeholder="Es: Stampante Piano 1" />
                            </Form.Item>

                            <Form.Item
                                label="Matricola"
                                name="matricola"
                                rules={[{ required: true, message: 'Inserisci la matricola' }]}
                            >
                                <Input placeholder="Es: ABC12345" />
                            </Form.Item>
                        </div>

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
                                listType="picture"
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