-- ==============================================================================
-- TOURFLOW CRM: CUSTOMER ENTITY, RETURN VISITS & ORDER LINKING
-- ==============================================================================

-- 1. BẢNG CUSTOMERS (Định danh khách hàng độc lập với đơn tour)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  email text,
  country varchar(2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trigger tự động sinh mã khách hàng (Ví dụ: CUS-9A2B1C)
CREATE OR REPLACE FUNCTION public.handle_new_customer_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_code IS NULL OR trim(NEW.customer_code) = '' THEN
    NEW.customer_code := 'CUS-' || upper(substr(md5(random()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_customer_created ON public.customers;
CREATE TRIGGER on_customer_created
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_customer_code();

DROP TRIGGER IF EXISTS on_customers_updated ON public.customers;
CREATE TRIGGER on_customers_updated
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Chỉ mục tìm kiếm cho bảng customers
CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON public.customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email_lower ON public.customers(lower(email));


-- 2. BẢNG CUSTOMER_RETURN_VISITS (Quản lý các đợt/lần quay lại của khách hàng)
-- Quan hệ: 1 Khách hàng -> N Đợt quay lại -> N Đơn tour
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customer_return_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  visit_number integer NOT NULL CHECK (visit_number > 0),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT uq_customer_visit_number UNIQUE (customer_id, visit_number)
);

CREATE INDEX IF NOT EXISTS idx_return_visits_customer_id ON public.customer_return_visits(customer_id);

DROP TRIGGER IF EXISTS on_customer_return_visits_updated ON public.customer_return_visits;
CREATE TRIGGER on_customer_return_visits_updated
  BEFORE UPDATE ON public.customer_return_visits
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- 3. LIÊN KẾT BẢNG ORDERS VỚI CUSTOMERS VÀ CUSTOMER_RETURN_VISITS
-- ==============================================================================
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS return_visit_id uuid REFERENCES public.customer_return_visits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_return_visit_id ON public.orders(return_visit_id);


-- 4. BẬT BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_return_visits ENABLE ROW LEVEL SECURITY;

-- [CUSTOMERS POLICIES]
DROP POLICY IF EXISTS "Admins can do everything on customers" ON public.customers;
CREATE POLICY "Admins can do everything on customers"
  ON public.customers FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Active users can view customers" ON public.customers;
CREATE POLICY "Active users can view customers"
  ON public.customers FOR SELECT
  USING (public.is_my_account_active());

DROP POLICY IF EXISTS "Active users can insert customers" ON public.customers;
CREATE POLICY "Active users can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.is_my_account_active());

DROP POLICY IF EXISTS "Active users can update customers" ON public.customers;
CREATE POLICY "Active users can update customers"
  ON public.customers FOR UPDATE
  USING (public.is_my_account_active());

-- [CUSTOMER_RETURN_VISITS POLICIES]
DROP POLICY IF EXISTS "Admins can do everything on customer_return_visits" ON public.customer_return_visits;
CREATE POLICY "Admins can do everything on customer_return_visits"
  ON public.customer_return_visits FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Active users can view customer_return_visits" ON public.customer_return_visits;
CREATE POLICY "Active users can view customer_return_visits"
  ON public.customer_return_visits FOR SELECT
  USING (public.is_my_account_active());

DROP POLICY IF EXISTS "Active users can insert customer_return_visits" ON public.customer_return_visits;
CREATE POLICY "Active users can insert customer_return_visits"
  ON public.customer_return_visits FOR INSERT
  WITH CHECK (public.is_my_account_active());

DROP POLICY IF EXISTS "Active users can update customer_return_visits" ON public.customer_return_visits;
CREATE POLICY "Active users can update customer_return_visits"
  ON public.customer_return_visits FOR UPDATE
  USING (public.is_my_account_active());


-- 5. RPC FUNCTIONS: QUẢN TRỊ NGHIỆP VỤ & CHỐNG RACE CONDITIONS
-- ==============================================================================

-- 5.1 Hàm tạo an toàn Return Visit mới cho khách (Khóa dòng customer để chống race condition)
CREATE OR REPLACE FUNCTION public.create_customer_return_visit(
  p_customer_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS public.customer_return_visits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_number integer;
  v_visit public.customer_return_visits;
BEGIN
  IF NOT public.is_my_account_active() THEN
    RAISE EXCEPTION 'Access denied: Account is not active or unauthenticated';
  END IF;

  -- Row-level lock để ngăn 2 Saler tạo visit đồng thời gây trùng visit_number
  PERFORM id FROM public.customers WHERE id = p_customer_id FOR UPDATE;

  SELECT COALESCE(MAX(visit_number), 0) + 1
  INTO v_next_number
  FROM public.customer_return_visits
  WHERE customer_id = p_customer_id;

  INSERT INTO public.customer_return_visits (customer_id, visit_number, notes)
  VALUES (p_customer_id, v_next_number, p_notes)
  RETURNING * INTO v_visit;

  RETURN v_visit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_customer_return_visit(uuid, text) TO authenticated;


-- 5.2 Hàm tìm kiếm khách hàng server-side tối ưu
CREATE OR REPLACE FUNCTION public.search_customers(p_query text)
RETURNS TABLE (
  id uuid,
  customer_code text,
  full_name text,
  phone text,
  email text,
  country varchar(2),
  created_at timestamptz,
  total_orders bigint,
  total_visits bigint,
  last_tour_date text,
  last_booking_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_query text;
BEGIN
  IF NOT public.is_my_account_active() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  clean_query := trim(p_query);
  IF clean_query = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.customer_code,
    c.full_name,
    c.phone,
    c.email,
    c.country,
    c.created_at,
    COALESCE(COUNT(DISTINCT o.id), 0) AS total_orders,
    COALESCE(COUNT(DISTINCT v.id), 0) AS total_visits,
    (
      SELECT o_sub.tour_date 
      FROM public.orders o_sub 
      WHERE o_sub.customer_id = c.id 
      ORDER BY o_sub.booking_date DESC, o_sub.created_at DESC 
      LIMIT 1
    ) AS last_tour_date,
    (
      SELECT o_sub.booking_date 
      FROM public.orders o_sub 
      WHERE o_sub.customer_id = c.id 
      ORDER BY o_sub.booking_date DESC, o_sub.created_at DESC 
      LIMIT 1
    ) AS last_booking_date
  FROM public.customers c
  LEFT JOIN public.customer_return_visits v ON v.customer_id = c.id
  LEFT JOIN public.orders o ON o.customer_id = c.id
  WHERE 
    c.customer_code ILIKE '%' || clean_query || '%'
    OR c.full_name ILIKE '%' || clean_query || '%'
    OR (c.phone IS NOT NULL AND c.phone ILIKE '%' || clean_query || '%')
    OR (c.email IS NOT NULL AND LOWER(c.email) LIKE '%' || LOWER(clean_query) || '%')
  GROUP BY c.id
  ORDER BY c.created_at DESC
  LIMIT 25;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_customers(text) TO authenticated;


-- 5.3 Hàm lấy chi tiết lịch sử khách hàng (Customer History grouped by Return Visits)
CREATE OR REPLACE FUNCTION public.get_customer_history(p_customer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res json;
BEGIN
  IF NOT public.is_my_account_active() THEN
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
                'owner', (
                  SELECT json_build_object(
                    'display_name', p.display_name,
                    'username', p.username,
                    'avatar_url', p.avatar_url
                  )
                  FROM public.profiles p
                  WHERE p.id = o.owner_id
                )
              ) ORDER BY o.booking_date DESC, o.created_at DESC
            )
            FROM public.orders o
            WHERE o.return_visit_id = v.id
          ), '[]'::json)
        ) ORDER BY v.visit_number DESC
      )
      FROM public.customer_return_visits v
      WHERE v.customer_id = p_customer_id
    ), '[]'::json)
  ) INTO v_res;

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_history(uuid) TO authenticated;


-- 6. MIGRATION & BACKFILL DỮ LIỆU ĐANG TỒN TẠI (Yêu cầu 20 & 21)
-- Giữ nguyên độc lập các đơn hàng đã có trong quá khứ, không tự động gộp (no deduplication).
-- Mỗi đơn hàng cũ sinh 1 bản ghi Customer và 1 bản ghi Return Visit #1 tương ứng.
-- ==============================================================================
DO $$
DECLARE
  r RECORD;
  new_cus_id uuid;
  new_visit_id uuid;
  new_cus_code text;
BEGIN
  FOR r IN 
    SELECT id, customer_name, customer_phone, customer_email, customer_country, created_at, updated_at 
    FROM public.orders 
    WHERE customer_id IS NULL 
    ORDER BY created_at ASC
  LOOP
    new_cus_id := gen_random_uuid();
    new_cus_code := 'CUS-' || upper(substr(md5(random()::text), 1, 6));

    -- Tạo Customer
    INSERT INTO public.customers (id, customer_code, full_name, phone, email, country, created_at, updated_at)
    VALUES (
      new_cus_id,
      new_cus_code,
      r.customer_name,
      r.customer_phone,
      r.customer_email,
      r.customer_country,
      r.created_at,
      r.updated_at
    );

    -- Tạo Return Visit #1
    new_visit_id := gen_random_uuid();
    INSERT INTO public.customer_return_visits (id, customer_id, visit_number, created_at, updated_at)
    VALUES (
      new_visit_id,
      new_cus_id,
      1,
      r.created_at,
      r.updated_at
    );

    -- Cập nhật order
    UPDATE public.orders
    SET customer_id = new_cus_id, return_visit_id = new_visit_id
    WHERE id = r.id;
  END LOOP;
END $$;
