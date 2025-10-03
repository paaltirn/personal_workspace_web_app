-- 最终修复用户档案问题的SQL脚本
-- 这个脚本将彻底解决所有用户档案相关的错误

-- 1. 首先为当前登录的用户创建档案（如果不存在）
-- 注意：请将下面的邮箱替换为您当前登录的邮箱地址
DO $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- 获取当前认证用户的信息
    SELECT id, email INTO current_user_id, current_user_email
    FROM auth.users 
    WHERE email IS NOT NULL 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- 如果找到用户，为其创建档案
    IF current_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (user_id, name, email, role)
        VALUES (
            current_user_id,
            COALESCE(split_part(current_user_email, '@', 1), 'User'),
            current_user_email,
            'user'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
            
        RAISE NOTICE '已为用户 % 创建/更新档案', current_user_email;
    ELSE
        RAISE NOTICE '未找到认证用户';
    END IF;
END $$;

-- 2. 确保所有现有用户都有档案
INSERT INTO public.user_profiles (user_id, name, email, role)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User'),
    COALESCE(u.email, 'unknown@example.com'),
    'user'
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL AND u.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. 验证修复结果
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    
    RAISE NOTICE '认证用户数量: %', user_count;
    RAISE NOTICE '用户档案数量: %', profile_count;
    
    IF user_count = profile_count THEN
        RAISE NOTICE '✅ 所有用户都有对应的档案';
    ELSE
        RAISE NOTICE '⚠️  还有 % 个用户没有档案', (user_count - profile_count);
    END IF;
END $$;

-- 4. 显示当前用户档案信息
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.role,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- 完成！用户档案问题应该已经彻底解决了。