-- ==============================================================================
-- UPDATE ORDER STATUSES ENUM & DATA MIGRATION
-- Mới (new), Đang tư vấn (consulting), Đã chốt (closed), Đã hủy (cancelled)
-- ==============================================================================

-- 1. Tạo kiểu ENUM mới
CREATE TYPE public.order_status_new AS ENUM ('new', 'consulting', 'closed', 'cancelled');

-- 2. Tạm bỏ giá trị mặc định của cột status
ALTER TABLE public.orders 
  ALTER COLUMN status DROP DEFAULT;

-- 3. Chuyển đổi cột status sang kiểu ENUM mới và ánh xạ dữ liệu cũ
ALTER TABLE public.orders 
  ALTER COLUMN status TYPE public.order_status_new 
  USING (
    CASE status::text
      WHEN 'confirmed' THEN 'consulting'::public.order_status_new
      WHEN 'deposited' THEN 'consulting'::public.order_status_new
      WHEN 'completed' THEN 'closed'::public.order_status_new
      WHEN 'closed' THEN 'closed'::public.order_status_new
      WHEN 'consulting' THEN 'consulting'::public.order_status_new
      WHEN 'cancelled' THEN 'cancelled'::public.order_status_new
      ELSE 'new'::public.order_status_new
    END
  );

-- 4. Đặt lại giá trị mặc định là 'new'
ALTER TABLE public.orders 
  ALTER COLUMN status SET DEFAULT 'new'::public.order_status_new;

-- 5. Xóa kiểu ENUM cũ và đổi tên ENUM mới thành order_status
DROP TYPE public.order_status;
ALTER TYPE public.order_status_new RENAME TO order_status;
