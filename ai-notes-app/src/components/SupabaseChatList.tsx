'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/types/note';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';

interface SupabaseChatListProps {
  onSelectSession: (session: ChatSession) => void;
  selectedSessionId?: string;
}

export default function SupabaseChatList({ onSelectSession, selectedSessionId }: SupabaseChatListProps) {
  const { sessions, loading, createSession, deleteSession } = useSupabaseChat();
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;
    
    setIsCreating(true);
    try {
      const session = await createSession({
        title: newSessionTitle.trim(),
        model: 'gpt-3.5-turbo'
      });
      if (session) {
        onSelectSession(session);
        setNewSessionTitle('');
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对话吗？')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('删除会话失败:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-CN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 创建新对话 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="输入对话标题..."
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
            className="flex-1"
          />
          <Button 
            onClick={handleCreateSession}
            disabled={!newSessionTitle.trim() || isCreating}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 对话列表 */}
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>还没有对话</p>
            <p className="text-sm">创建一个新对话开始聊天吧</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors group ${
                selectedSessionId === session.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onSelectSession(session)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(session.updatedAt)}</span>
                    {session.messages && session.messages.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{session.messages.length} 条消息</span>
                      </>
                    )}
                  </div>
                  {session.messages && session.messages.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {session.messages[session.messages.length - 1]?.content.substring(0, 50)}
                      {session.messages[session.messages.length - 1]?.content.length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}