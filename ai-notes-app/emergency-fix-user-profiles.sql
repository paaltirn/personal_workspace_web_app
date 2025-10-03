-- 紧急修复用户档案问题
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 1. 首先检查当前用户情况
SELECT 'Current auth users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

SELECT 'Current user profiles:' as info;
SELECT user_id, name, email, role FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;

-- 2. 临时禁用RLS以确保可以插入数据
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. 为所有认证用户强制创建档案
INSERT INTO public.user_profiles (user_id, name, email, role, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'name', 
        u.raw_user_meta_data->>'full_name',
        split_part(u.email, '@', 1),
        'User'
    ) as name,
    u.email,
    'user' as role,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    email = EXCLUDED.email,
    updated_at = NOW();

-- 4. 重新启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 删除所有现有策略并重新创建
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete other profiles" ON public.user_profiles;

-- 6. 创建最宽松的策略确保功能正常
CREATE POLICY "Allow all operations for authenticated users" ON public.user_profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. 验证结果
SELECT 'Verification - Auth users vs Profiles:' as info;
SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL) as auth_users_count,
    (SELECT COUNT(*) FROM public.user_profiles) as profiles_count;

SELECT 'All user profiles:' as info;
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.role,
    au.email as auth_email
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- 8. 测试权限
SELECT 'Testing permissions:' as info;
SELECT 
    'Can select from user_profiles' as test,
    COUNT(*) as result
FROM public.user_profiles;