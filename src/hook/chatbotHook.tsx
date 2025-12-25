import { useChat } from 'ai/react';
import type { Message } from 'ai/react';
import { message as antMessage } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

export const useChatbot = () => {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chatbot',
        onError: (err) => {
            console.error('Chat error:', err);
            if (err.message.includes('429') || err.message.includes('sovraccarico')) {
                antMessage.warning({
                    content: 'Il servizio è momentaneamente sovraccarico. Attendi qualche secondo e riprova.',
                    duration: 5,
                    icon: <WarningOutlined style={{ color: '#faad14' }} />,
                });
            } else {
                antMessage.error({
                    content: 'Si è verificato un errore. Riprova più tardi.',
                    duration: 4,
                });
            }
        },
    });

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
    };
};

export type { Message };
