'use client';

import { useState } from 'react';
import { useLogin } from '@/hook/loginHook';
import { message } from 'antd';
import { SafetyOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            message.error('Inserisci email e password');
            return;
        }
        try {
            const userData = await login(email, password);
            // Salva i dati dell'utente nel localStorage
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
            message.success('Login riuscito!');
            window.location.href = '/home';
        } catch (err) {
            message.error('Credenziali non valide');
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <SafetyOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                    WorkSafe
                </h1>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    Sistema di Gestione Sicurezza sul Lavoro
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                        Email
                    </label>
                    <div style={{ position: 'relative' }}>
                        <MailOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        <style jsx>{`
                            input::placeholder {
                                color: #999 !important;
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <LockOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        <style jsx>{`
                            input::placeholder {
                                color: #999 !important;
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }
                    }}
                >
                    {loading ? 'Accesso in corso...' : 'Accedi'}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Non hai un account?{' '}
                    <Link href="/auth/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    );
}