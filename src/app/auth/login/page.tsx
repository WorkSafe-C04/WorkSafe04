'use client';

import { useState } from 'react';
import { useLogin } from '@/hook/loginHook';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, user } = useLogin();
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            await login(email, password);
            message.success('Login riuscito!');
            // Redirect to home or dashboard
            router.push('/home');
        } catch (err) {
            message.error(error || 'Errore durante il login');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <h2>Login</h2>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Inserisci la tua email' }]}
                >
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                    />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Inserisci la password' }]}
                >
                    <Input.Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Accedi
                    </Button>
                </Form.Item>
            </Form>
            {user && (
                <div>
                    <p>Benvenuto, {user.nome} {user.cognome}!</p>
                </div>
            )}
        </div>
    );
}