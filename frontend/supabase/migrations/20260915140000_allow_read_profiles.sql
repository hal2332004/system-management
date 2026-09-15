-- ==============================================================================
-- Migration: Cho phép người dùng đã đăng nhập xem profile người khác (để đọc tên, avatar)
-- ==============================================================================

-- 1. Xóa chính sách cũ chỉ cho phép xem profile của chính mình
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Tạo chính sách mới: Bất kỳ user nào đã đăng nhập đều có thể SELECT bảng profiles
-- Điều này giúp Saler có thể thấy tên và ảnh đại diện của Admin/đồng nghiệp trong thông báo và lịch sử hoạt động
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
