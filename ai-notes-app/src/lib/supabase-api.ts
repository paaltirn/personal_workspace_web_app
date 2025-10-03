import { createClient } from '@/lib/supabase-client'
import { Note, ChatSession, ChatMessage, PromptTemplate, Settings } from '@/types/note'
import { Project, ProjectTask } from '@/types/project'
import { Todo } from '@/types/todo'

const supabase = createClient()

// =============================================
// 笔记 API
// =============================================

export const notesApi = {
  // 获取所有笔记
  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取笔记失败:', error)
      return []
    }

    return data.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }))
  },

  // 创建笔记
  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
    console.log('notesApi.create: 开始创建笔记');
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('notesApi.create: 当前用户:', user ? user.id : 'null');
    
    if (!user) {
      console.log('notesApi.create: 用户未登录，返回 null');
      return null;
    }

    console.log('notesApi.create: 准备插入数据:', {
      user_id: user.id,
      title: note.title,
      content: note.content,
      tags: note.tags
    });

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: note.title,
        content: note.content,
        tags: note.tags
      })
      .select()
      .single()

    console.log('notesApi.create: 数据库响应 data:', data);
    console.log('notesApi.create: 数据库响应 error:', error);

    if (error) {
      console.error('notesApi.create: 创建笔记失败:', error)
      return null
    }

    const result = {
      id: data.id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('notesApi.create: 返回结果:', result);
    return result;
  },

  // 更新笔记
  async update(id: string, updates: Partial<Note>): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
        tags: updates.tags
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新笔记失败:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // 删除笔记
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除笔记失败:', error)
      return false
    }

    return true
  }
}

// =============================================
// 项目 API
// =============================================

export const projectsApi = {
  // 获取所有项目
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取项目失败:', error)
      return []
    }

    return data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      dueDate: project.due_date
    }))
  },

  // 创建项目
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        due_date: project.dueDate
      })
      .select()
      .single()

    if (error) {
      console.error('创建项目失败:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date
    }
  },

  // 更新项目
  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        status: updates.status,
        due_date: updates.dueDate
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新项目失败:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date
    }
  },

  // 删除项目
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除项目失败:', error)
      return false
    }

    return true
  }
}

// =============================================
// 项目任务 API
// =============================================

export const projectTasksApi = {
  // 获取项目的所有任务
  async getByProject(projectId: string): Promise<ProjectTask[]> {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取项目任务失败:', error)
      return []
    }

    return data.map(task => ({
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      content: task.content,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.due_date,
      tags: task.tags || [],
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))
  },

  // 创建任务
  async create(task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTask | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: task.projectId,
        user_id: user.id,
        title: task.title,
        content: task.content,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        due_date: task.dueDate,
        tags: task.tags
      })
      .select()
      .single()

    if (error) {
      console.error('创建任务失败:', error)
      return null
    }

    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      content: data.content,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.due_date,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // 更新任务
  async update(id: string, updates: Partial<ProjectTask>): Promise<ProjectTask | null> {
    const { data, error } = await supabase
      .from('project_tasks')
      .update({
        title: updates.title,
        content: updates.content,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assignee: updates.assignee,
        due_date: updates.dueDate,
        tags: updates.tags
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新任务失败:', error)
      return null
    }

    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      content: data.content,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.due_date,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // 删除任务
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除任务失败:', error)
      return false
    }

    return true
  }
}

// =============================================
// 待办事项 API
// =============================================

export const todosApi = {
  // 获取所有待办事项
  async getAll(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取待办事项失败:', error)
      return []
    }

    return data.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      priority: todo.priority,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
      dueDate: todo.due_date,
      tags: todo.tags || []
    }))
  },

  // 创建待办事项
  async create(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority,
        due_date: todo.dueDate,
        tags: todo.tags
      })
      .select()
      .single()

    if (error) {
      console.error('创建待办事项失败:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      completed: data.completed,
      priority: data.priority,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date,
      tags: data.tags || []
    }
  },

  // 更新待办事项
  async update(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const { data, error } = await supabase
      .from('todos')
      .update({
        title: updates.title,
        completed: updates.completed,
        priority: updates.priority,
        due_date: updates.dueDate,
        tags: updates.tags
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新待办事项失败:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      completed: data.completed,
      priority: data.priority,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date,
      tags: data.tags || []
    }
  },

  // 删除待办事项
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除待办事项失败:', error)
      return false
    }

    return true
  }
}

// =============================================
// AI 对话 API
// =============================================

export const chatApi = {
  // 获取所有对话会话
  async getSessions(): Promise<ChatSession[]> {
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      console.error('获取对话会话失败:', sessionsError)
      return []
    }

    // 获取每个会话的消息
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('timestamp', { ascending: true })

        if (messagesError) {
          console.error('获取对话消息失败:', messagesError)
          return {
            id: session.id,
            title: session.title,
            messages: [],
            model: session.model,
            createdAt: session.created_at,
            updatedAt: session.updated_at
          }
        }

        return {
          id: session.id,
          title: session.title,
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            model: msg.model
          })),
          model: session.model,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        }
      })
    )

    return sessionsWithMessages
  },

  // 创建对话会话
  async createSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<ChatSession | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title: session.title,
        model: session.model
      })
      .select()
      .single()

    if (error) {
      console.error('创建对话会话失败:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      messages: [],
      model: data.model,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // 添加消息到会话
  async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: message.role,
        content: message.content,
        model: message.model
      })
      .select()
      .single()

    if (error) {
      console.error('添加消息失败:', error)
      return null
    }

    // 更新会话的更新时间
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    return {
      id: data.id,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp,
      model: data.model
    }
  },

  // 删除对话会话
  async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除对话会话失败:', error)
      return false
    }

    return true
  }
}

// =============================================
// 用户设置 API
// =============================================

export const settingsApi = {
  // 获取用户设置
  async get(): Promise<Settings | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('获取用户设置失败:', error)
      return { openRouterApiKey: '', aiModel: 'deepseek/deepseek-chat-v3.1' }
    }

    return {
      openRouterApiKey: data.openrouter_api_key || '',
      aiModel: data.ai_model || 'deepseek/deepseek-chat-v3.1'
    }
  },

  // 更新用户设置
  async update(settings: Settings): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        openrouter_api_key: settings.openRouterApiKey,
        ai_model: settings.aiModel
      })

    if (error) {
      console.error('更新用户设置失败:', error)
      return false
    }

    return true
  }
}