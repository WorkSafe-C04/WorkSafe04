'use client';

import { useState } from 'react';
import { useLogin } from '@/hook/loginHook';
import { message } from 'antd';
import { SafetyOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { login, loading, error } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            message.error('Errore: inserisci email');
            return;
        }
        if (!password) {
            message.error('Errore: inserisci password');
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
        } catch (err: any) {
            const errorMessage = err?.message || error || 'Credenziali non valide';
            message.error(errorMessage);
            console.error('Errore login:', err);
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
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                if (!value) {
                                    setEmailError('Email richiesta');
                                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                    setEmailError('Inserisci un indirizzo email valido');
                                } else {
                                    setEmailError('');
                                }
                            }}
                            placeholder="email@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                border: `2px solid ${emailError ? '#ff4d4f' : '#e0e0e0'}`,
                                borderRadius: '8px',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            onFocus={(e) => e.target.style.borderColor = emailError ? '#ff4d4f' : '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = emailError ? '#ff4d4f' : '#e0e0e0'}
                        />
                        <style jsx>{`
                            input::placeholder {
                                color: #999 !important;
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                    {emailError && <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px', marginBottom: '0' }}>{emailError}</p>}
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
                            onChange={(e) => {
                                const value = e.target.value;
                                setPassword(value);
                                if (!value) {
                                    setPasswordError('Password richiesta');
                                } else {
                                    setPasswordError('');
                                }
                            }}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                border: `2px solid ${passwordError ? '#ff4d4f' : '#e0e0e0'}`,
                                borderRadius: '8px',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            onFocus={(e) => e.target.style.borderColor = passwordError ? '#ff4d4f' : '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = passwordError ? '#ff4d4f' : '#e0e0e0'}
                        />
                        <style jsx>{`
                            input::placeholder {
                                color: #999 !important;
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                    {passwordError && <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px', marginBottom: '0' }}>{passwordError}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading || !!emailError || !!passwordError || !email || !password}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: (loading || emailError || passwordError || !email || !password) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: (loading || emailError || passwordError || !email || !password) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: (loading || emailError || passwordError || !email || !password) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
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

            {error && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '8px',
                    color: '#cf1322',
                    fontSize: '14px',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}

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