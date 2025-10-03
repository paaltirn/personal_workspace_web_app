-- 完整修复项目功能问题的SQL脚本
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 1. 检查并创建projects表（如果不存在）
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. 删除所有现有的projects表RLS策略
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can select own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- 3. 确保启用RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. 创建projects表的RLS策略
CREATE POLICY "Users can select own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- 5. 检查并创建project_tasks表（如果不存在）
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. 删除所有现有的project_tasks表RLS策略
DROP POLICY IF EXISTS "Users can view own project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can select own project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can insert own project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can update own project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can delete own project_tasks" ON public.project_tasks;

-- 7. 确保启用RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- 8. 创建project_tasks表的RLS策略
CREATE POLICY "Users can select own project_tasks" ON public.project_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project_tasks" ON public.project_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project_tasks" ON public.project_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project_tasks" ON public.project_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- 9. 检查并创建todos表（如果不存在）
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. 删除所有现有的todos表RLS策略
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can select own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;

-- 11. 确保启用RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 12. 创建todos表的RLS策略
CREATE POLICY "Users can select own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- 13. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user_id ON public.project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);

-- 14. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为projects表创建更新时间触发器
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为project_tasks表创建更新时间触发器
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER update_project_tasks_updated_at 
    BEFORE UPDATE ON public.project_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为todos表创建更新时间触发器
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON public.todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！现在项目管理功能应该可以正常工作了。