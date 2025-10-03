-- 调试用户档案问题
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 1. 检查认证用户
SELECT 'Auth Users:' as section;
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- 2. 检查用户档案表结构
SELECT 'User Profiles Table Structure:' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. 检查用户档案数据
SELECT 'User Profiles Data:' as section;
SELECT * FROM public.user_profiles ORDER BY created_at DESC;

-- 4. 检查RLS策略
SELECT 'RLS Policies:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 5. 检查表的RLS状态
SELECT 'RLS Status:' as section;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 6. 测试当前用户权限
SELECT 'Current User Context:' as section;
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- 7. 测试认证状态
SELECT 'Auth Role:' as section;
SELECT auth.role() as auth_role;

-- 8. 测试用户ID获取
SELECT 'Auth UID:' as section;
SELECT auth.uid() as auth_uid;

-- 9. 尝试直接查询（绕过RLS）
SELECT 'Direct Query Test (Admin):' as section;
SET LOCAL role TO 'postgres';
SELECT COUNT(*) as total_profiles FROM public.user_profiles;
RESET role;

-- 10. 测试插入权限
SELECT 'Insert Test:' as section;
DO $$
DECLARE
    test_user_id uuid;
    current_auth_uid uuid;
BEGIN
    -- 获取当前认证用户ID
    SELECT auth.uid() INTO current_auth_uid;
    
    IF current_auth_uid IS NOT NULL THEN
        -- 尝试插入测试数据
        INSERT INTO public.user_profiles (user_id, name, email, role, created_at, updated_at)
        VALUES (
            current_auth_uid,
            'Test User',
            'test@example.com',
            'user',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            updated_at = NOW();
        
        RAISE NOTICE 'Insert successful for user: %', current_auth_uid;
    ELSE
        RAISE NOTICE 'No authenticated user found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert failed: %', SQLERRM;
END $$;