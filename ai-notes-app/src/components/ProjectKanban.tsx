'use client';

import { ProjectTask } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Calendar, User, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectKanbanProps {
  tasks: ProjectTask[];
  onUpdateTask: (id: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (id: string) => void;
}

export default function ProjectKanban({
  tasks,
  onUpdateTask,
  onDeleteTask
}: ProjectKanbanProps) {
  const columns = [
    { id: 'todo', title: '待办', status: 'todo' as const },
    { id: 'in_progress', title: '进行中', status: 'in_progress' as const },
    { id: 'completed', title: '已完成', status: 'completed' as const }
  ];

  const getTasksByStatus = (status: ProjectTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleStatusChange = (taskId: string, newStatus: ProjectTask['status']) => {
    onUpdateTask(taskId, { status: newStatus });
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

  const isOverdue = (task: ProjectTask) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const TaskCard = ({ task }: { task: ProjectTask }) => (
    <div
      className={cn(
        "group p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer",
        isOverdue(task) ? "border-red-200 bg-red-50/50" : "border-border"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
        <div className="flex items-center gap-1 ml-2">
          <Flag className={cn("h-3 w-3", getPriorityColor(task.priority))} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => onDeleteTask(task.id)}
                className="text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="space-y-2">
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
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div
            key={column.id}
            className="flex flex-col bg-muted/30 rounded-lg p-4"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('text/plain');
              if (taskId) {
                handleStatusChange(taskId, column.status);
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="outline" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  暂无任务
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}