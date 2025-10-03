'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, FileText, Calendar, Tag, Trash2, Star, StarOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';

interface SupabaseNoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onToggleFavorite: (noteId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function SupabaseNoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onToggleFavorite,
  isLoading = false
}: SupabaseNoteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  // 过滤和排序笔记
  const filteredAndSortedNotes = useMemo(() => {
    const filtered = notes.filter(note => {
      const searchLower = searchTerm.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [notes, searchTerm, sortBy]);

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
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPreviewText = (content: string, maxLength: number = 100) => {
    const text = content.replace(/[#*`\[\]]/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 头部 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            笔记
            <span className="text-sm text-muted-foreground font-normal">
              ({filteredAndSortedNotes.length})
            </span>
          </h2>
          <Button 
            onClick={onCreateNote} 
            size="sm"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            新建
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索笔记..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 排序选项 */}
        <div className="flex gap-1">
          <Button
            variant={sortBy === 'updated' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('updated')}
            className="text-xs"
          >
            最近修改
          </Button>
          <Button
            variant={sortBy === 'created' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('created')}
            className="text-xs"
          >
            创建时间
          </Button>
          <Button
            variant={sortBy === 'title' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('title')}
            className="text-xs"
          >
            标题
          </Button>
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            加载中...
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? '没有找到匹配的笔记' : '还没有笔记，点击新建开始写作'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredAndSortedNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50",
                  selectedNoteId === note.id && "bg-accent border border-accent-foreground/20"
                )}
                onClick={() => onSelectNote(note)}
              >
                {/* 标题和操作按钮 */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm line-clamp-1 flex-1 mr-2">
                    {note.title || '无标题'}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(note.id);
                      }}
                    >
                      {note.isFavorite ? (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这篇笔记吗？')) {
                          onDeleteNote(note.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* 内容预览 */}
                {note.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {getPreviewText(note.content)}
                  </p>
                )}

                {/* 标签 */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-1.5 py-0.5 h-auto"
                      >
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* 时间信息 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                  </div>
                  {note.isFavorite && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}