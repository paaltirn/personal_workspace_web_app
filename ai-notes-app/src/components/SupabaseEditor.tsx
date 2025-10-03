'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Save, Loader2 } from 'lucide-react';
import { Note, Settings } from '@/types/note';
import ReactMarkdown from 'react-markdown';
import PolishModal from './PolishModal';

interface SupabaseEditorProps {
  note: Note;
  onUpdateNote: (note: Note) => Promise<boolean>;
  settings: Settings;
}

export default function SupabaseEditor({ note, onUpdateNote, settings }: SupabaseEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(', '));
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [polishedContent, setPolishedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTags = useDebounce(tags, 1000);

  // 同步 note 变化
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
  }, [note.id, note.title, note.content, note.tags]);

  // 自动保存
  useEffect(() => {
    const saveNote = async () => {
      if (!note.id) return;
      
      const updatedNote: Note = {
        ...note,
        title: debouncedTitle,
        content: debouncedContent,
        tags: debouncedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        updatedAt: new Date().toISOString()
      };

      // 检查是否有实际变化
      const hasChanges = 
        updatedNote.title !== note.title ||
        updatedNote.content !== note.content ||
        JSON.stringify(updatedNote.tags) !== JSON.stringify(note.tags);

      if (hasChanges) {
        setIsSaving(true);
        try {
          const success = await onUpdateNote(updatedNote);
          if (success) {
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('保存笔记失败:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveNote();
  }, [debouncedTitle, debouncedContent, debouncedTags, note, onUpdateNote]);

  const handleAutoGenerateTags = useCallback(async (contentText: string) => {
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
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedTags = data.choices[0]?.message?.content?.trim();
        if (generatedTags) {
          setTags(generatedTags);
        }
      }
    } catch (error) {
      console.error('生成标签失败:', error);
    }
  }, [settings.openRouterApiKey, settings.aiModel, tags]);

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
              content: `根据以下内容生成一个简洁的标题（不超过20个字）：\n\n${content}`
            }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedTitle = data.choices[0]?.message?.content?.trim();
        if (generatedTitle) {
          setTitle(generatedTitle.replace(/^["']|["']$/g, ''));
        }
      }
    } catch (error) {
      console.error('生成标题失败:', error);
    } finally {
      setIsGenerating(false);
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
              content: `请优化以下文本，使其更清晰、流畅、专业，但保持原意不变：\n\n${content}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const polished = data.choices[0]?.message?.content?.trim();
        if (polished) {
          setPolishedContent(polished);
          setShowPolishModal(true);
        }
      }
    } catch (error) {
      console.error('内容优化失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptPolish = (content: string) => {
    setContent(content);
    setShowPolishModal(false);
    setPolishedContent('');
  };

  const handleRejectPolish = () => {
    setShowPolishModal(false);
    setPolishedContent('');
  };

  // 自动生成标签
  useEffect(() => {
    if (debouncedContent && debouncedContent !== note.content) {
      handleAutoGenerateTags(debouncedContent);
    }
  }, [debouncedContent, note.content, handleAutoGenerateTags]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 flex">
        {/* 编辑区 */}
        <div className="flex-1 flex flex-col p-6 space-y-4">
          {/* 标题和操作按钮 */}
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="笔记标题..."
              className="flex-1 text-lg font-medium border-none shadow-none focus-visible:ring-0 px-0"
            />
            <div className="flex items-center gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {lastSaved && !isSaving && (
                <span className="text-xs text-muted-foreground">
                  已保存 {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleGenerateTitle}
                disabled={isGenerating || !content.trim()}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                生成标题
              </Button>
              <Button
                onClick={handlePolishContent}
                disabled={isGenerating || !content.trim()}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                优化内容
              </Button>
            </div>
          </div>

          {/* 标签 */}
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（用逗号分隔）..."
            className="border-none shadow-none focus-visible:ring-0 px-0 text-sm text-muted-foreground"
          />

          {/* 内容编辑器 */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作..."
            className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 px-0 text-base leading-relaxed"
          />
        </div>

        {/* 预览区 */}
        <div className="flex-1 border-l border-border p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content || '开始写作以查看预览...'}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 优化内容模态框 */}
      <PolishModal
        open={showPolishModal}
        onOpenChange={setShowPolishModal}
        originalContent={content}
        polishedContent={polishedContent}
        onApply={handleAcceptPolish}
      />
    </div>
  );
}