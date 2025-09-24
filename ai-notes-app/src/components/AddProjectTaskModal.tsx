'use client';

import React, { useState } from 'react';
import { Project, ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddProjectTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projectId: string | null;
  projects: Project[];
}

export default function AddProjectTaskModal({
  open,
  onOpenChange,
  onAddTask,
  projectId,
  projects
}: AddProjectTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'todo' as ProjectTask['status'],
    priority: 'medium' as ProjectTask['priority'],
    assignee: '',
    dueDate: '',
    tags: '',
    selectedProjectId: projectId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.selectedProjectId) {
      return;
    }

    const taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId: formData.selectedProjectId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      content: formData.content.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee.trim(),
      dueDate: formData.dueDate || undefined,
      tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    };

    onAddTask(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      tags: '',
      selectedProjectId: projectId || ''
    });
    onOpenChange(false);
  };

  // 当projectId变化时更新表单
  React.useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, selectedProjectId: projectId }));
    }
  }, [projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">所属项目 *</Label>
            <Select
              value={formData.selectedProjectId}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, selectedProjectId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">任务标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入任务标题"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">任务描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入任务描述"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">详细内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="输入任务的详细内容"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">任务状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectTask['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">待办</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ProjectTask['priority']) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">负责人</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="输入负责人姓名"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">截止日期</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="输入标签，用逗号分隔"
            />
            <p className="text-xs text-muted-foreground">
              例如：前端,UI设计,紧急
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || !formData.selectedProjectId}
            >
              创建任务
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}