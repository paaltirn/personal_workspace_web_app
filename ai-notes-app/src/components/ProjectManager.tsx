'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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


export default function ProjectManager() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [projectTasks, setProjectTasks] = useLocalStorage<ProjectTask[]>('projectTasks', []);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // 自动选中第一个项目（如果存在）
  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      // 如果有项目但没有选中项目，自动选中第一个
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisProject, setAiAnalysisProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const addProject = (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const project: Project = {
      ...newProject,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects([project, ...projects]);
    setSelectedProjectId(project.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project =>
      project.id === id
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setProjectTasks(projectTasks.filter(t => t.projectId !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  };

  const addTask = (newTask: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: ProjectTask = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjectTasks([task, ...projectTasks]);
  };

  const updateTask = (id: string, updates: Partial<ProjectTask>) => {
    setProjectTasks(projectTasks.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setProjectTasks(projectTasks.filter(t => t.id !== id));
  };

  const handleAIAnalysis = (project: Project) => {
    setAiAnalysisProject(project);
    setShowAIAnalysis(true);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  const filteredTasks = useMemo(() => {
    const tasks = selectedProjectId
      ? projectTasks.filter(task => task.projectId === selectedProjectId)
      : projectTasks;

    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && task.status !== 'completed') ||
                           (filterStatus === 'completed' && task.status === 'completed');
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectTasks, selectedProjectId, searchQuery, filterStatus, filterPriority]);

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
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setShowAddProject(true)} className="rounded-lg">
            <FolderPlus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          <Button 
            onClick={() => setShowAddTask(true)} 
            variant="outline" 
            className="rounded-lg"
            disabled={!selectedProjectId}
          >
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目或任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="text-xs px-3 py-1 rounded-lg"
            >
              {status === 'all' ? '全部' : status === 'active' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>

        {selectedProjectId && (
          <div className="flex gap-2">
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
                  {(['list', 'kanban', 'calendar'] as ViewType[]).map((view) => {
                    const Icon = viewIcons[view];
                    return (
                      <Button
                        key={view}
                        variant={currentView === view ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView(view)}
                        className="p-2"
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              {currentView === 'list' && (
                <ProjectTaskList
                  tasks={filteredTasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              )}
              {currentView === 'kanban' && (
                <ProjectKanban
                  tasks={filteredTasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              )}
              {currentView === 'calendar' && (
                <ProjectCalendar
                  tasks={filteredTasks}
                />
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
              <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
        tasks={aiAnalysisProject ? projectTasks.filter(t => t.projectId === aiAnalysisProject.id) : []}
      />
    </div>
  );
}