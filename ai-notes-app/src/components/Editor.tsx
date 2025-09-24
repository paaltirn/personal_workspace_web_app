'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2 } from 'lucide-react';
import { Note, Settings } from '@/types/note';
import ReactMarkdown from 'react-markdown';
import PolishModal from './PolishModal';

interface EditorProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
  settings: Settings;
}

export default function Editor({ note, onUpdateNote, settings }: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(', '));
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [polishedContent, setPolishedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  const debouncedTags = useDebounce(tags, 500);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(', '));
    }
  }, [note]);

  useEffect(() => {
    if (note && (debouncedTitle !== note.title || debouncedContent !== note.content || debouncedTags !== note.tags.join(', '))) {
      const newTags = debouncedTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      onUpdateNote({
        ...note,
        title: debouncedTitle,
        content: debouncedContent,
        tags: newTags
      });
      
      // 自动生成标签：当内容发生变化且有API密钥时
      if (debouncedContent !== note.content && debouncedContent.trim() && settings.openRouterApiKey && !isGenerating) {
        handleAutoGenerateTags(debouncedContent);
      }
    }
  }, [debouncedTitle, debouncedContent, debouncedTags, note, onUpdateNote, settings.openRouterApiKey, isGenerating]);

  const handleGenerateTitle = async () => {
    if (!settings.openRouterApiKey || !content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: `根据以下内容生成一个简洁的标题（不超过20字）：\n\n${content}`
            }
          ],
          max_tokens: 50
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        setTitle(data.choices[0].message.content.trim());
      }
    } catch (error) {
      console.error('生成标题失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!settings.openRouterApiKey || !content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: `根据以下内容提取3-5个关键词作为标签，用逗号分隔：\n\n${content}`
            }
          ],
          max_tokens: 50
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        const newTags = data.choices[0].message.content.trim().split(',').map((tag: string) => tag.trim());
        setTags(newTags.join(', '));
      }
    } catch (error) {
      console.error('生成标签失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoGenerateTags = async (contentText: string) => {
    if (!settings.openRouterApiKey || !contentText.trim() || tags.trim()) return;
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: `根据以下内容提取3-5个关键词作为标签，用逗号分隔：\n\n${contentText}`
            }
          ],
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        const newTags = data.choices[0].message.content.trim().split(',').map((tag: string) => tag.trim());
        setTags(newTags.join(', '));
      }
    } catch (error) {
      console.error('自动生成标签失败:', error);
    }
  };

  const handlePolishContent = async () => {
    if (!settings.openRouterApiKey || !content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: `请优化以下内容，保持原意但使表达更清晰、流畅：\n\n${content}`
            }
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        setPolishedContent(data.choices[0].message.content.trim());
        setShowPolishModal(true);
      }
    } catch (error) {
      console.error('优化内容失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPolish = (newContent: string) => {
    setContent(newContent);
    setShowPolishModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="笔记标题"
            className="text-lg font-semibold border-none shadow-none focus:ring-0 p-0"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateTitle}
            disabled={!settings.openRouterApiKey || !content.trim() || isGenerating}
            variant="outline"
            size="sm"
            className="rounded-lg border border-border hover:bg-secondary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            生成标题
          </Button>
          
          <Button
            onClick={handleGenerateTags}
            disabled={!settings.openRouterApiKey || !content.trim() || isGenerating}
            variant="outline"
            size="sm"
            className="rounded-lg border border-border hover:bg-secondary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            生成标签
          </Button>
          
          <Button
            onClick={handlePolishContent}
            disabled={!settings.openRouterApiKey || !content.trim() || isGenerating}
            variant="outline"
            size="sm"
            className="rounded-lg border border-border hover:bg-secondary"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            优化内容
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <Textarea
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，用逗号分隔"
            className="min-h-10 resize-none rounded-lg border border-border bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 h-full"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">编辑</h3>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作..."
              className="flex-1 resize-none rounded-lg border border-border bg-background font-mono text-sm leading-relaxed"
            />
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">预览</h3>
            <div className="flex-1 p-4 border rounded-lg bg-secondary/50 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PolishModal
        open={showPolishModal}
        onOpenChange={setShowPolishModal}
        originalContent={content}
        polishedContent={polishedContent}
        onApply={handleApplyPolish}
      />
    </div>
  );
}