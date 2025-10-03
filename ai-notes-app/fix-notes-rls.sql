-- 修复 notes 表的 RLS 策略
-- 删除现有的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

-- 重新创建完整的 RLS 策略
CREATE POLICY "Users can view own notes" ON public.notes 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes 
    FOR DELETE USING (auth.uid() = user_id);

-- 确保 RLS 已启用
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;