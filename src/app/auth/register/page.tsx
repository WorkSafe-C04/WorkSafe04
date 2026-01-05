'use client';

import { useState } from 'react';
import { useRegister } from '@/hook/registerHook';
import { message } from 'antd';
import { SafetyOutlined, UserOutlined, MailOutlined, LockOutlined, IdcardOutlined, CalendarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Role } from '@/model/role';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        matricola: '',
        nome: '',
        cognome: '',
        dataNascita: '',
        email: '',
        password: '',
        ruolo: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const { register, loading } = useRegister();
    const router = useRouter();

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'La password deve essere lunga almeno 8 caratteri.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La password deve contenere almeno una lettera maiuscola.';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'La password deve contenere almeno un carattere speciale.';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.matricola || !formData.dataNascita || !formData.email || !formData.password || !formData.ruolo) {
            message.error('Compila i campi obbligatori');
            return;
        }

        // Controllo formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            message.error('Inserisci un indirizzo email valido');
            return;
        }

        // Controllo data di nascita (non oggi o futura)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Azzera ore per confronto solo date
        const birthDate = new Date(formData.dataNascita);
        if (birthDate >= today) {
            message.error('La data di nascita deve essere precedente a oggi');
            return;
        }

        // Controllo password
        const passwordValidation = validatePassword(formData.password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        } else {
            setPasswordError('');
        }

        try {
            await register(formData);
            message.success('Registrazione riuscita!');
            router.push('/auth/login');
        } catch (err : any) {
            message.error(err.response?.data?.message || err.response?.data?.error || 'Errore durante la registrazione');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px 12px 44px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px',
        transition: 'all 0.3s',
        outline: 'none',
        boxSizing: 'border-box' as const,
        color: '#333',
    };

    return (
        <>
            <style jsx>{`
            input::placeholder,
            select option:first-child {
                color: #999 !important;
                opacity: 1;
            }
            input, select {
                color: #333 !important;
            }
        `}</style>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                width: '100%',
                maxWidth: '540px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <SafetyOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                        Crea Account
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                        Registrati per accedere a WorkSafe
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Matricola *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <IdcardOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formData.matricola}
                                onChange={(e) => handleInputChange('matricola', e.target.value)}
                                placeholder="Matricola"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                                Nome
                            </label>
                            <div style={{ position: 'relative' }}>
                                <UserOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => handleInputChange('nome', e.target.value)}
                                    placeholder="Nome"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                                Cognome
                            </label>
                            <input
                                type="text"
                                value={formData.cognome}
                                onChange={(e) => handleInputChange('cognome', e.target.value)}
                                placeholder="Cognome"
                                style={{
                                    ...inputStyle,
                                    paddingLeft: '16px',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Data di nascita *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <CalendarOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="date"
                                value={formData.dataNascita}
                                onChange={(e) => handleInputChange('dataNascita', e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Email *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <MailOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="email@example.com"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <LockOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        {passwordError && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{passwordError}</p>}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Ruolo *
                        </label>
                        <select
                            value={formData.ruolo}
                            onChange={(e) => handleInputChange('ruolo', e.target.value)}
                            style={{
                                ...inputStyle,
                                paddingLeft: '16px',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        >
                            <option value="">Seleziona ruolo</option>
                            <option value={Role.DIPENDENTE}>{Role.DIPENDENTE}</option>
                            <option value={Role.DATORE_LAVORO}>{Role.DATORE_LAVORO}</option>
                            <option value={Role.MANUTENTORE}>{Role.MANUTENTORE}</option>
                            <option value={Role.RESPONSABILE_SICUREZZA}>{Role.RESPONSABILE_SICUREZZA}</option>
                        </select>
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
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        Hai già un account?{' '}
                        <Link href="/auth/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                            Accedi
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}