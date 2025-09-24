'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Note, Settings, ChatSession, PromptTemplate } from '@/types/note';
import { defaultPromptTemplates } from '@/data/defaultPrompts';
import ModernSidebar from './ModernSidebar';
import NoteList from './NoteList';
import Editor from './Editor';
import SettingsPage from './Settings';
import Stats from './Stats';
import TodoList from './TodoList';
import ChatInterface from './ChatInterface';
import ChatList from './ChatList';
import PomodoroTimer from './PomodoroTimer';
import ProjectManager from './ProjectManager';
import ParticlesBackground from './ParticlesBackground';
import GlowingBorder from './GlowingBorder';
import WelcomeScreen from './WelcomeScreen';


export default function AppLayout() {
  const [notes, setNotes, notesInitialized] = useLocalStorage<Note[]>('notes', []);
  const [settings, setSettings, settingsInitialized] = useLocalStorage<Settings>('settings', {
    openRouterApiKey: '',
    aiModel: 'deepseek/deepseek-chat-v3.1'
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useLocalStorage<'notes' | 'todos' | 'chat' | 'stats' | 'settings' | 'pomodoro' | 'projects'>('currentView', 'notes');
  const [chatSessions, setChatSessions, chatSessionsInitialized] = useLocalStorage<ChatSession[]>('chatSessions', []);
  const [promptTemplates, setPromptTemplates, promptTemplatesInitialized] = useLocalStorage<PromptTemplate[]>('promptTemplates', []);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (promptTemplates.length === 0) {
      setPromptTemplates(defaultPromptTemplates);
    }
  }, [promptTemplates.length, setPromptTemplates]);

  // 检查应用数据是否已加载完成
  useEffect(() => {
    if (notesInitialized && settingsInitialized && chatSessionsInitialized && promptTemplatesInitialized) {
      setIsAppReady(true);
    }
  }, [notesInitialized, settingsInitialized, chatSessionsInitialized, promptTemplatesInitialized]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const selectedNote = notes.find(note => note.id === selectedNoteId);
  const selectedChatSession = chatSessions.find(session => session.id === selectedChatSessionId);

  const handleAddNote = useCallback(() => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '新笔记',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
  }, [setNotes]);

  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: updatedNote.updatedAt || new Date().toISOString() }
        : note
    ));
  }, [setNotes]);

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  }, [setNotes, selectedNoteId]);

  const handleAddChatSession = useCallback(() => {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: '新对话',
      messages: [],
      model: settings.aiModel,
      createdAt: now,
      updatedAt: now
    };
    setChatSessions(prev => [newSession, ...prev]);
    setSelectedChatSessionId(newSession.id);
  }, [settings.aiModel, setChatSessions]);

  const handleUpdateChatSession = useCallback((updatedSession: ChatSession) => {
    setChatSessions(prev => prev.map(session =>
      session.id === updatedSession.id
        ? { ...updatedSession, updatedAt: new Date().toISOString() }
        : session
    ));
  }, [setChatSessions]);

  const handleDeleteChatSession = useCallback((sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (selectedChatSessionId === sessionId) {
      setSelectedChatSessionId(null);
    }
  }, [setChatSessions, selectedChatSessionId]);

  // 如果应用未准备好或需要显示欢迎屏幕，则显示欢迎屏幕
  if (!isAppReady || showWelcome) {
    return (
      <div className="flex min-h-screen w-screen bg-background font-sans m-0 p-0 relative">
        <ParticlesBackground className="absolute inset-0 z-0" />
        {isAppReady && showWelcome && (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen bg-background font-sans m-0 p-0 relative">
      <ParticlesBackground className="absolute inset-0 z-0" />
      <div className="relative z-20">
        <ModernSidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>
      
      {currentView === 'notes' ? (
        <>
          <div className="w-80 border-r border-border relative z-20 p-4">
            <GlowingBorder className="h-full">
              <NoteList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={setSelectedNoteId}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </GlowingBorder>
          </div>
          
          <div className="flex-1 relative z-20 p-4">
            <GlowingBorder className="h-full" glow={!!selectedNote}>
              {selectedNote ? (
                <Editor
                  note={selectedNote}
                  onUpdateNote={handleUpdateNote}
                  settings={settings}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg mb-2">选择一个笔记开始编辑</p>
                    <p className="text-sm">或创建一个新笔记</p>
                  </div>
                </div>
              )}
            </GlowingBorder>
          </div>
        </>
      ) : currentView === 'chat' ? (
        <>
          <div className="w-80 border-r border-border relative z-20 p-4">
            <GlowingBorder className="h-full">
              <ChatList
                sessions={chatSessions}
                selectedSessionId={selectedChatSessionId}
                onSelectSession={setSelectedChatSessionId}
                onAddSession={handleAddChatSession}
                onDeleteSession={handleDeleteChatSession}
              />
            </GlowingBorder>
          </div>
          
          <div className="flex-1 relative z-20 p-4">
            <GlowingBorder className="h-full" glow={!!selectedChatSession}>
              {selectedChatSession ? (
                <ChatInterface
                  session={selectedChatSession}
                  onUpdateSession={handleUpdateChatSession}
                  settings={settings}
                  promptTemplates={promptTemplates}
                  onUpdatePromptTemplates={setPromptTemplates}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg mb-2">选择一个对话开始聊天</p>
                    <p className="text-sm">或创建一个新对话</p>
                  </div>
                </div>
              )}
            </GlowingBorder>
          </div>
        </>
      ) : currentView === 'todos' ? (
        <div className="flex-1 relative z-20 p-4">
          <GlowingBorder className="h-full" glow={true}>
            <TodoList />
          </GlowingBorder>
        </div>
      ) : currentView === 'projects' ? (
        <div className="flex-1 relative z-20 p-4">
          <GlowingBorder className="h-full" glow={true}>
            <ProjectManager />
          </GlowingBorder>
        </div>
      ) : currentView === 'stats' ? (
        <div className="flex-1 relative z-20 p-4">
          <GlowingBorder className="h-full" glow={true}>
            <Stats notes={notes} />
          </GlowingBorder>
        </div>
      ) : currentView === 'pomodoro' ? (
        <div className="flex-1 relative z-20 p-4">
          <GlowingBorder className="h-full" glow={true}>
            <PomodoroTimer />
          </GlowingBorder>
        </div>
      ) : (
        <div className="flex-1 relative z-20 p-4">
          <GlowingBorder className="h-full" glow={true}>
            <SettingsPage
              settings={settings}
              onUpdateSettings={setSettings}
            />
          </GlowingBorder>
        </div>
      )}
    </div>
  );
}