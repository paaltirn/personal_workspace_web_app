export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  openRouterApiKey: string;
  aiModel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}