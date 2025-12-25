'use client';

import { Card, Input, Button, Avatar, Space, Spin, Typography } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, SafetyOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import { useChatbot, type Message } from '@/hook/chatbotHook';

const { Text } = Typography;

export default function ChatPage() {
    //richiamo l'hook
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChatbot();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    //view
    return (
        <div style={{
            height: 'calc(100vh - 250px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: '12px',
            padding: '16px',
            overflow: 'hidden',
        }}>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <SafetyOutlined style={{ fontSize: '24px', color: '#fff' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#001529' }}>
                                Assistente WorkSafe
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Esperto in Sicurezza sul Lavoro
                            </Text>
                        </div>
                    </div>
                }
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    border: 'none',
                    overflow: 'hidden',
                }}
                bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    marginBottom: '20px',
                    paddingRight: '8px',
                    minHeight: 0,
                }}>
                    {messages.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            borderRadius: '16px',
                            marginTop: '20px',
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                            }}>
                                <RobotOutlined style={{ fontSize: '40px', color: '#fff' }} />
                            </div>
                            <h3 style={{ color: '#001529', marginBottom: '12px', fontSize: '20px' }}>
                                Ciao! Sono il tuo Assistente WorkSafe
                            </h3>
                            <p style={{ color: '#595959', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
                                Posso aiutarti con domande su normative, procedure di sicurezza,
                                DPI, gestione emergenze e utilizzo delle risorse WorkSafe.
                            </p>
                            <div style={{
                                marginTop: '24px',
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                            }}>
                                <div style={{
                                    background: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#595959',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}>
                                    📋 Normative
                                </div>
                                <div style={{
                                    background: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#595959',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}>
                                    🛡️ DPI
                                </div>
                                <div style={{
                                    background: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#595959',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}>
                                    🚨 Emergenze
                                </div>
                                <div style={{
                                    background: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#595959',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}>
                                    📚 Formazione
                                </div>
                            </div>
                        </div>
                    )}

                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                        {messages.map((m: Message) => (
                            <div
                                key={m.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    animation: 'fadeIn 0.3s ease-in',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        display: 'flex',
                                        gap: '10px',
                                        alignItems: 'flex-start',
                                        flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Avatar
                                        icon={m.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                        size={40}
                                        style={{
                                            background: m.role === 'user'
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                            flexShrink: 0,
                                            boxShadow: m.role === 'user'
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 4px 12px rgba(56, 239, 125, 0.3)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            padding: '14px 18px',
                                            borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: m.role === 'user'
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : '#fff',
                                            color: m.role === 'user' ? '#fff' : '#000',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            fontSize: '15px',
                                            lineHeight: '1.6',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            overflowWrap: 'break-word',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Space>

                    {isLoading && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: '16px',
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                            }}>
                                <Avatar
                                    icon={<RobotOutlined />}
                                    size={40}
                                    style={{
                                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                        boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)',
                                    }}
                                />
                                <div style={{
                                    background: '#fff',
                                    padding: '14px 18px',
                                    borderRadius: '18px 18px 18px 4px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                }}>
                                    <Spin size="small" />
                                    <span style={{ marginLeft: '12px', color: '#595959' }}>
                                        Sto pensando...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe220 100%)',
                    borderRadius: '12px',
                }}>
                    <Input
                        size="large"
                        value={input}
                        placeholder="Scrivi la tua domanda sulla sicurezza..."
                        onChange={handleInputChange}
                        disabled={isLoading}
                        onPressEnter={(e) => {
                            e.preventDefault();
                            handleSubmit(e as any);
                        }}
                        style={{
                            borderRadius: '10px',
                            border: '2px solid #e8e8e8',
                            fontSize: '15px',
                        }}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        htmlType="submit"
                        disabled={isLoading || !input.trim()}
                        loading={isLoading}
                        style={{
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            fontWeight: '500',
                            minWidth: '100px',
                        }}
                    >
                        Invia
                    </Button>
                </form>
            </Card>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}