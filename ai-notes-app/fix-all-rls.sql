-- 修复所有表的 RLS 策略
-- 这个脚本会修复用户档案、项目等表的权限问题

-- =============================================
-- 1. 修复 user_profiles 表的 RLS 策略
-- =============================================

-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete other profiles" ON public.user_profiles;

-- 重新创建 user_profiles 策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 管理员策略
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 2. 修复 projects 表的 RLS 策略
-- =============================================

-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- 重新创建 projects 策略
CREATE POLICY "Users can view own projects" ON public.projects 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects 
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. 修复 project_tasks 表的 RLS 策略
-- =============================================

-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own project tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can insert own project tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can update own project tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can delete own project tasks" ON public.project_tasks;

-- 重新创建 project_tasks 策略
CREATE POLICY "Users can view own project tasks" ON public.project_tasks 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project tasks" ON public.project_tasks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project tasks" ON public.project_tasks 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project tasks" ON public.project_tasks 
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. 修复 todos 表的 RLS 策略
-- =============================================

-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;

-- 重新创建 todos 策略
CREATE POLICY "Users can view own todos" ON public.todos 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos 
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 5. 确保所有表都启用了 RLS
-- =============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;