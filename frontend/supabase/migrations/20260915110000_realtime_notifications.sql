-- ==============================================================================
-- Migration: Bật Realtime và hỗ trợ thông báo hoạt động cho Saler & Admin
-- ==============================================================================

-- 1. Bổ sung cột target_user_id vào bảng activity_logs (nếu chưa có)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'target_user_id'
  ) THEN
    ALTER TABLE public.activity_logs ADD COLUMN target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Tạo index cho target_user_id và created_at để truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_user ON public.activity_logs (target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- Cập nhật dữ liệu cũ: gán target_user_id = actor_id nếu đang null
UPDATE public.activity_logs SET target_user_id = actor_id WHERE target_user_id IS NULL AND actor_id IS NOT NULL;

-- 2. Đưa bảng activity_logs vào publication supabase_realtime để client lắng nghe được qua WebSocket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activity_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  END IF;
END $$;

ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;

-- 3. Cập nhật Trigger tự động ghi nhật ký vào Activity Logs
CREATE OR REPLACE FUNCTION public.log_order_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_desc text;
  v_actor uuid;
  v_target uuid;
BEGIN
  -- Xác định người thực hiện hành động
  v_actor := coalesce(auth.uid(), CASE WHEN TG_OP = 'DELETE' THEN OLD.owner_id ELSE NEW.owner_id END);
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'create_order';
    v_target := NEW.owner_id;
    v_desc := 'Tạo đơn tour mới: ' || NEW.order_code;
    
    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);

  ELSIF TG_OP = 'UPDATE' THEN
    v_target := NEW.owner_id;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := 'update_status';
      v_desc := 'Cập nhật trạng thái đơn ' || NEW.order_code || ' thành: ' || 
        CASE NEW.status
          WHEN 'new' THEN 'Mới'
          WHEN 'confirmed' THEN 'Đã xác nhận'
          WHEN 'deposited' THEN 'Đã đặt cọc'
          WHEN 'completed' THEN 'Hoàn thành'
          WHEN 'cancelled' THEN 'Đã hủy'
          ELSE NEW.status::text
        END;
    ELSE
      v_action := 'update_order';
      v_desc := 'Cập nhật thông tin đơn tour ' || NEW.order_code;
    END IF;

    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete_order';
    v_target := OLD.owner_id;
    v_desc := 'Xóa đơn tour ' || OLD.order_code;

    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);
  END IF;

  RETURN NULL;
END;
$$;

-- Đảm bảo trigger on_order_changed được gán
DROP TRIGGER IF EXISTS on_order_changed ON public.orders;
CREATE TRIGGER on_order_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_order_changes();

-- 4. Cập nhật RLS Policies trên activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can read relevant activity logs" ON public.activity_logs;

CREATE POLICY "Users can read relevant activity logs" ON public.activity_logs
FOR SELECT USING (
  public.get_my_role() = 'admin' 
  OR target_user_id = auth.uid() 
  OR actor_id = auth.uid()
);
