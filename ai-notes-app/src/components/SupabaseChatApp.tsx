'use client';

import { useState, useEffect } from 'react';
import { ChatSession, PromptTemplate } from '@/types/note';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SupabaseChatList from './SupabaseChatList';
import SupabaseChatInterface from './SupabaseChatInterface';

interface Settings {
  openRouterApiKey: string;
  aiModel: string;
}

export default function SupabaseChatApp() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [settings] = useLocalStorage<Settings>('ai-settings', {
    openRouterApiKey: '',
    aiModel: 'openai/gpt-4.1'
  });
  const [promptTemplates, setPromptTemplates] = useLocalStorage<PromptTemplate[]>('prompt-templates', []);

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleUpdateSession = (updatedSession: ChatSession) => {
    setSelectedSession(updatedSession);
  };

  const handleUpdatePromptTemplates = (templates: PromptTemplate[]) => {
    setPromptTemplates(templates);
  };

  return (
    <div className="flex h-full">
      {/* 左侧聊天列表 */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">AI 对话</h2>
        <SupabaseChatList
          onSelectSession={handleSelectSession}
          selectedSessionId={selectedSession?.id}
        />
      </div>

      {/* 右侧聊天界面 */}
      <div className="flex-1">
        {selectedSession ? (
          <SupabaseChatInterface
            session={selectedSession}
            onUpdateSession={handleUpdateSession}
            settings={settings}
            promptTemplates={promptTemplates}
            onUpdatePromptTemplates={handleUpdatePromptTemplates}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium mb-2">选择一个对话开始聊天</h3>
              <p className="text-sm">或者创建一个新的对话</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}