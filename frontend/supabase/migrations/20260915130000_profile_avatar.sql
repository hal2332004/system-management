-- ==============================================================================
-- Migration: Bổ sung avatar_url cho profiles và khởi tạo Storage bucket avatars
-- ==============================================================================

-- 1. Bổ sung cột avatar_url vào bảng profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- 2. Khởi tạo bucket avatars trong storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 3. Cấu hình RLS Policies cho storage.objects với bucket avatars
DROP POLICY IF EXISTS "Avatar Images Public Select" ON storage.objects;
CREATE POLICY "Avatar Images Public Select"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Images Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Images Insert" ON storage.objects;
CREATE POLICY "Avatar Images Insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Images Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Images Update" ON storage.objects;
CREATE POLICY "Avatar Images Update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Images Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Images Delete" ON storage.objects;
CREATE POLICY "Avatar Images Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');
