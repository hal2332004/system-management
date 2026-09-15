# Product Requirements Document (PRD) — TourFlow CRM

**Tên sản phẩm:** TourFlow CRM — Hệ Thống Quản Lý Đơn Tour Du Lịch Nội Bộ  
**Phiên bản:** 2.1  
**Trạng thái:** Đã hoàn thiện tính năng cốt lõi (Production-ready)  
**Ngày cập nhật:** 10/09/2026  

---

## 1. Bối cảnh & Tầm nhìn Sản phẩm

### 1.1 Vấn đề nghiệp vụ
Trong các doanh nghiệp kinh doanh tour du lịch, việc quản lý yêu cầu đặt tour (booking requests) thường gặp các thách thức:
- Đơn tour bị phân tán trên nhiều kênh chat, bảng tính Excel, dễ dẫn đến thất lạc khách hàng.
- Thiếu cơ chế phân quyền bảo mật, nguy cơ lộ data khách hàng giữa các nhân viên Sale.
- Quản trị viên khó nắm bắt tức thì tỷ lệ chốt đơn, tiến độ xử lý và doanh số tour theo thời gian thực.
- Khó khăn trong việc tra cứu theo cả hai mốc: ngày khách đặt tour (để đối soát sale) và ngày khách khởi hành (để điều hành hướng dẫn viên và dịch vụ).

### 1.2 Giải pháp — TourFlow CRM
TourFlow CRM là phần mềm nội bộ chuyên biệt, mang lại giải pháp toàn diện:
- Tập trung hóa dữ liệu đơn tour vào một nền tảng duy nhất với giao diện Dark/Light hiện đại.
- Cơ chế bảo mật cách ly cấp cơ sở dữ liệu (**PostgreSQL Row-Level Security**): Nhân viên Sale chỉ quản lý đơn của chính mình; Quản trị viên nắm toàn quyền hệ thống.
- Tra cứu đa chiều với bộ lọc thông minh: ngày đặt, ngày đi tour, ngày cụ thể, trạng thái đơn và nhân viên sale.

---

## 2. Đối tượng Người dùng & Ma trận Phân quyền

Hệ thống quản trị truy cập theo vai trò (Role-Based Access Control - RBAC) chặt chẽ:

| Chức năng / Quyền hạn | Nhân viên Sale (`saler`) | Quản trị viên (`admin`) |
|-----------------------|:-----------------------:|:-----------------------:|
| Đăng nhập hệ thống (Username/Email + Password) | ✅ | ✅ |
| Đổi mật khẩu cá nhân (cần mật khẩu cũ) | ✅ | ✅ |
| Quên mật khẩu / Đặt lại qua email | ✅ | ✅ |
| Tạo đơn tour mới (`/orders/new`) | ✅ | ❌ *(Ủy quyền cho Sale)* |
| Xem danh sách đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Toàn bộ đơn hệ thống)* |
| Xem chi tiết đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Mọi đơn tour)* |
| Chỉnh sửa đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Mọi đơn tour)* |
| **Xóa đơn tour** | **✅ *(Chỉ đơn của mình)*** | **✅ *(Mọi đơn tour)*** |
| Tìm kiếm theo Nhân viên Sale | ❌ | ✅ |
| Bảng điều khiển tổng quan (Dashboard thống kê) | ❌ | ✅ |
| Xem danh sách đội ngũ Sale | ❌ | ✅ |
| Tạo tài khoản Nhân viên Sale (tự sinh username) | ❌ | ✅ |
| Kích hoạt / Tạm khóa tài khoản Sale (`is_active`) | ❌ | ✅ |
| Đặt lại mật khẩu cho Nhân viên Sale | ❌ | ✅ |
| Theo dõi nhật ký hoạt động hệ thống (Activity Logs) | ❌ | ✅ |

---

## 3. User Stories & Tiêu chí Nghiệp vụ

### 3.1 Nhóm Nhân viên Sale (Saler)

#### US-S01: Tạo đơn tour mới
- **Mô tả:** Là một Saler, tôi muốn tạo đơn tour mới bằng cách nhập đầy đủ thông tin khách hàng và hành trình để lưu trữ trên hệ thống.
- **Tiêu chí chấp nhận (AC):**
  - Các trường bắt buộc: Họ và tên khách, Số điện thoại, Tên tour, Ngày đặt, Ngày đi tour, Trạng thái.
  - Trường tùy chọn: Email khách hàng, Ghi chú đặc biệt.
  - Ràng buộc ngày: `Ngày đi tour` phải lớn hơn hoặc bằng `Ngày đặt`.
  - Hệ thống tự sinh mã đơn duy nhất định dạng `ORD-XXXXXX` (6 ký tự ngẫu nhiên).
  - Tự động gán `owner_id` là user đang đăng nhập.

#### US-S02: Xem & Tra cứu đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi muốn xem danh sách các đơn do mình tạo để theo dõi tiến độ chăm sóc khách hàng.
- **Tiêu chí chấp nhận (AC):**
  - Chỉ trả về danh sách đơn có `owner_id = auth.uid()`.
  - Hỗ trợ tìm kiếm theo Tên khách hàng, Số điện thoại, Email, Tên tour.
  - Hỗ trợ lọc trạng thái (Mới, Đã xác nhận, Đã cọc, Hoàn thành, Đã hủy).
  - Hỗ trợ lọc thời gian linh hoạt (Ngày đặt hoặc Ngày đi tour).

#### US-S03: Chỉnh sửa đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi muốn cập nhật thông tin đơn hàng khi khách đổi lịch trình hoặc đặt cọc.
- **Tiêu chí chấp nhận (AC):**
  - Saler có thể sửa mọi thông tin của đơn tour mình sở hữu.
  - Không thể chỉnh sửa đơn của Saler khác (bảo vệ kép tại Frontend và Database RLS).

#### US-S04: Xóa đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi có quyền xóa đơn tour của chính mình khi đơn bị hủy, nhập trùng hoặc là đơn rác thử nghiệm.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị nút biểu tượng thùng rác màu đỏ trên từng dòng đơn tại trang danh sách và trang chi tiết đơn.
  - Bắt buộc hiển thị pop-up xác nhận `Bạn có chắc chắn muốn xóa đơn tour [mã_đơn]?`.
  - Database RLS kiểm tra `auth.uid() = owner_id` và `is_my_account_active() = true`. Nếu cố tình xóa đơn của người khác, Database từ chối ngay lập tức.

---

### 3.2 Nhóm Quản trị viên (Admin)

#### US-A01: Bảng điều khiển Giám sát (Executive Dashboard)
- **Mô tả:** Là Admin, tôi muốn xem các chỉ số KPI và biểu đồ hiệu suất để đánh giá tốc độ bán hàng.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị 4 thẻ KPI:
    - **Tổng đơn tour** (kèm xu hướng so với tháng trước).
    - **Đơn đang xử lý** (gồm Mới, Đã xác nhận, Đã cọc).
    - **Hoàn thành** (số lượng đơn tour thành công).
    - **Tỷ lệ hoàn thành** (tính bằng % trên tổng số đơn).
  - Biểu đồ phân bổ trạng thái đơn (thanh tiến trình màu sắc trực quan).
  - Biểu đồ xu hướng đơn tour dạng sóng theo 7 ngày hoặc 30 ngày.
  - Bảng điều khiển tinh gọn, tập trung số liệu thống kê (không hiển thị lặp lại danh sách đơn để tối ưu không gian).

#### US-A02: Quản trị toàn bộ đơn tour hệ thống
- **Mô tả:** Là Admin, tôi muốn xem, lọc và can thiệp mọi đơn tour trong doanh nghiệp.
- **Tiêu chí chấp nhận (AC):**
  - Xem toàn bộ đơn tour của tất cả nhân viên.
  - Cột `NHÂN VIÊN SALE` hiển thị avatar 2 chữ cái viết tắt và tên nhân viên phụ trách.
  - Bộ lọc tìm kiếm có thêm ô tìm kiếm theo tên hoặc username của Nhân viên Sale.
  - Toàn quyền xem, chỉnh sửa hoặc xóa bất kỳ đơn tour nào trong hệ thống.

#### US-A03: Quản trị tài khoản Nhân viên Sale
- **Mô tả:** Là Admin, tôi muốn tạo mới tài khoản cho nhân viên mới và kiểm soát quyền truy cập của đội ngũ.
- **Tiêu chí chấp nhận (AC):**
  - Tạo nhân viên mới: nhập Họ tên, Email, Mật khẩu. Hệ thống tự động chuẩn hóa và sinh username (ví dụ: `nguyen.van.an.3k2j`).
  - Kích hoạt / Tạm khóa tài khoản (`is_active`): Khi bị khóa, tài khoản của Sale ngay lập tức bị đăng xuất và không thể đăng nhập lại.
  - Đặt lại mật khẩu: Admin có thể cấp mật khẩu mới trực tiếp cho nhân viên khi nhân viên quên mà không cần qua email.

#### US-A04: Theo dõi Hoạt động Hệ thống (Activity Logs)
- **Mô tả:** Là Admin, tôi muốn xem nhật ký hành động để kiểm soát an toàn thông tin nội bộ.
- **Tiêu chí chấp nhận (AC):**
  - Ghi nhận hành động: Đăng nhập (`login`), Cập nhật đơn (`update_order`), Tạo mới, Lỗi (`error`).
  - Hiển thị người thực hiện, mô tả hành động, giờ thực hiện theo thời gian thực (LIVE indicator).

---

## 4. Yêu cầu Chi tiết về Bộ lọc Thời gian (Advanced Date Filters)

Hệ thống giải quyết triệt để bài toán đối soát tour du lịch bằng cơ chế lọc kép:

### 4.1 Loại ngày lọc (Date Type Selector)
Người dùng chuyển đổi linh hoạt giữa:
- **Ngày đặt (Booking Date):** Lọc theo thời điểm khách hàng gửi yêu cầu / chốt cọc.
- **Ngày đi tour (Tour Date):** Lọc theo ngày khách hàng thực tế khởi hành tour du lịch.

### 4.2 Các mốc thời gian (Presets & Specific Day)
1. **Hôm nay (Today):** Từ `00:00:00` đến `23:59:59` của ngày hiện tại.
2. **Hôm qua (Yesterday):** Toàn bộ ngày hôm trước.
3. **7 ngày qua (7 Days):** Trong vòng 7 ngày gần nhất đến hết ngày hôm nay.
4. **30 ngày qua (30 Days):** Trong vòng 30 ngày gần nhất đến hết ngày hôm nay.
5. **Tháng này (This Month):** Từ ngày 01 đến ngày cuối cùng của tháng hiện tại (bao gồm cả các ngày trong tương lai của tháng này).
6. **Tháng trước (Last Month):** Toàn bộ các ngày trong tháng trước.
7. **Ngày cụ thể (Specific Day Picker):** Chọn chính xác 1 ngày bất kỳ qua bảng lịch mini. Tự động hủy chọn khi người dùng bấm vào các tiêu chí preset khác.

---

## 5. Kiến trúc Cơ sở Dữ liệu (Database Schema & RLS)

### 5.1 Bảng `profiles`
Lưu trữ thông tin bổ trợ liên kết 1-1 với `auth.users` của Supabase:

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| `id` | `uuid` | PK, REFERENCES `auth.users(id)` | ID định danh người dùng |
| `username` | `text` | UNIQUE, NOT NULL | Tên đăng nhập nội bộ |
| `display_name`| `text` | NOT NULL | Tên hiển thị của nhân viên |
| `email` | `text` | UNIQUE, NOT NULL | Email liên hệ / đăng nhập |
| `role` | `app_role` | NOT NULL, DEFAULT `'saler'` | Vai trò (`admin` hoặc `saler`) |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Trạng thái hoạt động tài khoản |
| `created_at` | `timestamptz`| NOT NULL, DEFAULT `now()` | Thời điểm tạo |
| `updated_at` | `timestamptz`| NOT NULL, DEFAULT `now()` | Thời điểm cập nhật |

### 5.2 Bảng `orders`
Lưu trữ toàn bộ đơn tour du lịch:

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID định danh đơn tour |
| `order_code` | `text` | UNIQUE, NOT NULL | Mã đơn (vd: `ORD-A27B79`) |
| `owner_id` | `uuid` | FK REFERENCES `profiles(id)` | Nhân viên phụ trách đơn |
| `customer_name` | `text` | NOT NULL | Họ và tên khách hàng |
| `customer_phone` | `text` | NOT NULL | Số điện thoại liên hệ |
| `customer_email` | `text` | NULLABLE | Email khách hàng |
| `tour_name` | `text` | NOT NULL | Tên chương trình tour |
| `booking_date` | `date` | NOT NULL | Ngày đặt tour |
| `tour_date` | `date` | NOT NULL | Ngày khởi hành tour |
| `status` | `order_status` | NOT NULL, DEFAULT `'new'` | Trạng thái xử lý |
| `notes` | `text` | NULLABLE | Ghi chú yêu cầu đặc biệt |
| `created_at` | `timestamptz`| NOT NULL, DEFAULT `now()` | Thời điểm tạo đơn |
| `updated_at` | `timestamptz`| NOT NULL, DEFAULT `now()` | Thời điểm cập nhật đơn |

**Enum `order_status`:** `'new'`, `'confirmed'`, `'deposited'`, `'completed'`, `'cancelled'`.

### 5.3 Bảng `activity_logs`
Lưu nhật ký hành động hệ thống:

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID nhật ký |
| `actor_id` | `uuid` | FK REFERENCES `profiles(id)` | Người thực hiện |
| `action_type` | `text` | NOT NULL | Loại hành động (`login`, `update_order`...) |
| `description` | `text` | NOT NULL | Nội dung chi tiết |
| `ip_address` | `text` | NULLABLE | Địa chỉ IP |
| `created_at` | `timestamptz`| NOT NULL, DEFAULT `now()` | Thời điểm ghi log |

---

## 6. Yêu cầu Phi chức năng (Non-Functional Requirements)

1. **Hiệu năng:** Tốc độ phản hồi tìm kiếm đơn tour và chuyển đổi tab < 200ms thông qua useMemo và client-side cache.
2. **Khả năng tương thích:** Tương thích hoàn hảo trên các trình duyệt hiện đại (Chrome, Edge, Safari, Firefox) và responsive trên máy tính bàn, máy tính bảng và thiết bị di động.
3. **Độ tin cậy giao diện:** Giao diện Sáng (Light) và Tối (Dark) tuân thủ tiêu chuẩn tương phản WCAG AA, đảm bảo văn bản luôn rõ ràng, sắc nét, không bị lóa hay chìm màu.
4. **Tính nhất quán:** Toàn bộ thông báo xác nhận và thông báo lỗi hiển thị bằng tiếng Việt chuẩn mực, thân thiện với người dùng.