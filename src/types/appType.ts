export interface ConversationProps {
    id: number;
    title: string;
    selectedModel: string;
    createdAt: string;
    updatedAt: string;
    providerId: number;
}

export interface ProviderProps {
    id: number;
    name: string;
    title?: string;
    desc?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    models: string[];
}


export type MessageStatus = 'pending' | 'streaming' | 'loading' | 'finished';
export interface MessageProps {
    id: number;
    content: string;
    type: 'question' | 'answer';
    conversationId: number;
    status?: MessageStatus;
    createdAt: string;
    updatedAt: string;
}