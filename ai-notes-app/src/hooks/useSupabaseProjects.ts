import { useState, useEffect, useCallback } from 'react';
import { projectsApi, projectTasksApi } from '@/lib/supabase-api';
import { Project, ProjectTask } from '@/types/project';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 加载项目
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getAll();
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // 加载所有任务
  const loadAllTasks = useCallback(async () => {
    try {
      // 获取所有项目的任务
      const allTasks: ProjectTask[] = [];
      for (const project of projects) {
        const tasks = await projectTasksApi.getByProject(project.id);
        allTasks.push(...tasks);
      }
      setProjectTasks(allTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  }, [projects]);

  // 初始化加载
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 当项目加载完成后，加载任务
  useEffect(() => {
    if (projects.length > 0) {
      loadAllTasks();
    }
  }, [projects, loadAllTasks]);

  // 设置实时监听
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        // 监听项目变化
        const projectsSubscription = supabase
          .channel('projects_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'projects',
              filter: `user_id=eq.${user.data.user.id}`
            },
            (payload) => {
              console.log('项目实时更新:', payload);
              loadProjects();
            }
          )
          .subscribe();

        // 监听任务变化
        const tasksSubscription = supabase
          .channel('project_tasks_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'project_tasks',
              filter: `user_id=eq.${user.data.user.id}`
            },
            (payload) => {
              console.log('任务实时更新:', payload);
              loadAllTasks();
            }
          )
          .subscribe();

        return () => {
          projectsSubscription.unsubscribe();
          tasksSubscription.unsubscribe();
        };
      } catch (error) {
        console.error('设置实时监听失败:', error);
      }
    };

    if (isInitialized) {
      setupRealtimeSubscription();
    }
  }, [isInitialized, loadProjects, loadAllTasks]);

  // 添加项目
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> => {
    try {
      const data = await projectsApi.create(projectData);
      if (data) {
        setProjects(prevProjects => [data, ...prevProjects]);
        return data;
      }
      return null;
    } catch (error) {
      console.error('创建项目失败:', error);
      return null;
    }
  }, []);

  // 更新项目
  const updateProject = useCallback(async (id: string, updates: Partial<Project>): Promise<boolean> => {
    try {
      const result = await projectsApi.update(id, updates);
      if (result) {
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === id ? result : project
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新项目失败:', error);
      return false;
    }
  }, []);

  // 删除项目
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const success = await projectsApi.delete(projectId);
      if (success) {
        setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        setProjectTasks(prevTasks => prevTasks.filter(task => task.projectId !== projectId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除项目失败:', error);
      return false;
    }
  }, []);

  // 添加任务
  const addTask = useCallback(async (taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTask | null> => {
    try {
      const data = await projectTasksApi.create(taskData);
      if (data) {
        setProjectTasks(prevTasks => [data, ...prevTasks]);
        return data;
      }
      return null;
    } catch (error) {
      console.error('创建任务失败:', error);
      return null;
    }
  }, []);

  // 更新任务
  const updateTask = useCallback(async (id: string, updates: Partial<ProjectTask>): Promise<boolean> => {
    try {
      const result = await projectTasksApi.update(id, updates);
      if (result) {
        setProjectTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === id ? result : task
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新任务失败:', error);
      return false;
    }
  }, []);

  // 删除任务
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const success = await projectTasksApi.delete(taskId);
      if (success) {
        setProjectTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除任务失败:', error);
      return false;
    }
  }, []);

  // 根据项目ID获取任务
  const getTasksByProject = useCallback((projectId: string): ProjectTask[] => {
    return projectTasks.filter(task => task.projectId === projectId);
  }, [projectTasks]);

  // 根据ID获取项目
  const getProjectById = useCallback((projectId: string): Project | undefined => {
    return projects.find(project => project.id === projectId);
  }, [projects]);

  return {
    projects,
    projectTasks,
    isLoading,
    isInitialized,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getTasksByProject,
    getProjectById,
    refreshProjects: loadProjects,
    refreshTasks: loadAllTasks
  };
}