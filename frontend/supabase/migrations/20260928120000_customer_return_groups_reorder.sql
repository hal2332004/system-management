-- ==============================================================================
-- TOURFLOW CRM: ATOMIC REORDER RETURN VISITS & CUSTOMER HISTORY RESTRUCTURE
-- ==============================================================================

-- 1. Hàm sắp xếp lại các đợt quay lại của khách hàng một cách atomic, transaction-safe
-- Đảm bảo không xảy ra race condition, không duplicate hoặc gap sequence.
CREATE OR REPLACE FUNCTION public.reorder_customer_return_visits(
  p_customer_id uuid,
  p_ordered_visit_ids uuid[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_len integer;
  v_i integer;
  v_vid uuid;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_my_account_active() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_len := array_length(p_ordered_visit_ids, 1);
  IF v_len IS NULL OR v_len = 0 THEN
    RETURN json_build_object('success', true, 'updated', 0);
  END IF;

  -- Row-level lock để ngăn nhiều người reorder cùng lúc gây race condition
  PERFORM id FROM public.customers WHERE id = p_customer_id FOR UPDATE;

  -- Kiểm tra các visit có thuộc về customer này không
  IF EXISTS (
    SELECT 1 FROM public.customer_return_visits
    WHERE id = ANY(p_ordered_visit_ids) AND customer_id <> p_customer_id
  ) THEN
    RAISE EXCEPTION 'Mismatched customer_id for return visits';
  END IF;

  -- Bước 1: Gán giá trị tạm thời (1000000 + v_i) để không vi phạm unique constraint (customer_id, visit_number)
  FOR v_i IN 1..v_len LOOP
    v_vid := p_ordered_visit_ids[v_i];
    UPDATE public.customer_return_visits
    SET visit_number = 1000000 + v_i
    WHERE id = v_vid AND customer_id = p_customer_id;
  END LOOP;

  -- Bước 2: Đánh lại sequence chuẩn 1, 2, 3... liên tục (1 = Lần đầu, 2 = Quay lại lần 1, 3 = Quay lại lần 2...)
  FOR v_i IN 1..v_len LOOP
    v_vid := p_ordered_visit_ids[v_i];
    UPDATE public.customer_return_visits
    SET visit_number = v_i, updated_at = now()
    WHERE id = v_vid AND customer_id = p_customer_id;
  END LOOP;

  RETURN json_build_object('success', true, 'updated', v_len);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reorder_customer_return_visits(uuid, uuid[]) TO authenticated, service_role;


-- 2. Cập nhật get_customer_history: Sắp xếp các đợt theo visit_number ASC (1 = Lần đầu lên đầu tiên)
-- và trả về chi tiết order bao gồm return_visit_id
CREATE OR REPLACE FUNCTION public.get_customer_history(p_customer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res json;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_my_account_active() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'customer', (
      SELECT row_to_json(c)
      FROM (
        SELECT id, customer_code, full_name, phone, email, country, created_at, updated_at
        FROM public.customers
        WHERE id = p_customer_id
      ) c
    ),
    'visits', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', v.id,
          'visit_number', v.visit_number,
          'notes', v.notes,
          'created_at', v.created_at,
          'orders', COALESCE((
            SELECT json_agg(
              json_build_object(
                'id', o.id,
                'order_code', o.order_code,
                'tour_name', o.tour_name,
                'tour_type', o.tour_type,
                'private_tour_name', o.private_tour_name,
                'booking_date', o.booking_date,
                'tour_date', o.tour_date,
                'status', o.status,
                'rating', o.rating,
                'num_guests', o.num_guests,
                'created_at', o.created_at,
                'return_visit_id', o.return_visit_id,
                'owner', (
                  SELECT json_build_object(
                    'display_name', p.display_name,
                    'username', p.username,
                    'avatar_url', p.avatar_url
                  )
                  FROM public.profiles p
                  WHERE p.id = o.owner_id
                )
              ) ORDER BY o.booking_date ASC, o.created_at ASC
            )
            FROM public.orders o
            WHERE o.return_visit_id = v.id
          ), '[]'::json)
        ) ORDER BY v.visit_number ASC
      )
      FROM public.customer_return_visits v
      WHERE v.customer_id = p_customer_id
    ), '[]'::json)
  ) INTO v_res;

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_history(uuid) TO authenticated, service_role;
