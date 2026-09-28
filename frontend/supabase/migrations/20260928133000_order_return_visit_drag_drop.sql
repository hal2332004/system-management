-- Migration: Support dragging orders between return visits or separating into new visits
-- Purges empty visits and maintains gapless, duplicate-free 1..N sequence

CREATE OR REPLACE FUNCTION move_order_to_visit(
  p_order_id uuid,
  p_target_visit_id uuid,
  p_customer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_visit_id uuid;
  v_row_count int;
BEGIN
  -- 1. Khóa bảng customers để đảm bảo tính tuần tự, tránh race condition
  PERFORM 1 FROM customers WHERE id = p_customer_id FOR UPDATE;

  -- 2. Lấy visit cũ của đơn hàng
  SELECT return_visit_id INTO v_old_visit_id
  FROM orders
  WHERE id = p_order_id;

  -- 3. Cập nhật order sang target_visit_id
  UPDATE orders
  SET return_visit_id = p_target_visit_id
  WHERE id = p_order_id;

  -- 4. Nếu visit cũ không còn đơn nào, xóa visit cũ
  IF v_old_visit_id IS NOT NULL AND v_old_visit_id <> p_target_visit_id THEN
    SELECT COUNT(*) INTO v_row_count
    FROM orders
    WHERE return_visit_id = v_old_visit_id;

    IF v_row_count = 0 THEN
      DELETE FROM customer_return_visits
      WHERE id = v_old_visit_id AND customer_id = p_customer_id;
    END IF;
  END IF;

  -- 5. Xóa tất cả các visit rỗng (không có đơn tour) của khách hàng này để tránh tích tụ
  DELETE FROM customer_return_visits
  WHERE customer_id = p_customer_id
    AND id NOT IN (
      SELECT DISTINCT return_visit_id
      FROM orders
      WHERE customer_id = p_customer_id AND return_visit_id IS NOT NULL
    );

  -- 6. Đánh lại sequence 1..N liên tục an toàn với unique constraint
  WITH ordered_v AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY visit_number ASC, created_at ASC) as new_seq
    FROM customer_return_visits
    WHERE customer_id = p_customer_id
  )
  UPDATE customer_return_visits v
  SET visit_number = 1000000 + ov.new_seq
  FROM ordered_v ov
  WHERE v.id = ov.id;

  WITH ordered_v AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY visit_number ASC) as new_seq
    FROM customer_return_visits
    WHERE customer_id = p_customer_id
  )
  UPDATE customer_return_visits v
  SET visit_number = ov.new_seq
  FROM ordered_v ov
  WHERE v.id = ov.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION separate_order_to_new_visit(
  p_order_id uuid,
  p_customer_id uuid,
  p_target_position int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_visit_id uuid;
  v_old_visit_id uuid;
  v_max_seq int;
  v_row_count int;
BEGIN
  -- 1. Khóa bảng customers để đảm bảo tính tuần tự
  PERFORM 1 FROM customers WHERE id = p_customer_id FOR UPDATE;

  -- 2. Lấy visit cũ của đơn hàng
  SELECT return_visit_id INTO v_old_visit_id
  FROM orders
  WHERE id = p_order_id;

  -- 3. Tạo đợt mới với sequence tạm
  SELECT COALESCE(MAX(visit_number), 0) + 100 INTO v_max_seq
  FROM customer_return_visits
  WHERE customer_id = p_customer_id;

  INSERT INTO customer_return_visits (customer_id, visit_number, notes)
  VALUES (p_customer_id, v_max_seq, 'Đợt quay lại tách riêng')
  RETURNING id INTO v_new_visit_id;

  -- 4. Gán đơn tour sang đợt mới này
  UPDATE orders
  SET return_visit_id = v_new_visit_id
  WHERE id = p_order_id;

  -- 5. Nếu visit cũ không còn đơn nào, xóa visit cũ
  IF v_old_visit_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_row_count
    FROM orders
    WHERE return_visit_id = v_old_visit_id;

    IF v_row_count = 0 THEN
      DELETE FROM customer_return_visits
      WHERE id = v_old_visit_id AND customer_id = p_customer_id;
    END IF;
  END IF;

  -- 6. Xóa các visit rỗng còn sót lại của khách hàng này (trừ visit mới vừa tạo)
  DELETE FROM customer_return_visits
  WHERE customer_id = p_customer_id
    AND id <> v_new_visit_id
    AND id NOT IN (
      SELECT DISTINCT return_visit_id
      FROM orders
      WHERE customer_id = p_customer_id AND return_visit_id IS NOT NULL
    );

  -- 7. Sắp xếp lại thứ tự 1..N liên tục
  WITH numbered AS (
    SELECT id,
           CASE
             WHEN id = v_new_visit_id AND p_target_position IS NOT NULL THEN p_target_position * 10 + 5
             WHEN id = v_new_visit_id THEN 999999
             ELSE visit_number * 10
           END as sort_key
    FROM customer_return_visits
    WHERE customer_id = p_customer_id
  ),
  ordered_v AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY sort_key ASC, id ASC) as new_seq
    FROM numbered
  )
  UPDATE customer_return_visits v
  SET visit_number = 1000000 + ov.new_seq
  FROM ordered_v ov
  WHERE v.id = ov.id;

  WITH ordered_v AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY visit_number ASC) as new_seq
    FROM customer_return_visits
    WHERE customer_id = p_customer_id
  )
  UPDATE customer_return_visits v
  SET visit_number = ov.new_seq
  FROM ordered_v ov
  WHERE v.id = ov.id;

  RETURN jsonb_build_object(
    'success', true,
    'new_visit_id', v_new_visit_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION move_order_to_visit(uuid, uuid, uuid) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION separate_order_to_new_visit(uuid, uuid, int) TO authenticated, service_role, anon;
