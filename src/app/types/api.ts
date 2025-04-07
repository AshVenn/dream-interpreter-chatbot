export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
  }
  
  export interface APIResponse {
    message: ChatMessage;
    sources: string[];
    progress?: number;
  }