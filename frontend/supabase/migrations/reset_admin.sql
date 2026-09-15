-- ==============================================================================
-- RESET / TẠO LẠI TÀI KHOẢN ADMIN THỦ CÔNG
-- ==============================================================================
-- Cách dùng: Copy toàn bộ nội dung file này, dán vào Supabase SQL Editor và bấm Run
-- Tài khoản: th0935057511@gmail.com | Mật khẩu: 1
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_email text  := 'th0935057511@gmail.com';
  v_admin_id    uuid;
BEGIN

  -- ── Bước 1: Tìm xem tài khoản đã tồn tại chưa ──────────────────────────────
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = v_admin_email
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    -- ── Bước 2a: Chưa có → tạo mới (đủ cột bắt buộc của auth.users) ─────────
    v_admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      last_sign_in_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt('1', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin System"}',
      false,
      now(),
      now(),
      now(),
      '', '', '', ''
    );

    RAISE NOTICE 'Đã tạo mới tài khoản auth: %', v_admin_email;

  ELSE
    -- ── Bước 2b: Đã có → chỉ reset mật khẩu và đảm bảo email đã xác thực ────
    UPDATE auth.users
    SET
      encrypted_password = crypt('1', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now()
    WHERE id = v_admin_id;

    RAISE NOTICE 'Đã reset mật khẩu tài khoản: %', v_admin_email;
  END IF;

  -- ── Bước 3: Upsert vào bảng profiles (đảm bảo role = admin) ───────────────
  INSERT INTO public.profiles (id, email, display_name, username, role, is_active)
  VALUES (
    v_admin_id,
    v_admin_email,
    'Admin System',
    'admin2026',
    'admin'::public.app_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
    SET role       = 'admin'::public.app_role,
        is_active  = true,
        updated_at = now();

  RAISE NOTICE 'Xong! Profile admin đã được đảm bảo.';

END $$;
