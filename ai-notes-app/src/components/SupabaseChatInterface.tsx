'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChatSession, ChatMessage, PromptTemplate } from '@/types/note';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import PromptTemplateManager from './PromptTemplateManager';
import Typewriter from './Typewriter';

interface Settings {
  openRouterApiKey: string;
  aiModel: string;
}

interface SupabaseChatInterfaceProps {
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  settings: Settings;
  promptTemplates: PromptTemplate[];
  onUpdatePromptTemplates: (templates: PromptTemplate[]) => void;
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro Preview' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
];

export default function SupabaseChatInterface({
  session,
  onUpdateSession,
  settings,
  promptTemplates,
  onUpdatePromptTemplates
}: SupabaseChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage } = useSupabaseChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !settings.openRouterApiKey) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // 立即更新本地状态
    const updatedMessages = [...session.messages, userMessage];
    const updatedSession = {
      ...session,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    onUpdateSession(updatedSession);
    setInput('');
    setIsLoading(true);

    try {
      // 保存用户消息到数据库
      await addMessage(session.id, {
        role: userMessage.role,
        content: userMessage.content,
        model: userMessage.model
      });

      // 调用 AI API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Notes App',
        },
        body: JSON.stringify({
          model: session.model,
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
        model: session.model,
      };

      // 保存 AI 回复到数据库
      await addMessage(session.id, {
        role: assistantMessage.role,
        content: assistantMessage.content,
        model: assistantMessage.model
      });

      // 更新本地状态
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSession = {
        ...updatedSession,
        messages: finalMessages,
        title: finalMessages.length === 2 
          ? finalMessages[0].content.slice(0, 30) + (finalMessages[0].content.length > 30 ? '...' : '')
          : session.title,
      };

      onUpdateSession(finalSession);
    } catch (error) {
      console.error('聊天消息发送失败:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '抱歉，发送消息时出现了错误。请检查您的API密钥和网络连接。',
        timestamp: new Date().toISOString(),
      };

      // 保存错误消息到数据库
      try {
        await addMessage(session.id, {
          role: errorMessage.role,
          content: errorMessage.content,
          model: errorMessage.model
        });
      } catch (saveError) {
        console.error('Failed to save error message:', saveError);
      }

      onUpdateSession({
        ...updatedSession,
        messages: [...updatedMessages, errorMessage],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = (newModel: string) => {
    onUpdateSession({
      ...session,
      model: newModel,
    });
  };

  const insertPromptTemplate = (template: PromptTemplate) => {
    setInput(template.content);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={session.model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-48 rounded-lg border border-border">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPromptManager(true)}
              className="rounded-lg border border-border"
            >
              <Settings className="h-4 w-4 mr-2" />
              提示词模板
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {session.messages.length} 条消息
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg mb-2">开始对话</p>
              <p className="text-sm">输入消息开始与AI交流</p>
            </div>
          </div>
        ) : (
          session.messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  <div className="whitespace-pre-wrap">
                    {message.role === 'assistant' ? (
                      <Typewriter
                        text={message.content}
                        delay={30}
                        cursor={false}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-secondary-foreground/70'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                    {message.model && (
                      <span className="ml-2">• {AVAILABLE_MODELS.find(m => m.id === message.model)?.name || message.model}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-2 bg-secondary text-secondary-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={settings.openRouterApiKey ? "输入消息..." : "请先在设置中配置 OpenRouter API 密钥"}
              className="min-h-[60px] max-h-32 resize-none rounded-xl border border-border pr-12"
              disabled={!settings.openRouterApiKey || isLoading}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-muted"
                  disabled={!settings.openRouterApiKey || isLoading}
                >
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="end">
                <div className="space-y-1">
                  <div className="text-sm font-medium mb-2">快速插入提示词</div>
                  {promptTemplates.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      暂无提示词模板
                    </div>
                  ) : (
                    promptTemplates.slice(0, 5).map((template) => (
                      <Button
                        key={template.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => insertPromptTemplate(template)}
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {template.content.slice(0, 50)}...
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                  {promptTemplates.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowPromptManager(true)}
                    >
                      查看更多...
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || !settings.openRouterApiKey || isLoading}
            className="rounded-xl px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {showPromptManager && (
        <PromptTemplateManager
          open={showPromptManager}
          onOpenChange={setShowPromptManager}
          templates={promptTemplates}
          onUpdateTemplates={onUpdatePromptTemplates}
        />
      )}
    </div>
  );
}