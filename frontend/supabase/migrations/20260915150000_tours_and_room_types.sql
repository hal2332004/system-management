-- Migration: Add tours, room_types tables and room_type column in orders

-- 1. Add room_type column to orders table if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS room_type text;

-- 2. Create tours table
CREATE TABLE IF NOT EXISTS public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create room_types table
CREATE TABLE IF NOT EXISTS public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for tours
DROP POLICY IF EXISTS "Allow authenticated read tours" ON public.tours;
CREATE POLICY "Allow authenticated read tours" ON public.tours 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins full access tours" ON public.tours;
CREATE POLICY "Admins full access tours" ON public.tours 
  FOR ALL TO authenticated 
  USING (public.get_my_role() = 'admin') 
  WITH CHECK (public.get_my_role() = 'admin');

-- 6. RLS Policies for room_types
DROP POLICY IF EXISTS "Allow authenticated read room_types" ON public.room_types;
CREATE POLICY "Allow authenticated read room_types" ON public.room_types 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins full access room_types" ON public.room_types;
CREATE POLICY "Admins full access room_types" ON public.room_types 
  FOR ALL TO authenticated 
  USING (public.get_my_role() = 'admin') 
  WITH CHECK (public.get_my_role() = 'admin');

-- 7. Seed 22 predefined tours
INSERT INTO public.tours (name) VALUES
  ('10 DIAS - TAILANDIA'),
  ('16 DIAS - BALI Y TAILANDIA'),
  ('BALI - VN NORTE Y CENTRO - THAI - 20 DIAS'),
  ('BALI - VN - CAM - THAI - 23 DIAS'),
  ('BALI - VN NORTE - THAI - 20 DIAS'),
  ('CHINA VIETNAM Y TAILANDIA EN GRUPO - 21 DIAS'),
  ('CHINA Y VIETNAM EN GRUPO - 16 DIAS'),
  ('VIETNAM - CAM - 15 DIAS'),
  ('VIETNAM - CAM 11 DIAS'),
  ('VIETNAM - CAM 13 DIAS'),
  ('VIETNAM Y TAILANDIA - 15 dias'),
  ('VN - CAM - THAI - 15 DIAS'),
  ('VN - CAM - THAI - 16 DIAS'),
  ('VN - CAM - THAI - 18 DIAS'),
  ('VN - CAM - THAI - 19 DIAS'),
  ('VN 10 DIAS'),
  ('VN 12 DIAS'),
  ('VN 5 DIAS'),
  ('VN 8 DIAS'),
  ('VN 9 DIAS'),
  ('VN EN TREN - 11 DIAS'),
  ('VN Y CAMBOYA EN TREN - 13 DIAS')
ON CONFLICT (name) DO NOTHING;

-- 8. Seed common room types
INSERT INTO public.room_types (name) VALUES
  ('Phòng đơn (Single Room)'),
  ('Phòng đôi (Double Room)'),
  ('Phòng 2 giường đơn (Twin Room)'),
  ('Phòng ba (Triple Room)'),
  ('Phòng gia đình (Family Suite)'),
  ('Villa / Bungalow')
ON CONFLICT (name) DO NOTHING;
