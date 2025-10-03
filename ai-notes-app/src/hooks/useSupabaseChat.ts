'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage } from '@/types/note';
import { chatApi } from '@/lib/supabase-api';
import { supabase } from '@/lib/supabase';

export function useSupabaseChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      setError('加载对话会话失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
    try {
      setError(null);
      const data = await chatApi.createSession(session);
      
      if (!data) {
        throw new Error('创建对话会话失败');
      }
      
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to create chat session:', err);
      setError('创建对话会话失败');
      throw err;
    }
  }, []);

  const addMessage = useCallback(async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const data = await chatApi.addMessage(sessionId, message);
      
      if (!data) {
        throw new Error('添加消息失败');
      }
      
      // 更新本地会话数据
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, data],
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      }));
      
      return data;
    } catch (err) {
      console.error('Failed to add message:', err);
      setError('添加消息失败');
      throw err;
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<ChatSession>) => {
    try {
      setError(null);
      
      // 更新本地状态
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return { ...session, ...updates };
        }
        return session;
      }));
      
      // 如果有新消息，需要保存到数据库
      if (updates.messages) {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          const existingMessageIds = new Set(session.messages.map(m => m.id));
          const newMessages = updates.messages.filter(m => !existingMessageIds.has(m.id));
          
          // 保存新消息到数据库
          for (const message of newMessages) {
            await chatApi.addMessage(sessionId, {
              role: message.role,
              content: message.content,
              model: message.model
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('更新会话失败');
      throw err;
    }
  }, [sessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      const success = await chatApi.deleteSession(sessionId);
      
      if (!success) {
        throw new Error('删除对话会话失败');
      }
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('删除对话会话失败');
      throw err;
    }
  }, []);

  // 设置实时监听
  useEffect(() => {
    loadSessions();

    // 监听会话变化
    const sessionsChannel = supabase
      .channel('chat_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          console.log('Chat session change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSession = payload.new as {
              id: string;
              title: string;
              model: string;
              created_at: string;
              updated_at: string;
            };
            const session: ChatSession = {
              id: newSession.id,
              title: newSession.title,
              messages: [],
              model: newSession.model,
              createdAt: newSession.created_at,
              updatedAt: newSession.updated_at
            };
            setSessions(prev => {
              if (prev.some(s => s.id === session.id)) return prev;
              return [session, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedSession = payload.new as {
              id: string;
              title: string;
              model: string;
              updated_at: string;
            };
            setSessions(prev => prev.map(s => 
              s.id === updatedSession.id 
                ? { ...s, title: updatedSession.title, model: updatedSession.model, updatedAt: updatedSession.updated_at }
                : s
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedSession = payload.old as {
              id: string;
            };
            setSessions(prev => prev.filter(s => s.id !== deletedSession.id));
          }
        }
      )
      .subscribe();

    // 监听消息变化
    const messagesChannel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('Chat message change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as {
               id: string;
               role: 'user' | 'assistant';
               content: string;
               timestamp: string;
               model: string;
               session_id: string;
             };
            const message: ChatMessage = {
              id: newMessage.id,
              role: newMessage.role,
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              model: newMessage.model
            };
            setSessions(prev => prev.map(session => {
              if (session.id === newMessage.session_id) {
                const messageExists = session.messages.some(m => m.id === message.id);
                if (!messageExists) {
                  return {
                    ...session,
                    messages: [...session.messages, message].sort((a, b) => 
                      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    )
                  };
                }
              }
              return session;
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as {
              id: string;
            };
            setSessions(prev => prev.map(session => ({
              ...session,
              messages: session.messages.filter(m => m.id !== deletedMessage.id)
            })));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    createSession,
    addMessage,
    updateSession,
    deleteSession,
    refetch: loadSessions
  };
}