-- 检查用户档案表中的所有数据
SELECT 
    user_id,
    name,
    email,
    role,
    created_at,
    updated_at
FROM user_profiles 
ORDER BY created_at;

-- 检查特定用户的角色
SELECT 
    user_id,
    name,
    email,
    role,
    'Current role for mina@xxx.com' as note
FROM user_profiles 
WHERE email = 'mina@xxx.com';

-- 统计角色分布
SELECT 
    role,
    COUNT(*) as count
FROM user_profiles 
GROUP BY role;