'use client';

import { useState, useEffect } from 'react';
import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Note, Settings, ChatSession, PromptTemplate } from '@/types/note';
import ModernSidebar from './ModernSidebar';
import SupabaseNoteList from './SupabaseNoteList';
import SupabaseEditor from './SupabaseEditor';
import TodoList from './TodoList';
import SupabaseTodoList from './SupabaseTodoList';
import SupabaseProjectManager from './SupabaseProjectManager';
import ChatInterface from './ChatInterface';
import SupabaseChatApp from './SupabaseChatApp';
import PomodoroTimer from './PomodoroTimer';
import Stats from './Stats';
import GlobalErrorProvider from './GlobalErrorProvider';

export default function SupabaseAppLayout() {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // 使用 Supabase 管理笔记
  const { 
    notes, 
    isLoading: notesLoading, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite,
    getNoteById 
  } = useSupabaseNotes();

  // 其他数据仍使用 localStorage（后续会迁移）
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    openRouterApiKey: '',
    aiModel: 'anthropic/claude-3.5-sonnet'
  });

  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>('chatSessions', []);
  const [promptTemplates, setPromptTemplates] = useLocalStorage<PromptTemplate[]>('promptTemplates', []);

  // 获取当前选中的笔记
  const selectedNote = selectedNoteId ? getNoteById(selectedNoteId) : null;

  // 自动选择第一个笔记
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  // 创建新笔记
  const handleCreateNote = async () => {
    console.log('开始创建新笔记...');
    try {
      const newNote = await addNote();
      console.log('创建笔记结果:', newNote);
      if (newNote) {
        setSelectedNoteId(newNote.id);
        console.log('设置选中笔记ID:', newNote.id);
      } else {
        console.error('创建笔记失败: addNote 返回 null');
      }
    } catch (error) {
      console.error('创建笔记时发生错误:', error);
    }
  };

  // 选择笔记
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  // 更新笔记
  const handleUpdateNote = async (updatedNote: Note): Promise<boolean> => {
    const success = await updateNote(updatedNote);
    return success;
  };

  // 删除笔记
  const handleDeleteNote = async (noteId: string) => {
    const success = await deleteNote(noteId);
    if (success && selectedNoteId === noteId) {
      // 如果删除的是当前选中的笔记，选择下一个笔记
      const remainingNotes = notes.filter(note => note.id !== noteId);
      setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };

  // 切换收藏状态
  const handleToggleFavorite = async (noteId: string) => {
    await toggleFavorite(noteId);
  };

  // 聊天会话管理
  const handleCreateChatSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      model: settings.aiModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChatSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const handleUpdateChatSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updatedAt: new Date().toISOString() }
          : session
      )
    );
  };

  const handleDeleteChatSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="flex h-full">
            <div className="w-80 border-r border-border">
              <SupabaseNoteList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                isLoading={notesLoading}
              />
            </div>
            <div className="flex-1">
              {selectedNote ? (
                <SupabaseEditor
                  note={selectedNote}
                  onUpdateNote={handleUpdateNote}
                  settings={settings}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {notesLoading ? '加载中...' : '选择一个笔记开始编辑'}
                </div>
              )}
            </div>
          </div>
        );

      case 'todos':
        return <SupabaseTodoList />;

      case 'projects':
        return <SupabaseProjectManager />;

      case 'chat':
        return <SupabaseChatApp />;

      case 'pomodoro':
        return <PomodoroTimer />;

      case 'prompts':
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            提示词管理功能开发中...
          </div>
        );

      case 'stats':
        return (
          <Stats
            notes={notes}
          />
        );

      case 'settings':
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            设置功能开发中...
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GlobalErrorProvider>
      <div className="flex h-screen bg-background">
        <ModernSidebar 
          currentView={activeTab} 
          onViewChange={setActiveTab}
        />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </GlobalErrorProvider>
  );
}