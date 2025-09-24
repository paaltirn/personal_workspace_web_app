'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';
import { MoreHorizontal, Edit, Trash2, Folder, FolderOpen, Brain } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAIAnalysis?: (project: Project) => void;
}

export default function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onUpdateProject,
  onDeleteProject,
  onAIAnalysis
}: ProjectListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdateProject(id, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'archived':
        return '已归档';
      default:
        return '计划中';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">暂无项目</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className={cn(
            "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
            selectedProjectId === project.id
              ? "bg-primary/5 border-primary shadow-sm"
              : "bg-background hover:bg-muted/50"
          )}
          onClick={() => onSelectProject(project.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {selectedProjectId === project.id ? (
                <FolderOpen className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {editingId === project.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(project.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(project.id);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium text-sm truncate">{project.name}</h4>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs px-2 py-0.5", getStatusColor(project.status))}
                      >
                        {getStatusText(project.status)}
                      </Badge>
                      {project.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(project.dueDate).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {editingId !== project.id && (
              <div className="flex items-center gap-1">
                {onAIAnalysis && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAIAnalysis(project);
                    }}
                    title="AI分析"
                  >
                    <Brain className="h-3 w-3" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}