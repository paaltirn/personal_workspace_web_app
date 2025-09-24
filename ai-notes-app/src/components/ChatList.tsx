'use client';

import { useState } from 'react';
import { Plus, Trash2, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/types/note';

interface ChatListProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onAddSession: () => void;
  onDeleteSession: (id: string) => void;
}

export default function ChatList({
  sessions,
  selectedSessionId,
  onSelectSession,
  onAddSession,
  onDeleteSession
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3 bg-card">
        <Button
          onClick={onAddSession}
          className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          新对话
        </Button>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg border border-border bg-background"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>{searchQuery ? '没有找到匹配的对该' : '还没有对话'}</p>
            <p className="text-sm">{searchQuery ? '尝试其他关键词' : '点击上方按钮创建'}</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredSessions.map((session) => {
              const lastMessage = session.messages[session.messages.length - 1];
              return (
                <div
                  key={session.id}
                  className={`
                    relative group p-4 mb-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                    ${selectedSessionId === session.id 
                      ? 'bg-secondary shadow-sm border border-border' 
                      : 'hover:bg-secondary/50'
                    }
                  `}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm truncate">
                          {session.title || '新对话'}
                        </h3>
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {lastMessage.role === 'user' ? '你: ' : 'AI: '}
                          {lastMessage.content.slice(0, 50)}
                          {lastMessage.content.length > 50 && '...'}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} 条消息
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatLastMessageTime(session.updatedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}