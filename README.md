# TourFlow CRM — Hệ Thống Quản Lý Đơn Tour

**TourFlow CRM** là giải pháp phần mềm quản lý bán hàng và điều hành đơn tour du lịch nội bộ, được thiết kế chuyên biệt cho đội ngũ **Nhân viên Sale (Saler)** và **Quản trị viên (Admin)**.

Hệ thống cung cấp trải nghiệm làm việc mượt mà, phân quyền bảo mật chặt chẽ ở cấp độ cơ sở dữ liệu (Row-Level Security), hỗ trợ chế độ giao diện Sáng / Tối (Light/Dark Mode), cùng hệ thống lọc đơn và báo cáo hiệu suất trực quan theo thời gian thực.

---

## 📑 Mục lục

1. [Kiến trúc & Công nghệ](#kiến-trúc--công-nghệ)
2. [Phân quyền Người dùng (User Roles)](#phân-quyền-người-dùng-user-roles)
3. [Tính năng Cốt lõi (Core Features)](#tính-năng-cốt-lõi-core-features)
4. [Bảo mật & Phân quyền Dữ liệu (Database RLS)](#bảo-mật--phân-quyền-dữ-liệu-database-rls)
5. [Cơ chế Xác thực & Quản lý Mật khẩu](#cơ-chế-xác-thực--quản-lý-mật-khẩu)
6. [Hệ thống Màn hình Giao diện (UI Screens)](#hệ-thống-màn-hình-giao-diện-ui-screens)
7. [Hướng dẫn Cài đặt & Triển khai](#hướng-dẫn-cài-đặt--triển-khai)

---

## 🛠 Kiến trúc & Công nghệ

| Thành phần | Công nghệ / Nền tảng | Chi tiết |
|------------|----------------------|----------|
| **Frontend Framework** | React 18 + TypeScript | SPA nhanh, an toàn kiểu dữ liệu |
| **Build Tool & Bundler** | Vite | Tối ưu hóa build bundle, HMR cực nhanh |
| **Routing** | React Router v6 | Quản lý điều hướng client-side và Protected Routes |
| **Styling** | Vanilla CSS + CSS Variables | Hỗ trợ Light / Dark Mode tức thì, responsive đa thiết bị |
| **Icons** | Lucide React | Bộ icon hiện đại, tối giản |
| **Backend & Database** | Supabase (PostgreSQL 15) | Database quan hệ, Auth, Trigger, RPC |
| **Bảo mật dữ liệu** | Row Level Security (RLS) | Bảo vệ và cách ly dữ liệu trực tiếp tại PostgreSQL |

### Sơ đồ luồng kiến trúc

```
┌──────────────────────────────────────────────────────────┐
│                   Trình duyệt (Client)                   │
│         React 18 + TypeScript + CSS Variables            │
│         (Hỗ trợ Light Mode & Dark Mode tức thì)          │
└────────────┬─────────────────────────────────────────────┘
             │ 
             │ REST API / WebSockets (Supabase JS Client)
             ▼
┌──────────────────────────────────────────────────────────┐
│                     Supabase BaaS                        │
│  ├── Supabase Auth (Đăng nhập, Session, Recovery Token)  │
│  ├── PostgreSQL Database                                 │
│  │    ├── profiles (Thông tin nhân viên, vai trò, khóa)  │
│  │    ├── orders (Đơn tour, ngày đặt, ngày tour, status) │
│  │    └── activity_logs (Nhật ký hành động hệ thống)     │
│  └── Row Level Security (RLS Policies)                   │
│       ├── Kiểm tra quyền Admin / Saler                   │
│       ├── Kiểm tra trạng thái is_active                  │
│       └── Cách ly đơn tour theo owner_id                 │
└──────────────────────────────────────────────────────────┘
```

---

## 👥 Phân quyền Người dùng (User Roles)

Hệ thống phân cấp 2 nhóm người dùng với ranh giới trách nhiệm và quyền hạn rõ ràng:

### 1. Nhân viên Sale (`saler`)
- **Tạo đơn tour:** Nhập khách hàng, SĐT, email, tên tour, ngày đặt, ngày đi tour, trạng thái, ghi chú.
- **Quản lý đơn cá nhân:** Xem danh sách, tìm kiếm, lọc đơn do chính mình tạo.
- **Chỉnh sửa đơn của mình:** Cập nhật thông tin khách hàng, ngày đi tour, trạng thái tour.
- **Quyền xóa đơn tour của mình:** Nhân viên Sale có toàn quyền xóa các đơn tour do chính mình sở hữu khi có yêu cầu hủy hoặc dọn dẹp dữ liệu rác (hệ thống có cảnh báo xác nhận trước khi xóa).
- **Cách ly dữ liệu:** Không thể xem, chỉnh sửa hoặc xóa đơn tour của nhân viên Sale khác.

### 2. Quản trị viên (`admin`)
- **Bảng điều khiển (Dashboard):** Xem tổng quan 4 chỉ số KPI, biểu đồ phân bổ trạng thái và biểu đồ xu hướng đơn tour toàn doanh nghiệp.
- **Quản lý toàn bộ đơn tour:** Xem, tìm kiếm theo nhân viên phụ trách, lọc đa tiêu chí, chỉnh sửa hoặc xóa bất kỳ đơn tour nào.
- **Quản lý đội ngũ Sale:** Tạo tài khoản mới (tự sinh username chuẩn hóa), kích hoạt / tạm khóa tài khoản nhân viên, đổi mật khẩu cho nhân viên.
- **Nhật ký hệ thống:** Theo dõi toàn bộ hoạt động đăng nhập, tạo/sửa đơn tour theo thời gian thực.

---

## 🚀 Tính năng Cốt lõi (Core Features)

### 1. Giao diện Đa chế độ (Light & Dark Theme)
- Chuyển đổi linh hoạt giữa giao diện Tối (Dark Navy) và giao diện Sáng (Slate Crisp Clean).
- Nút bấm biểu tượng **Mặt trời (Sun ☀️) / Mặt trăng (Moon 🌙)** hiển thị cố định ngay trên thanh **Topbar** đầu trang và trong menu tài khoản.
- Tự động ghi nhớ tùy chọn vào `localStorage`.

### 2. Thanh điều hướng thông minh (Sticky Layout)
- **Sidebar ghim cố định (`position: sticky; height: 100vh;`):** Menu bên trái không bị trôi khi cuộn xem danh sách dài.
- **Huy hiệu Admin / Sale trên Topbar:** Hiển thị tên tài khoản và vai trò (`Admin System · Quản trị viên`) ngay góc trên cùng bên phải, không cần cuộn trang để tìm.

### 3. Bộ lọc Đơn tour Nâng cao (Advanced Filtering)
- **Tìm kiếm đa trường:** Tên khách hàng, Số điện thoại, Email, Tên tour, Nhân viên phụ trách (dành cho Admin).
- **Lọc theo loại ngày:** Tùy chọn lọc theo **Ngày đặt** (Booking Date) hoặc **Ngày đi tour** (Tour Date).
- **Khoảng thời gian nhanh:** Hôm nay, Hôm qua, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước.
- **Chọn ngày cụ thể (Calendar Picker):** Chọn chính xác 1 ngày bất kỳ trong quá khứ hoặc tương lai, tự động xóa tiêu chí cũ khi chọn bộ lọc khác.

### 4. Quyền Xóa Đơn Tour Cho Saler
- Saler có quyền xóa đơn tour của chính mình tại trang danh sách và trang chi tiết đơn.
- Tích hợp hộp thoại xác nhận an toàn trước khi xóa.
- Được bảo vệ bằng chính sách RLS ở tầng database (chỉ xóa được nếu `auth.uid() = owner_id`).

---

## 🔒 Bảo mật & Phân quyền Dữ liệu (Database RLS)

Toàn bộ logic bảo mật được thực thi bằng **Row Level Security (RLS)** trên PostgreSQL, ngăn chặn can thiệp trái phép ngay cả khi gọi trực tiếp qua API:

```sql
-- Saler chỉ xem được đơn của mình và khi tài khoản đang hoạt động
CREATE POLICY "Salers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler chỉ tạo được đơn với owner_id là chính mình
CREATE POLICY "Salers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler chỉ cập nhật được đơn của mình
CREATE POLICY "Salers can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler có quyền xóa đơn của chính mình
CREATE POLICY "Salers can delete their own orders" ON public.orders
  FOR DELETE USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Admin có toàn quyền trên toàn bộ bảng đơn tour
CREATE POLICY "Admins can do everything on orders" ON public.orders
  FOR ALL USING (get_my_role() = 'admin');
```

---

## 🔐 Cơ chế Xác thực & Quản lý Mật khẩu

Hệ thống tách biệt rõ ràng 2 luồng quản lý mật khẩu:

| Tiêu chí | Đổi mật khẩu (Settings) | Đặt lại mật khẩu (Forgot Password) |
|----------|-------------------------|-----------------------------------|
| **Ngữ cảnh** | Người dùng đang đăng nhập trong hệ thống | Người dùng quên mật khẩu, không thể đăng nhập |
| **Đường dẫn** | `/settings/change-password` | `/forgot-password` → `/reset-password` |
| **Cơ chế xác thực** | Yêu cầu nhập đúng Mật khẩu hiện tại | Nhận email chứa Token Recovery từ Supabase |
| **Số trường nhập** | 3 ô (Mật khẩu cũ, Mật khẩu mới, Xác nhận) | 2 ô (Mật khẩu mới, Xác nhận mật khẩu mới) |

---

## 🖥 Hệ thống Màn hình Giao diện (UI Screens)

| Đường dẫn | Tên màn hình | Đối tượng | Mô tả |
|-----------|--------------|-----------|-------|
| `/login` | Đăng nhập | Tất cả | Đăng nhập bằng username/email + mật khẩu |
| `/forgot-password` | Quên mật khẩu | Tất cả | Nhập email nhận link đặt lại mật khẩu |
| `/reset-password` | Đặt mật khẩu mới | Tất cả | Đặt lại mật khẩu qua liên kết xác thực email |
| `/dashboard` | Bảng điều khiển | Admin | 4 thẻ KPI, biểu đồ trạng thái, biểu đồ xu hướng |
| `/admin/orders` | Tất cả đơn tour | Admin | Bảng quản lý toàn bộ đơn tour, bộ lọc đa năng |
| `/orders` | Đơn tour của tôi | Saler | Quản lý, lọc, xem, sửa và xóa đơn của chính mình |
| `/orders/new` | Tạo đơn mới | Saler | Form nhập thông tin khách và đơn tour |
| `/orders/:id` | Chi tiết đơn | Cả hai | Xem thông tin chi tiết, chỉnh sửa hoặc xóa đơn |
| `/orders/:id/edit`| Chỉnh sửa đơn | Cả hai | Cập nhật thông tin đơn tour |
| `/admin/salers` | Nhân viên Sale | Admin | Quản lý danh sách, tạo mới, khóa, đổi mật khẩu Sale |
| `/admin/activity` | Hoạt động hệ thống | Admin | Nhật ký thao tác real-time của toàn đội ngũ |
| `/settings/change-password` | Đổi mật khẩu | Cả hai | Cập nhật mật khẩu cá nhân khi đang đăng nhập |

---

## 📦 Hướng dẫn Cài đặt & Triển khai

### 1. Yêu cầu môi trường
- Node.js >= 18.0.0
- npm hoặc yarn
- Tài khoản [Supabase](https://supabase.com)

### 2. Cài đặt mã nguồn
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` tại thư mục `frontend/` với nội dung:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgres://postgres:[password]@[host]:5432/postgres
```

### 4. Chạy migration cơ sở dữ liệu
```bash
# Khởi tạo bảng, RLS policies, triggers và tài khoản admin mặc định
node scripts/run-migration.js

# Hoặc áp dụng policy xóa đơn cho Saler
node scripts/add-delete-policy.js
```

### 5. Khởi chạy môi trường phát triển
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173`
- Tài khoản quản trị mặc định: `admin` / `password123`
