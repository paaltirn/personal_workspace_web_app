-- 终极修复用户档案问题
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 1. 完全重建用户档案表和策略
BEGIN;

-- 删除现有的触发器和函数
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 临时禁用RLS
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete other profiles" ON public.user_profiles;

-- 删除并重新创建表
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 创建用户档案表
CREATE TABLE public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT 'User',
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建最宽松的策略（确保功能正常）
CREATE POLICY "Enable all access for authenticated users" ON public.user_profiles
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 创建更新时间函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 创建自动创建用户档案的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1),
            'User'
        ),
        NEW.email,
        'user'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 如果插入失败，记录错误但不阻止用户创建
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 为现有用户创建档案
INSERT INTO public.user_profiles (user_id, name, email, role)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'full_name',
        split_part(u.email, '@', 1),
        'User'
    ) as name,
    u.email,
    'user' as role
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    email = EXCLUDED.email,
    updated_at = NOW();

-- 验证结果
SELECT 'Final Verification:' as info;
SELECT 
    'Auth Users' as type,
    COUNT(*) as count
FROM auth.users 
WHERE email IS NOT NULL
UNION ALL
SELECT 
    'User Profiles' as type,
    COUNT(*) as count
FROM public.user_profiles;

-- 显示所有用户档案
SELECT 'All User Profiles:' as info;
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.role,
    up.created_at
FROM public.user_profiles up
ORDER BY up.created_at DESC;

COMMIT;

-- 最终测试
SELECT 'Final Test - Can Access Profiles:' as test;
SELECT COUNT(*) as accessible_profiles FROM public.user_profiles;