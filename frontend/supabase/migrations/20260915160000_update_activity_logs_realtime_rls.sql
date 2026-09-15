-- ==============================================================================
-- Migration: Cho phép Realtime phát thông báo hoạt động tới tất cả người dùng
-- ==============================================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read relevant activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can read all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all read activity logs" ON public.activity_logs;

-- Cần USING (true) để Supabase Realtime replication không bị chặn bởi subqueries trong RLS
CREATE POLICY "Allow all read activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (true);
