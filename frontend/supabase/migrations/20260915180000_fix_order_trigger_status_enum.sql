-- ==============================================================================
-- FIX LOG_ORDER_CHANGES TRIGGER FUNCTION FOR NEW ORDER_STATUS ENUM
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.log_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_target uuid;
  v_action text;
  v_desc text;
BEGIN
  v_actor := auth.uid();
  
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
        CASE (NEW.status::text)
          WHEN 'new' THEN 'Mới'
          WHEN 'consulting' THEN 'Đang tư vấn'
          WHEN 'closed' THEN 'Đã chốt'
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
