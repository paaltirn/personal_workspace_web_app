'use client';

import { useState } from 'react';
import { Plus, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Todo } from '@/types/todo';

interface AddTodoFormProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function AddTodoForm({ onAddTodo }: AddTodoFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    onAddTodo({
      title: title.trim(),
      completed: false,
      priority,
      dueDate: dueDate || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined
    });

    setTitle('');
    setPriority('medium');
    setDueDate('');
    setTags('');
    setIsExpanded(false);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 hover:bg-green-200',
    medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    high: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加新任务..."
          className="flex-1 rounded-lg border border-border bg-background"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isExpanded) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <Button 
          type="submit"
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className={`space-y-3 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">优先级:</span>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={priority === p ? 'default' : 'outline'}
              onClick={() => setPriority(p)}
              className={`text-xs px-2 py-1 rounded-lg ${priorityColors[p]}`}
            >
              {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm rounded-lg border border-border bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，用逗号分隔"
            className="text-sm rounded-lg border border-border bg-background"
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? '收起' : '展开更多选项'}
      </Button>
    </form>
  );
}