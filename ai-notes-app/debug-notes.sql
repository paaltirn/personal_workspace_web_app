-- 检查 notes 表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'notes';

-- 检查当前用户权限
SELECT auth.uid() as current_user_id;

-- 检查 notes 表结构
\d public.notes;

-- 测试插入权限
INSERT INTO public.notes (user_id, title, content, tags) 
VALUES (auth.uid(), '测试笔记', '测试内容', '{}');

-- 查看所有笔记
SELECT * FROM public.notes WHERE user_id = auth.uid();