'use client';

import { useState } from 'react';
import { useRegister } from '@/hook/registerHook';
import { Button, Form, Input, DatePicker, Select, message } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Option } = Select;

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        matricola: '',
        nome: '',
        cognome: '',
        dataNascita: '',
        email: '',
        password: '',
        ruolo: '',
        dataAssunzione: ''
    });
    const { register, loading, error, user } = useRegister();
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            await register(formData);
            message.success('Registrazione riuscita!');
            router.push('/auth/login');
        } catch (err) {
            message.error(error || 'Errore durante la registrazione');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
            <h2>Registrazione</h2>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="Matricola"
                    name="matricola"
                    rules={[{ required: true, message: 'Inserisci la matricola' }]}
                >
                    <Input
                        value={formData.matricola}
                        onChange={(e) => handleInputChange('matricola', e.target.value)}
                        placeholder="Matricola"
                    />
                </Form.Item>
                <Form.Item label="Nome" name="nome">
                    <Input
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Nome"
                    />
                </Form.Item>
                <Form.Item label="Cognome" name="cognome">
                    <Input
                        value={formData.cognome}
                        onChange={(e) => handleInputChange('cognome', e.target.value)}
                        placeholder="Cognome"
                    />
                </Form.Item>
                <Form.Item label="Data di Nascita" name="dataNascita">
                    <DatePicker
                        value={formData.dataNascita ? dayjs(formData.dataNascita) : null}
                        onChange={(date) => handleInputChange('dataNascita', date ? date.format('YYYY-MM-DD') : '')}
                        placeholder="Seleziona data"
                    />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Inserisci la tua email' }]}
                >
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                    />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Inserisci la password' }]}
                >
                    <Input.Password
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item label="Ruolo" name="ruolo">
                    <Select
                        value={formData.ruolo}
                        onChange={(value) => handleInputChange('ruolo', value)}
                        placeholder="Seleziona ruolo"
                    >
                        <Option value="dipendente">Dipendente</Option>
                        <Option value="amministratore">Amministratore</Option>
                        <Option value="supervisore">Supervisore</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Data di Assunzione" name="dataAssunzione">
                    <DatePicker
                        value={formData.dataAssunzione ? dayjs(formData.dataAssunzione) : null}
                        onChange={(date) => handleInputChange('dataAssunzione', date ? date.format('YYYY-MM-DD') : '')}
                        placeholder="Seleziona data"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Registrati
                    </Button>
                </Form.Item>
            </Form>
            {user && (
                <div>
                    <p>Registrazione completata per {user.nome} {user.cognome}!</p>
                </div>
            )}
        </div>
    );
}