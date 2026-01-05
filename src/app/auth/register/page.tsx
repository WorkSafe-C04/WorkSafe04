'use client';

import { useState } from 'react';
import { useRegister } from '@/hook/registerHook';
import { message, Tabs } from 'antd';
import { SafetyOutlined, UserOutlined, MailOutlined, LockOutlined, IdcardOutlined, CalendarOutlined, BankOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Role } from '@/model/role';

export default function RegisterPage() {
    const [activeTab, setActiveTab] = useState('dipendente');
    
    // Form Dipendente
    const [formDataDipendente, setFormDataDipendente] = useState({
        matricola: '',
        nome: '',
        cognome: '',
        dataNascita: '',
        email: '',
        password: '',
        codiceAzienda: ''
    });
    
    // Form Azienda (Step 1)
    const [formDataAzienda, setFormDataAzienda] = useState({
        partitaIva: '',
        ragioneSociale: '',
        sede: '',
        recapito: ''
    });
    
    // Form Datore di Lavoro (Step 2)
    const [formDataDatore, setFormDataDatore] = useState({
        matricola: '',
        nome: '',
        cognome: '',
        dataNascita: '',
        email: '',
        password: ''
    });
    
    const [codiceAziendaGenerato, setCodiceAziendaGenerato] = useState('');
    const [stepAzienda, setStepAzienda] = useState(1); // 1 = Dati Azienda, 2 = Account Datore
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

    const generaCodiceAzienda = (partitaIva: string, ragioneSociale: string): string => {
        // Genera un codice azienda basato su partita IVA e ragione sociale
        const prefix = ragioneSociale.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const suffix = partitaIva.substring(0, 4);
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${suffix}${timestamp}`;
    };

    // Submit Registrazione Dipendente
    const handleSubmitDipendente = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDataDipendente.matricola || !formDataDipendente.dataNascita || !formDataDipendente.email || !formDataDipendente.password || !formDataDipendente.codiceAzienda) {
            message.error('Compila tutti i campi obbligatori');
            return;
        }

        // Controllo formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataDipendente.email)) {
            message.error('Inserisci un indirizzo email valido');
            return;
        }

        // Controllo data di nascita
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(formDataDipendente.dataNascita);
        if (birthDate >= today) {
            message.error('La data di nascita deve essere precedente a oggi');
            return;
        }

        // Controllo password
        const passwordValidation = validatePassword(formDataDipendente.password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        } else {
            setPasswordError('');
        }

        try {
            await register({ ...formDataDipendente, ruolo: Role.DIPENDENTE });
            message.success('Registrazione dipendente riuscita!');
            router.push('/auth/login');
        } catch (err: any) {
            message.error(err.response?.data?.message || err.response?.data?.error || 'Errore durante la registrazione');
        }
    };

    // Step 1: Dati Azienda
    const handleSubmitDatiAzienda = async (e: React.FormEvent) => {
        e.preventDefault();

        // Controlli specifici per Partita IVA
        if (!formDataAzienda.partitaIva || formDataAzienda.partitaIva.trim() === '') {
            message.error('Errore: La Partita IVA è obbligatoria');
            return;
        }
        if (formDataAzienda.partitaIva.length < 11) {
            message.error('Errore: La Partita IVA dell\'azienda è troppo corta');
            return;
        }
        if (formDataAzienda.partitaIva.length > 11) {
            message.error('Errore: La Partita IVA dell\'azienda è troppo lunga');
            return;
        }

        // Controlli specifici per Ragione Sociale
        if (!formDataAzienda.ragioneSociale || formDataAzienda.ragioneSociale.trim() === '') {
            message.error('Errore: La Ragione Sociale dell\'azienda è obbligatoria');
            return;
        }
        if (formDataAzienda.ragioneSociale.length > 64) {
            message.error('Errore: La Ragione Sociale dell\'azienda è troppo lunga');
            return;
        }

        // Controlli specifici per Sede
        if (!formDataAzienda.sede || formDataAzienda.sede.trim() === '') {
            message.error('Errore: La Sede dell\'azienda è obbligatoria');
            return;
        }
        if (formDataAzienda.sede.length > 60) {
            message.error('Errore: La Sede dell\'azienda è troppo lunga');
            return;
        }

        // Controlli specifici per Recapito
        if (!formDataAzienda.recapito || formDataAzienda.recapito.trim() === '') {
            message.error('Errore: Il Recapito è obbligatorio');
            return;
        }
        if (formDataAzienda.recapito.length < 10) {
            message.error('Errore: Il recapito è troppo corto');
            return;
        }
        if (formDataAzienda.recapito.length > 10) {
            message.error('Errore: Il recapito è troppo lungo');
            return;
        }

        // Genera il codice azienda
        const codiceGenerato = generaCodiceAzienda(formDataAzienda.partitaIva, formDataAzienda.ragioneSociale);
        setCodiceAziendaGenerato(codiceGenerato);
        
        message.success('Dati aziendali confermati! Ora crea l\'account del Datore di Lavoro');
        setStepAzienda(2);
    };

    // Step 2: Account Datore di Lavoro
    const handleSubmitDatoreLavoro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDataDatore.matricola || !formDataDatore.dataNascita || !formDataDatore.email || !formDataDatore.password) {
            message.error('Compila tutti i campi obbligatori');
            return;
        }

        // Controllo formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataDatore.email)) {
            message.error('Inserisci un indirizzo email valido');
            return;
        }

        // Controllo data di nascita
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(formDataDatore.dataNascita);
        if (birthDate >= today) {
            message.error('La data di nascita deve essere precedente a oggi');
            return;
        }

        // Controllo password
        const passwordValidation = validatePassword(formDataDatore.password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        } else {
            setPasswordError('');
        }

        try {
            
            const dataRegistrazione = {
                azienda: { ...formDataAzienda, codiceAzienda: codiceAziendaGenerato },
                utente: { ...formDataDatore, ruolo: Role.DATORE_LAVORO, codiceAzienda: codiceAziendaGenerato }
            };
            
            await register(dataRegistrazione);
            message.success('Azienda e account Datore di Lavoro creati con successo!');
            router.push('/auth/login');
        } catch (err: any) {
            message.error(err.response?.data?.message || err.response?.data?.error || 'Errore durante la registrazione');
        }
    };

    const handleInputChangeDipendente = (field: string, value: any) => {
        setFormDataDipendente(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChangeAzienda = (field: string, value: any) => {
        setFormDataAzienda(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChangeDatore = (field: string, value: any) => {
        setFormDataDatore(prev => ({ ...prev, [field]: value }));
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

    const tabItems = [
        {
            key: 'dipendente',
            label: 'Registrazione Dipendente',
            children: (
                <form onSubmit={handleSubmitDipendente}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Matricola *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <IdcardOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataDipendente.matricola}
                                onChange={(e) => handleInputChangeDipendente('matricola', e.target.value)}
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
                                    value={formDataDipendente.nome}
                                    onChange={(e) => handleInputChangeDipendente('nome', e.target.value)}
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
                                value={formDataDipendente.cognome}
                                onChange={(e) => handleInputChangeDipendente('cognome', e.target.value)}
                                placeholder="Cognome"
                                style={{ ...inputStyle, paddingLeft: '16px' }}
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
                                value={formDataDipendente.dataNascita}
                                onChange={(e) => handleInputChangeDipendente('dataNascita', e.target.value)}
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
                                value={formDataDipendente.email}
                                onChange={(e) => handleInputChangeDipendente('email', e.target.value)}
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
                                value={formDataDipendente.password}
                                onChange={(e) => handleInputChangeDipendente('password', e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        {activeTab === 'dipendente' && passwordError && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{passwordError}</p>}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Codice Azienda *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <BankOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataDipendente.codiceAzienda}
                                onChange={(e) => handleInputChangeDipendente('codiceAzienda', e.target.value)}
                                placeholder="Codice Azienda"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
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
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>
            )
        },
        {
            key: 'azienda',
            label: 'Registra Azienda',
            children: stepAzienda === 1 ? (
                <form onSubmit={handleSubmitDatiAzienda}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Partita IVA *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <IdcardOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataAzienda.partitaIva}
                                onChange={(e) => handleInputChangeAzienda('partitaIva', e.target.value)}
                                placeholder="Partita IVA"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Ragione Sociale *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <BankOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataAzienda.ragioneSociale}
                                onChange={(e) => handleInputChangeAzienda('ragioneSociale', e.target.value)}
                                placeholder="Ragione Sociale"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Sede *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <EnvironmentOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataAzienda.sede}
                                onChange={(e) => handleInputChangeAzienda('sede', e.target.value)}
                                placeholder="Sede"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Recapito *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <PhoneOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataAzienda.recapito}
                                onChange={(e) => handleInputChangeAzienda('recapito', e.target.value)}
                                placeholder="Recapito telefonico"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        Prosegui
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSubmitDatoreLavoro}>
                    <div style={{ marginBottom: '20px', padding: '12px', background: '#f0f5ff', borderRadius: '8px', border: '1px solid #d6e4ff' }}>
                        <p style={{ margin: 0, color: '#1890ff', fontSize: '14px', fontWeight: '500' }}>
                            📋 Codice Azienda generato: <strong>{codiceAziendaGenerato}</strong>
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Matricola *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <IdcardOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="text"
                                value={formDataDatore.matricola}
                                onChange={(e) => handleInputChangeDatore('matricola', e.target.value)}
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
                                    value={formDataDatore.nome}
                                    onChange={(e) => handleInputChangeDatore('nome', e.target.value)}
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
                                value={formDataDatore.cognome}
                                onChange={(e) => handleInputChangeDatore('cognome', e.target.value)}
                                placeholder="Cognome"
                                style={{ ...inputStyle, paddingLeft: '16px' }}
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
                                value={formDataDatore.dataNascita}
                                onChange={(e) => handleInputChangeDatore('dataNascita', e.target.value)}
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
                                value={formDataDatore.email}
                                onChange={(e) => handleInputChangeDatore('email', e.target.value)}
                                placeholder="email@example.com"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                            Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <LockOutlined style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px' }} />
                            <input
                                type="password"
                                value={formDataDatore.password}
                                onChange={(e) => handleInputChangeDatore('password', e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        {activeTab === 'azienda' && passwordError && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{passwordError}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setStepAzienda(1)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: '#f0f0f0',
                                color: '#333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                        >
                            Indietro
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 2,
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
                            {loading ? 'Registrazione in corso...' : 'Registra Azienda'}
                        </button>
                    </div>
                </form>
            )
        }
    ];

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

                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab} 
                    items={tabItems}
                    style={{ marginBottom: '24px' }}
                />

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