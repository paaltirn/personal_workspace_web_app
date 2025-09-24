'use client';

import { useState } from 'react';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Trash2, Calendar, User, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectTaskListProps {
  tasks: ProjectTask[];
  onUpdateTask: (id: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (id: string) => void;
}

export default function ProjectTaskList({
  tasks,
  onUpdateTask,
  onDeleteTask
}: ProjectTaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEdit = (task: ProjectTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTask(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleToggleComplete = (task: ProjectTask) => {
    onUpdateTask(task.id, {
      status: task.status === 'completed' ? 'todo' : 'completed'
    });
  };

  const getPriorityColor = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return '待办';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return '待办';
    }
  };

  const isOverdue = (task: ProjectTask) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">暂无任务</div>
        <p className="text-sm text-muted-foreground">点击&ldquo;新建任务&rdquo;开始添加任务</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "group p-4 rounded-lg border transition-all hover:shadow-sm",
            task.status === 'completed' ? "bg-muted/30" : "bg-background",
            isOverdue(task) ? "border-red-200 bg-red-50/50" : "border-border"
          )}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => handleToggleComplete(task)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(task.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(task.id)}
                      className="h-6 px-2 text-xs"
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-6 px-2 text-xs"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      task.status === 'completed' ? "line-through text-muted-foreground" : ""
                    )}>
                      {task.title}
                    </h4>
                    <Flag className={cn("h-3 w-3", getPriorityColor(task.priority))} />
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs px-2 py-0.5", getStatusColor(task.status))}
                    >
                      {getStatusText(task.status)}
                    </Badge>
                    
                    {task.assignee && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{task.assignee}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        isOverdue(task) ? "text-red-600" : "text-muted-foreground"
                      )}>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                        {isOverdue(task) && (
                          <span className="text-red-600 font-medium">逾期</span>
                        )}
                      </div>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {editingId !== task.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => handleEdit(task)}>
                    <Edit className="h-3 w-3 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}