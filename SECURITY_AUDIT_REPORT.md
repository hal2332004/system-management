# Báo Cáo Khắc Phục Bảo Mật (Security Audit & Fixes)

## 1. Khắc Phục Lỗi Hardcoded Credentials (Lộ lọt Master Key)
**Vấn đề:** 
Lỗ hổng bảo mật nghiêm trọng liên quan đến việc vô tình làm lộ `VITE_SUPABASE_SERVICE_ROLE_KEY` tại Front-end (`frontend/.env`). Do có tiền tố `VITE_`, key này đã bị trình đóng gói (Vite) tự động "nhúng" (bake) vào bundle JavaScript (`dist/assets/index-*.js`) khi build production. Bất kỳ người dùng/Attacker nào cũng có thể trích xuất key này từ trình duyệt (F12) và chiếm toàn quyền điều khiển Database.

**Giải pháp:**
- Loại bỏ hoàn toàn biến `VITE_SUPABASE_SERVICE_ROLE_KEY` khỏi file `frontend/.env`.
- Loại bỏ đối tượng `supabaseAdmin` (sử dụng service role key) khỏi mã nguồn Front-end (`src/lib/supabase.ts`), ngăn chặn hoàn toàn nguy cơ tái sử dụng Master Key ở tầng Client.

## 2. Thiết Lập Kiến Trúc Secure Backend-First
**Vấn đề:**
Trước đây, ứng dụng cấp quyền cho trình duyệt trực tiếp thực hiện các lệnh quản trị cao cấp (như tạo tài khoản nhân viên, sửa đổi phân quyền role, khóa/mở khóa tài khoản) bằng cách gọi trực tiếp `supabaseAdmin.auth.admin...` hoặc tương tác thẳng với bảng `profiles`. Điều này phá vỡ mô hình bảo mật chuẩn, nơi mọi hành động leo thang đặc quyền phải được kiểm duyệt ở Back-end.

**Giải pháp:**
- Chuyển đổi toàn bộ logic này xuống Postgres Database thông qua các hàm RPC chạy với đặc quyền `SECURITY DEFINER` (chạy dưới quyền admin nhưng ẩn chi tiết với người gọi).
  - `admin_create_saler`
  - `admin_update_saler`
  - `admin_toggle_saler_active`
- Front-end (`App.tsx`) giờ đây chỉ đóng vai trò gọi lệnh RPC bằng Anon/Authenticated Token. Mọi kiểm tra phân quyền sẽ được Postgres DB tự động đảm nhận.

## 3. Ngăn Chặn Excessive Data Exposure (Lỗ hổng BOLA/API3:2023)
**Vấn đề:**
Quá trình rà soát phát hiện rất nhiều lệnh truy vấn sử dụng Wildcard Projection như `.select('*')` trong các file (ví dụ `App.tsx`, `ProfilePage.tsx`, `AdminSettingsPage.tsx`). Khi sử dụng Backend as a Service (như Supabase), việc truy vấn `select('*')` có nguy cơ trả về các trường dữ liệu nhạy cảm (hash mật khẩu nội bộ, log hệ thống, token riêng, v.v.) mà UI không cần đến nhưng Network (F12) lại phơi bày ra toàn bộ cho Attacker thấy.

**Giải pháp:**
- Thay thế triệt để toàn bộ các lệnh `.select('*')` bằng Specific Explicit Projections (chỉ lấy đích danh những trường phục vụ cho giao diện UI). Ví dụ:
  - **Profiles**: Chỉ truy xuất `.select("id, username, display_name, email, role, is_active, avatar_url, created_at, updated_at")`
  - **Orders**: Chỉ truy xuất các thông tin phục vụ bảng biểu `.select("id, order_code, owner_id, customer_id, return_visit_id, tour_name, customer_name, customer_phone, customer_email, booking_date, tour_date, status, tour_type, private_tour_name, private_tour_pdf_path, room_type, num_guests, rating, notes, customer_country, destinations, request_source, request_source_other, created_at, updated_at")`
  - **Tours/Room Types**: `.select('id, name, is_active, created_at, updated_at')`

---
*Báo cáo được khởi tạo và thực hiện khắc phục bởi AI Security Assistant (Vibe Coding).*
