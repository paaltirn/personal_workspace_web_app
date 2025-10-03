'use client';

import React, { useState, useMemo } from 'react';
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';
import { Project, ProjectTask, ViewType, ProjectStats } from '@/types/project';
import { Plus, FolderPlus, Search, List, Kanban, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectList from './ProjectList';
import ProjectTaskList from './ProjectTaskList';
import ProjectKanban from './ProjectKanban';
import ProjectCalendar from './ProjectCalendar';
import AddProjectModal from './AddProjectModal';
import AddProjectTaskModal from './AddProjectTaskModal';
import AIAnalysisModal from './AIAnalysisModal';

export default function SupabaseProjectManager() {
  const {
    projects,
    projectTasks,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getTasksByProject
  } = useSupabaseProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisProject, setAiAnalysisProject] = useState<Project | null>(null);

  // 过滤项目
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, filterStatus]);

  // 获取当前选中的项目
  const selectedProject = useMemo(() => {
    return selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  }, [projects, selectedProjectId]);

  // 获取当前项目的任务
  const currentProjectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return getTasksByProject(selectedProjectId).filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [selectedProjectId, getTasksByProject, searchTerm, filterPriority]);

  // 处理AI分析
  const handleAIAnalysis = (project: Project) => {
    setAiAnalysisProject(project);
    setShowAIAnalysis(true);
  };

  // 计算统计数据
  const stats: ProjectStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = projectTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks
    };
  }, [projects, projectTasks]);

  const viewIcons = {
    list: List,
    kanban: Kanban,
    calendar: Calendar
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载项目数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">项目管理</h1>
        <p className="text-muted-foreground text-lg">管理您的项目和任务</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalProjects}</p>
            <p className="text-sm text-muted-foreground">总项目</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
            <p className="text-sm text-muted-foreground">进行中</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.completedProjects}</p>
            <p className="text-sm text-muted-foreground">已完成</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
            <p className="text-sm text-muted-foreground">总任务</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            <p className="text-sm text-muted-foreground">已完成任务</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
            <p className="text-sm text-muted-foreground">逾期任务</p>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索项目或任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddProject(true)}
            className="rounded-lg"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          
          {selectedProjectId && (
            <Button
              onClick={() => setShowAddTask(true)}
              variant="outline"
              className="rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          )}
        </div>
      </div>

      {/* 过滤器 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="text-xs px-3 py-1 rounded-lg"
            >
              {status === 'all' ? '全部状态' : 
               status === 'active' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>
        
        {selectedProjectId && (
          <div className="flex gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filterPriority === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority(priority)}
                className="text-xs px-3 py-1 rounded-lg"
              >
                {priority === 'all' ? '全部优先级' : 
                 priority === 'high' ? '高' : 
                 priority === 'medium' ? '中' : '低'}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 项目列表 */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4">项目列表</h3>
            <ProjectList
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onAIAnalysis={handleAIAnalysis}
            />
          </div>
        </div>

        {/* 任务视图 */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProject.name}</h3>
                  {selectedProject.description && (
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  )}
                </div>
                
                <div className="flex gap-1">
                  {Object.entries(viewIcons).map(([view, Icon]) => (
                    <Button
                      key={view}
                      variant={currentView === view ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView(view as ViewType)}
                      className="p-2"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>

              {currentView === 'list' && (
                <ProjectTaskList
                  tasks={currentProjectTasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              )}
              
              {currentView === 'kanban' && (
                <ProjectKanban
                  tasks={currentProjectTasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              )}
              
              {currentView === 'calendar' && (
                <ProjectCalendar
                  tasks={currentProjectTasks}
                />
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-2">选择项目</h3>
              <p className="text-lg text-muted-foreground mb-2">选择一个项目开始管理任务</p>
              <p className="text-sm text-muted-foreground mb-4">或者创建一个新项目</p>
              <Button onClick={() => setShowAddProject(true)} className="rounded-lg">
                <FolderPlus className="h-4 w-4 mr-2" />
                新建项目
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 模态框 */}
      <AddProjectModal
        open={showAddProject}
        onOpenChange={setShowAddProject}
        onAddProject={addProject}
      />
      
      <AddProjectTaskModal
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onAddTask={addTask}
        projectId={selectedProjectId}
        projects={projects}
      />
      
      <AIAnalysisModal
        isOpen={showAIAnalysis}
        onClose={() => setShowAIAnalysis(false)}
        project={aiAnalysisProject}
        tasks={aiAnalysisProject ? getTasksByProject(aiAnalysisProject.id) : []}
      />
    </div>
  );
}