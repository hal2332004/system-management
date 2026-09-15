-- ==============================================================================
-- TOURFLOW CRM - SUPABASE SCHEMA & RLS
-- ==============================================================================

-- Bật extension mã hóa để tạo mật khẩu admin
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TẠO ENUM (CUSTOM TYPES)
-- ==============================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'saler');
CREATE TYPE public.order_status AS ENUM ('new', 'confirmed', 'deposited', 'completed', 'cancelled');


-- 2. TẠO BẢNG (TABLES)
-- ==============================================================================

-- Bảng profiles (Liên kết 1-1 với auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  email text UNIQUE NOT NULL,
  role public.app_role DEFAULT 'saler'::public.app_role NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Bảng orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  owner_id uuid REFERENCES public.profiles(id) NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  tour_name text NOT NULL,
  booking_date date NOT NULL,
  tour_date date NOT NULL,
  status public.order_status DEFAULT 'new'::public.order_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Bảng activity_logs
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id),
  action_type text NOT NULL,
  description text NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now() NOT NULL
);


-- 3. BẬT BẢO MẬT (ENABLE RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;


-- 4. HÀM TRỢ GIÚP (HELPER FUNCTION)
-- ==============================================================================
-- Lấy role của user đang đăng nhập (tránh đệ quy vô hạn khi check RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Kiểm tra tài khoản hiện tại có đang hoạt động (is_active = true) hay không
CREATE OR REPLACE FUNCTION public.is_my_account_active()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce((SELECT is_active FROM public.profiles WHERE id = auth.uid()), false);
$$;


-- 5. PHÂN QUYỀN (RLS POLICIES)
-- ==============================================================================

-- [PROFILES]
CREATE POLICY "Admins can do everything on profiles" ON public.profiles FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- [ORDERS]
CREATE POLICY "Admins can do everything on orders" ON public.orders FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "Salers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = owner_id AND public.is_my_account_active());
CREATE POLICY "Salers can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_my_account_active());
CREATE POLICY "Salers can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = owner_id AND public.is_my_account_active());
CREATE POLICY "Salers can delete their own orders" ON public.orders FOR DELETE USING (auth.uid() = owner_id AND public.is_my_account_active());

-- [ACTIVITY LOGS]
CREATE POLICY "Admins can read all activity logs" ON public.activity_logs FOR SELECT USING (get_my_role() = 'admin');
CREATE POLICY "Anyone can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = actor_id);


-- 6. TỰ ĐỘNG HÓA (TRIGGERS)
-- ==============================================================================

-- Trigger 1: Tự động tạo profile khi user đăng ký. 
-- NẾU email là th0935057511@gmail.com THÌ cấp quyền admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, username, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4),
    CASE 
      WHEN new.email = 'th0935057511@gmail.com' THEN 'admin'::public.app_role 
      ELSE 'saler'::public.app_role 
    END
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Trigger 2: Tự động cập nhật `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- Trigger 3: Tự động sinh mã đơn hàng (Ví dụ: ORD-A1B2C3)
CREATE OR REPLACE FUNCTION public.handle_new_order_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_code := 'ORD-' || upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_created BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_new_order_code();


-- Trigger 4: Tự động ghi nhật ký vào Activity Logs
CREATE OR REPLACE FUNCTION public.log_order_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_desc text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create_order';
    v_desc := 'Tạo đơn hàng mới: ' || NEW.order_code;
    INSERT INTO public.activity_logs (actor_id, action_type, description) VALUES (NEW.owner_id, v_action, v_desc);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Nếu status thay đổi thì log trạng thái mới, không thì log cập nhật chung
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'update_status';
        v_desc := 'Cập nhật trạng thái đơn ' || NEW.order_code || ' thành ' || NEW.status;
    ELSE
        v_action := 'update_order';
        v_desc := 'Cập nhật thông tin đơn hàng ' || NEW.order_code;
    END IF;
    INSERT INTO public.activity_logs (actor_id, action_type, description) VALUES (NEW.owner_id, v_action, v_desc);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete_order';
    v_desc := 'Xóa đơn hàng ' || OLD.order_code;
    INSERT INTO public.activity_logs (actor_id, action_type, description) VALUES (auth.uid(), v_action, v_desc);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_order_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_order_changes();


-- 7. RPC FUNCTIONS
-- ==============================================================================
-- Function tra cứu email an toàn từ username cho cả anon và authenticated
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;

