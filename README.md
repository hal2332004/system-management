# TourFlow CRM — Hệ Thống Quản Lý & Điều Hành Đơn Tour Du Lịch

<p align="center">
  <strong>Giải pháp quản trị bán hàng, điều hành tour và đo lường hiệu suất nhân viên toàn diện dành cho doanh nghiệp du lịch nội bộ.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.2-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Recharts-2.x-8884d8" alt="Recharts" />
  <img src="https://img.shields.io/badge/Security-RLS_Protected-orange" alt="RLS" />
  <img src="https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blue" alt="Theme" />
</p>

---

## 📑 Mục lục

1. [Giới thiệu Tổng quan](#-giới-thiệu-tổng-quan)
2. [Kiến trúc & Công nghệ](#-kiến-trúc--công-nghệ)
3. [Phân quyền Người dùng (RBAC Matrix)](#-phân-quyền-người-dùng-rbac-matrix)
4. [Tính năng Nổi bật](#-tính-năng-nổi-bật)
   - [4.1. Dashboard Quản trị & Hiệu suất Saler (Recharts)](#41-dashboard-quản-trị--hiệu-suất-saler-recharts)
   - [4.2. Quản lý Đơn Tour Nâng cao](#42-quản-lý-đơn-tour-nâng-cao)
   - [4.3. Quản lý Danh mục Tour & Loại Phòng](#43-quản-lý-danh-mục-tour--loại-phòng)
   - [4.4. Chuông Thông báo Thời gian thực (Realtime)](#44-chuông-thông-báo-thời-gian-thực-realtime)
   - [4.5. Quản lý Đội ngũ Nhân viên Sale](#45-quản-lý-đội-ngũ-nhân-viên-sale)
   - [4.6. Hồ sơ Cá nhân & Upload Avatar](#46-hồ-sơ-cá-nhân--upload-avatar)
   - [4.7. Quản lý Mật khẩu Hai Luồng](#47-quản-lý-mật-khẩu-hai-luồng)
   - [4.8. Tối ưu Trải nghiệm Mobile & Đa Giao diện (Dark / Light)](#48-tối-ưu-trải-nghiệm-mobile--đa-giao-diện-dark--light)
5. [Cơ sở Dữ liệu & Chính sách Bảo mật (RLS)](#-cơ-sở-dữ-liệu--chính-sách-bảo-mật-rls)
6. [Cấu trúc Thư mục Dự án](#-cấu-trúc-thư-mục-dự-án)
7. [Hướng dẫn Cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)

---

## 🌟 Giới thiệu Tổng quan

**TourFlow CRM** là giải pháp phần mềm quản lý đơn tour du lịch và đo lường hiệu suất bán hàng được thiết kế dành riêng cho đội ngũ **Nhân viên Sale (Saler)** và **Ban Quản trị (Admin)**.

Hệ thống giải quyết triệt để các vấn đề:
- **Tập trung hóa dữ liệu tour:** Loại bỏ việc theo dõi đơn lẻ tẻ qua file Excel hay tin nhắn mạng xã hội.
- **Bảo vệ dữ liệu khách hàng tuyệt đối:** Cơ chế cách ly dữ liệu tại tầng Database (**PostgreSQL Row Level Security**), Saler chỉ nhìn thấy và xử lý đơn do chính mình tạo ra.
- **Tra cứu và đối soát linh hoạt:** Lọc đa chiều theo cả hai mốc: Ngày đặt đơn (đối soát hoa hồng sale) và Ngày đi tour (điều hành dịch vụ).
- **Trực quan hóa chỉ số với Recharts:** Theo dõi hiệu suất từng Saler, tỷ lệ chốt đơn (Conversion Rate) và phân bổ trạng thái đơn tour theo thời gian thực.
- **Tương thích toàn diện:** Trải nghiệm mượt mà trên cả Desktop lẫn Mobile với hệ thống theme Sáng / Tối thông minh.

---

## 🛠 Kiến trúc & Công nghệ

### Tech Stack Chi tiết

| Tầng | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Frontend Core** | **React 18** + **TypeScript** | Xây dựng Single Page Application an toàn kiểu dữ liệu, độ phản hồi cao |
| **Build Tool** | **Vite** | Build bundle nhanh, tối ưu hóa asset và Hot Module Replacement (HMR) |
| **Routing** | **React Router DOM v7** | Điều hướng SPA, quản lý Protected Routes và Role Redirects |
| **Charts & Visualization** | **Recharts** | Vẽ biểu đồ cột tương tác cao, responsive, bo góc mượt mà, tooltip theo theme |
| **Icons & UI** | **Lucide React** | Hệ thống biểu tượng giao diện hiện đại, sắc nét |
| **Styling** | **Vanilla CSS + CSS Variables** | Quản lý Design Tokens (Dark / Light theme), không phụ thuộc framework CSS nặng |
| **Backend & BaaS** | **Supabase** | Nền tảng Authentication, PostgreSQL Database, Storage Bucket và Postgres Realtime Channels |
| **Cơ sở dữ liệu** | **PostgreSQL 15** | RLS Policies, Stored Functions, Database Triggers, Foreign Keys |

### Sơ đồ Luồng Kiến trúc (Architecture Workflow)

```mermaid
graph TD
    Client["Trình duyệt Client (React 18 + TS + Recharts)"]
    Auth["Supabase Auth (JWT / Session)"]
    DB[("PostgreSQL 15 Database (Supabase)")]
    Storage["Supabase Storage ('avatars' bucket)"]
    Realtime["Supabase Realtime (WebSocket)"]

    Client -->|Xác thực / Đăng nhập| Auth
    Client -->|Truy vấn dữ liệu (Orders, Profiles, Tours)| DB
    Client -->|Tải lên ảnh đại diện| Storage
    DB -->|Bảo vệ dữ liệu| RLS["Row Level Security (RLS)"]
    DB -->|Bắn sự kiện thay đổi| Realtime
    Realtime -->|Cập nhật tức thì| Client
```

---

## 👥 Phân quyền Người dùng (RBAC Matrix)

Hệ thống phân chia ranh giới quyền hạn nghiêm ngặt giữa hai vai trò:

| Chức năng / Quyền hạn | Saler (`saler`) | Admin (`admin`) | Ghi chú bảo mật |
| :--- | :---: | :---: | :--- |
| **Đăng nhập hệ thống** | ✅ | ✅ | Hỗ trợ đăng nhập qua Username hoặc Email |
| **Đổi mật khẩu cá nhân** | ✅ | ✅ | Yêu cầu xác thực mật khẩu cũ |
| **Quên / Đặt lại mật khẩu** | ✅ | ✅ | Nhận liên kết khôi phục qua Email |
| **Xem Hồ sơ & Đổi Avatar** | ✅ | ✅ | Upload ảnh cá nhân lên Supabase Storage |
| **Xem chuông thông báo Realtime** | ✅ | ✅ | Lắng nghe hoạt động liên quan đến đơn tour |
| **Tạo mới đơn tour** | ✅ | ✅ | Tự động gắn `owner_id` là user đang tạo đơn |
| **Xem danh sách đơn tour** | ✅ *(Chỉ đơn của mình)* | ✅ *(Toàn bộ đơn)* | Được bảo vệ bởi RLS ở cấp database |
| **Tìm kiếm & Lọc đơn nâng cao** | ✅ | ✅ | Lọc theo ngày đặt, ngày tour, trạng thái, Saler |
| **Chỉnh sửa đơn tour** | ✅ *(Chỉ đơn của mình)* | ✅ *(Toàn bộ đơn)* | Giữ nguyên `owner_id` gốc khi sửa |
| **Xóa đơn tour** | ✅ *(Chỉ đơn của mình)* | ✅ *(Toàn bộ đơn)* | Có hộp thoại xác nhận an toàn |
| **Dashboard Tổng quan & Recharts** | ❌ | ✅ | Thống kê KPI, biểu đồ trạng thái & hiệu suất Saler |
| **Quản trị Nhân viên Sale** | ❌ | ✅ | Tạo mới, khóa/mở khóa (`is_active`), cấp lại mật khẩu |
| **Quản trị Danh mục Tours & Phòng**| ❌ | ✅ | Thêm, sửa, bật/tắt tour và loại phòng |
| **Xem Nhật ký Hệ thống (Activity)** | ❌ | ✅ | Giám sát toàn bộ thao tác theo thời gian thực |

---

## 🚀 Tính năng Nổi bật

### 4.1. Dashboard Quản trị & Hiệu suất Saler (Recharts)
Dành riêng cho Quản trị viên để nắm bắt tình hình kinh doanh trong tích tắc:
- **4 thẻ chỉ số KPI tổng hợp:**
  - Tổng số đơn tour toàn hệ thống.
  - Số đơn đang trong giai đoạn tư vấn.
  - Số đơn đã chốt thành công.
  - Tỷ lệ chốt đơn trung bình (`(Đã chốt / Tổng đơn) * 100%`).
- **Thẻ Đơn theo trạng thái:** Phân bổ toàn bộ đơn dạng thanh tiến trình trực quan.
- **Thẻ Hiệu suất Saler hiện đại (Tích hợp Recharts Bar Chart):**
  - **Bộ lọc đôi linh hoạt:**
    - `[Chọn nhân viên ▼]`: Lọc xem "Tất cả nhân viên" hoặc chọn riêng từng nhân viên Saler.
    - `[Khoảng thời gian ▼]`: Lọc xem 7 ngày qua, 14 ngày qua, 30 ngày qua hoặc Tất cả.
  - **4 Chip trạng thái kèm tỷ lệ:** Mới, Đang tư vấn, Đã chốt, Đã hủy kèm số lượng và tỷ lệ `%`.
  - **Biểu đồ cột (Bar Chart):** Cột bo góc nhẹ `radius={[6, 6, 0, 0]}`, màu nhận diện chuẩn từng trạng thái, hiển thị custom tooltip khi hover (Dark/Light mode) và empty state khi không có dữ liệu.
  - **Tự động đồng bộ Realtime:** Tự cập nhật lại biểu đồ khi có đơn mới hoặc trạng thái đơn thay đổi.

### 4.2. Quản lý Đơn Tour Nâng cao
- **Thông tin đơn đầy đủ:** Khách hàng (Tên, SĐT, Email), Chọn tour từ danh mục, Loại phòng (`room_type`), Số lượng khách (`num_guests`), Mức độ đánh giá chất lượng (`rating` từ 1 đến 5 sao với component `StarRating`), Ghi chú tour.
- **Bộ lọc thời gian kép (Date Range Selector):**
  - Chuyển đổi linh hoạt giữa lọc theo **Ngày đặt tour (Booking Date)** hoặc **Ngày đi tour (Tour Date)**.
  - Các mốc chọn nhanh: Hôm nay, Hôm qua, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước.
  - Lịch chọn ngày cụ thể (Specific Date Picker).
- **Quyền xóa an toàn:** Cả Saler và Admin đều có thể xóa đơn của mình khi có sự cố, hệ thống yêu cầu xác nhận trước khi thực hiện để chống thao tác nhầm.

### 4.3. Quản lý Danh mục Tour & Loại Phòng
Truy cập tại `/admin/settings` (dành cho Admin):
- **Danh mục Tours:**
  - Tích hợp sẵn danh sách hơn 22 tour phổ biến (Việt Nam, Thái Lan, Bali, Campuchia...).
  - Thêm mới tour, chỉnh sửa tên tour.
  - Bật / tắt trạng thái hoạt động (`is_active`).
- **Danh mục Loại phòng (Room Types):**
  - Quản lý các loại phòng: Phòng đơn, Phòng đôi, Twin, Triple, Family Suite, Villa...
  - Hỗ trợ bật/tắt hoặc thêm mới loại phòng nhanh chóng.

### 4.4. Chuông Thông báo Thời gian thực (Realtime)
- Tích hợp component `NotificationBell` góc trên bên phải màn hình.
- Lắng nghe sự kiện qua WebSocket (Supabase Realtime) trên bảng `activity_logs`.
- Hiển thị badge số lượng thông báo chưa đọc, tự động phát tín hiệu khi có đơn mới được tạo hoặc cập nhật trạng thái.
- Hỗ trợ đánh dấu đọc từng thông báo hoặc "Đọc tất cả".

### 4.5. Quản lý Đội ngũ Nhân viên Sale
Truy cập tại `/admin/salers`:
- **Tạo nhân viên mới:** Admin nhập Họ tên và Email; hệ thống tự động chuẩn hóa tiếng Việt không dấu và sinh username kèm hậu tố ngẫu nhiên (ví dụ: `nguyen.van.an.7k2a`).
- **Khóa / Mở khóa tài khoản (`is_active`):** Khi tài khoản bị khóa, nhân viên sẽ lập tức bị đăng xuất và không thể truy cập hệ thống.
- **Cấp lại mật khẩu trực tiếp:** Admin có thể đặt lại mật khẩu mới cho nhân viên ngay trên giao diện quản trị.

### 4.6. Hồ sơ Cá nhân & Upload Avatar
Truy cập tại `/profile`:
- Xem thông tin tài khoản, vai trò, ngày tham gia.
- Cập nhật tên hiển thị (`display_name`).
- Upload ảnh đại diện trực tiếp lên Supabase Storage bucket `avatars`, tự động tối ưu hóa kích thước và hiển thị với avatar fallback viết tắt tên khi chưa có ảnh.

### 4.7. Quản lý Mật khẩu Hai Luồng
- **Đổi mật khẩu khi đang đăng nhập (`/settings/change-password`):** Yêu cầu nhập đúng mật khẩu hiện tại, sau đó nhập mật khẩu mới và xác nhận.
- **Khôi phục mật khẩu khi quên (`/forgot-password` → `/reset-password`):** Nhập email đăng ký để nhận liên kết xác thực chứa token từ Supabase, sau đó đặt lại mật khẩu mới an toàn.

### 4.8. Tối ưu Trải nghiệm Mobile & Đa Giao diện (Dark / Light)
- **Hệ thống theme Sáng / Tối:** Chuyển đổi chỉ với 1 click bằng nút bấm ☀️/🌙 cố định trên Topbar, tự động ghi nhớ tùy chọn vào `localStorage`.
- **Drawer Menu Mobile:** Trên màn hình điện thoại, Sidebar chuyển thành Drawer trượt từ bên trái với lớp phủ mờ (backdrop-blur). Click bên ngoài hoặc click vào menu sẽ tự động thu gọn.
- **Bảng cuộn ngang mượt mà:** Bảng dữ liệu hỗ trợ cuộn ngang linh hoạt, không bị vỡ bố cục trên màn hình nhỏ.

---

## 🔒 Cơ sở Dữ liệu & Chính sách Bảo mật (RLS)

Hệ thống lưu trữ trên **PostgreSQL 15** và thực thi chính sách bảo mật đa lớp:

### 1. Các bảng chính trong hệ thống

| Bảng | Chức năng chính | Cột quan trọng |
| :--- | :--- | :--- |
| `profiles` | Hồ sơ người dùng, phân quyền | `id`, `username`, `display_name`, `email`, `role` (`admin` / `saler`), `is_active`, `avatar_url` |
| `orders` | Đơn tour du lịch | `id`, `order_code`, `owner_id`, `customer_name`, `customer_phone`, `tour_name`, `booking_date`, `tour_date`, `status`, `room_type`, `num_guests`, `rating`, `notes` |
| `tours` | Danh mục chương trình tour | `id`, `name`, `is_active` |
| `room_types` | Danh mục loại phòng | `id`, `name`, `is_active` |
| `activity_logs` | Nhật ký thao tác hệ thống | `id`, `actor_id`, `target_user_id`, `action_type`, `description`, `created_at` |

**4 trạng thái đơn tour (`order_status`):**
- `'new'`: Mới tiếp nhận
- `'consulting'`: Đang tư vấn
- `'closed'`: Đã chốt thành công
- `'cancelled'`: Đã hủy đơn

### 2. Ví dụ chính sách Row Level Security (RLS)

```sql
-- Saler chỉ có quyền xem đơn do mình phụ trách và khi tài khoản đang mở
CREATE POLICY "Salers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler chỉ tạo được đơn với owner_id là chính mình
CREATE POLICY "Salers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler chỉ chỉnh sửa đơn của chính mình
CREATE POLICY "Salers can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Saler chỉ xóa được đơn của chính mình
CREATE POLICY "Salers can delete their own orders" ON public.orders
  FOR DELETE USING (auth.uid() = owner_id AND public.is_my_account_active());

-- Admin có toàn quyền trên toàn bộ bảng đơn tour
CREATE POLICY "Admins can do everything on orders" ON public.orders
  FOR ALL USING (get_my_role() = 'admin');
```

---

## 📂 Cấu trúc Thư mục Dự án

```
system-management/
├── PRD.md                         # Tài liệu đặc tả yêu cầu sản phẩm
├── README.md                      # Hướng dẫn và tài liệu dự án
├── UI requirement.md              # Yêu cầu chi tiết về giao diện UI/UX
└── frontend/                      # Ứng dụng Frontend React + Vite
    ├── index.html                 # Entry point HTML
    ├── package.json               # Danh sách thư viện & scripts
    ├── tsconfig.json              # Cấu hình TypeScript
    ├── vite.config.ts             # Cấu hình Vite bundler
    ├── scripts/                   # Scripts quản lý và migration DB
    │   ├── run-migration.js       # Chạy migration database chính
    │   ├── add-delete-policy.js   # Bổ sung policy xóa đơn cho Saler
    │   ├── check-db.js            # Kiểm tra kết nối cơ sở dữ liệu
    │   └── fix-trigger.js         # Cập nhật triggers và stored procedures
    ├── supabase/                  # Các file SQL schema và migration
    │   └── migrations/
    │       ├── 20260909100000_tourflow_schema.sql
    │       ├── 20260915110000_realtime_notifications.sql
    │       ├── 20260915130000_profile_avatar.sql
    │       ├── 20260915140000_allow_read_profiles.sql
    │       ├── 20260915150000_tours_and_room_types.sql
    │       ├── 20260915160000_add_guests_and_rating.sql
    │       ├── 20260915170000_update_order_statuses.sql
    │       └── reset_admin.sql
    └── src/
        ├── App.tsx                # Toàn bộ logic Routes, Views, Dashboard & Recharts
        ├── index.css              # Hệ thống Design Tokens, Dark/Light theme & CSS
        ├── main.tsx               # Khởi tạo React DOM
        ├── types.ts               # Khai báo kiểu dữ liệu TypeScript (Order, Profile, Tour...)
        ├── lib/
        │   └── supabase.ts        # Cấu hình kết nối Supabase Client & Admin Client
        └── components/            # Các component độc lập
            ├── AdminSettingsPage.tsx # Màn hình quản trị Tours & Loại phòng
            ├── Avatar.tsx            # Component ảnh đại diện & fallback
            ├── NotificationBell.tsx  # Chuông thông báo Realtime
            ├── ProfilePage.tsx       # Trang hồ sơ cá nhân & upload avatar
            └── StarRating.tsx        # Đánh giá độ ưu tiên đơn (1 - 5 sao)
```

---

## 💻 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu Tiên quyết
- **Node.js**: Phiên bản 18.0.0 trở lên.
- **npm** hoặc **yarn**.
- Một dự án [Supabase](https://supabase.com) (hoặc máy chủ PostgreSQL có hỗ trợ extension `uuid-ossp`).

### 2. Cài đặt Mã nguồn
```bash
# 1. Clone repository về máy
git clone https://github.com/hal2332004/system-management.git
cd system-management/frontend

# 2. Cài đặt các dependencies
npm install
```

### 3. Cấu hình Biến Môi trường
Tạo file `.env` tại thư mục `frontend/` với các thông số kết nối:

```env
# URL và Public Anon Key của dự án Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (tùy chọn cho thao tác admin nâng cao)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Chuỗi kết nối PostgreSQL trực tiếp (Dùng khi chạy migrations qua Node script)
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
```

### 4. Chạy Migration Cơ sở Dữ liệu
```bash
# Khởi tạo bảng, RLS policies, triggers và dữ liệu mẫu
npm run db:migrate

# Thiết lập lại tài khoản admin mặc định (nếu cần)
npm run db:reset
```

### 5. Khởi chạy Ứng dụng

```bash
# Chạy máy chủ phát triển (Development mode)
npm run dev

# Kiểm tra an toàn kiểu dữ liệu (TypeScript typecheck)
npm run typecheck

# Đóng gói sản phẩm (Production build)
npm run build
```

Ứng dụng sẽ chạy tại địa chỉ: **`http://localhost:5173`**

### 6. Tài khoản Mặc định để Trải nghiệm
- **Tài khoản Quản trị viên (Admin):**
  - Tên đăng nhập: `admin`
  - Mật khẩu: `password123`
- **Tài khoản Nhân viên Sale (Saler):**
  - Có thể tạo thêm nhanh chóng từ trang Quản lý Nhân viên của Admin (`/admin/salers`).

---

<p align="center">
  <sub>TourFlow CRM © 2026 · Phát triển cho giải pháp quản trị du lịch nội bộ chuyên nghiệp.</sub>
</p>
