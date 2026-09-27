-- ==============================================================================
-- Migration: Thêm loại tour (Tour grupal / Tour privado) và Supabase Storage cho PDF chương trình tour
-- ==============================================================================

-- 1. Bổ sung các cột vào bảng public.orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tour_type text NOT NULL DEFAULT 'grupal' CHECK (tour_type IN ('grupal', 'privado')),
ADD COLUMN IF NOT EXISTS private_tour_name text,
ADD COLUMN IF NOT EXISTS private_tour_pdf_path text;

-- 2. Tạo bucket private-tour-programs trong storage.buckets
-- Bucket là private (public = false), giới hạn file 20MB, chỉ chấp nhận file application/pdf
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'private-tour-programs',
  'private-tour-programs',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf'];

-- 3. Cấu hình RLS Policies cho storage.objects với bucket private-tour-programs

-- SELECT: Chỉ Admin hoặc Saler sở hữu đơn hàng mới có thể đọc/tạo signed URL cho file
DROP POLICY IF EXISTS "Private Tour Programs Select" ON storage.objects;
DROP POLICY IF EXISTS "Private Tour Programs Authenticated Select" ON storage.objects;
CREATE POLICY "Private Tour Programs Authenticated Select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'private-tour-programs'
  AND public.is_my_account_active()
  AND (
    public.get_my_role() = 'admin'
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.orders WHERE owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE private_tour_pdf_path = storage.objects.name
      AND owner_id = auth.uid()
    )
  )
);

-- INSERT: Người dùng đăng nhập có tài khoản hoạt động có thể upload file vào bucket
DROP POLICY IF EXISTS "Private Tour Programs Insert" ON storage.objects;
DROP POLICY IF EXISTS "Private Tour Programs Authenticated Insert" ON storage.objects;
CREATE POLICY "Private Tour Programs Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'private-tour-programs'
  AND public.is_my_account_active()
);

-- UPDATE: Chỉ Admin hoặc người sở hữu đơn mới có thể cập nhật file
DROP POLICY IF EXISTS "Private Tour Programs Update" ON storage.objects;
DROP POLICY IF EXISTS "Private Tour Programs Authenticated Update" ON storage.objects;
CREATE POLICY "Private Tour Programs Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'private-tour-programs'
  AND public.is_my_account_active()
  AND (
    public.get_my_role() = 'admin'
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.orders WHERE owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE private_tour_pdf_path = storage.objects.name
      AND owner_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'private-tour-programs'
  AND public.is_my_account_active()
);

-- DELETE: Chỉ Admin hoặc người sở hữu đơn mới có thể xóa file
DROP POLICY IF EXISTS "Private Tour Programs Delete" ON storage.objects;
DROP POLICY IF EXISTS "Private Tour Programs Authenticated Delete" ON storage.objects;
CREATE POLICY "Private Tour Programs Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'private-tour-programs'
  AND public.is_my_account_active()
  AND (
    public.get_my_role() = 'admin'
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.orders WHERE owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE private_tour_pdf_path = storage.objects.name
      AND owner_id = auth.uid()
    )
  )
);
