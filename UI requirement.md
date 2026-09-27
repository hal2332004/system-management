# UI Design & Specification — TourFlow CRM

> **Tài liệu đặc tả giao diện người dùng (UI Specification)** cho hệ thống **TourFlow CRM — Website Quản Lý Đơn Tour**.  
> Được đồng bộ chuẩn xác 100% theo source code thực tế: React 18, TypeScript, Vanilla CSS Design System, Recharts, Lucide Icons, hỗ trợ **Light/Dark Mode**, **Sticky Sidebar & Topbar**, **Bộ lọc ngày kép & Auto-clear**, **Mobile Card View (<768px)**, **Cài đặt Tour/Loại phòng**, và **Trang hồ sơ cá nhân / Avatar Upload**.

---

## 📑 Mục lục

1. [Hệ thống Thiết kế (Design System & Tokens)](#1-hệ-thống-thiết-kế-design-system--tokens)
   - 1.1 [Phong cách thiết kế & Trải nghiệm](#11-phong-cách-thiết-kế--trải-nghiệm)
   - 1.2 [Bảng màu (Color Palette: Dark & Light Mode)](#12-bảng-màu-color-palette-dark--light-mode)
   - 1.3 [Hệ thống Badges trạng thái (Status Colors)](#13-hệ-thống-badges-trạng-thái-status-colors)
   - 1.4 [Kiểu chữ (Typography)](#14-kiểu-chữ-typography)
   - 1.5 [Hệ thống Lưới, Spacing & Bo góc](#15-hệ-thống-lưới-spacing--bo-góc)
   - 1.6 [Quy chuẩn Component cơ bản](#16-quy-chuẩn-component-cơ-bản)
2. [Cấu trúc Khung Layout Tổng thể (App Architecture)](#2-cấu-trúc-khung-layout-tổng-thể-app-architecture)
   - 2.1 [Sticky Sidebar (Cột điều hướng cố định 100vh)](#21-sticky-sidebar-cột-điều-hướng-cố-định-100vh)
   - 2.2 [Sticky Topbar (Thanh điều hướng đỉnh cao cấp)](#22-sticky-topbar-thanh-điều-hướng-đỉnh-cao-cấp)
   - 2.3 [Khu vực Nội dung chính (Main Content Viewport)](#23-khu-vực-nội-dung-chính-main-content-viewport)
3. [Đặc tả Chi tiết Từng Màn hình (Screen Specifications)](#3-đặc-tả-chi-tiết-từng-màn-hình-screen-specifications)
   - [Screen 01: Đăng nhập (`/login`)](#screen-01--đăng-nhập)
   - [Screen 02: Quên mật khẩu (`/forgot-password`)](#screen-02--quên-mật-khẩu)
   - [Screen 03: Đặt lại mật khẩu từ email (`/reset-password`)](#screen-03--đặt-lại-mật-khẩu-từ-email)
   - [Screen 04: Đổi mật khẩu trong hệ thống (`/settings/change-password`)](#screen-04--đổi-mật-khẩu-trong-hệ-thống)
   - [Screen 05: Bảng điều khiển Quản trị (`/dashboard`)](#screen-05--bảng-điều-khiển-quản-trị)
   - [Screen 06: Quản lý Tất cả Đơn tour - Admin (`/admin/orders`)](#screen-06--quản-lý-tất-cả-đơn-tour---admin)
   - [Screen 07: Đơn tour của tôi - Saler (`/orders`)](#screen-07--đơn-tour-của-tôi---saler)
   - [Screen 08: Tạo đơn tour mới (`/orders/new`) & Chỉnh sửa (`/orders/:id/edit`)](#screen-08--tạo-đơn-tour-mới--chỉnh-sửa)
   - [Screen 09: Chi tiết đơn tour (`/orders/:id`)](#screen-09--chi-tiết-đơn-tour)
   - [Screen 10: Quản lý Nhân viên Sale (`/admin/salers`)](#screen-10--quản-lý-nhân-viên-sale)
   - [Screen 11: Hoạt động hệ thống (`/admin/activity`)](#screen-11--hoạt-động-hệ-thống)
   - [Screen 12: Cài đặt Hệ thống - Tour & Loại phòng (`/admin/settings`)](#screen-12--cài-đặt-hệ-thống---tour--loại-phòng)
   - [Screen 13: Trang Hồ sơ Cá nhân & Âm thanh (`/profile`)](#screen-13--trang-hồ-sơ-cá-nhân--âm-thanh)
4. [Đặc tả Bộ lọc Thông minh (Smart Filter Specification)](#4-đặc-tả-bộ-lọc-thông-minh-smart-filter-specification)
5. [Đặc tả Giao diện Responsive Mobile (<768px)](#5-đặc-tả-giao-diện-responsive-mobile-768px)
6. [Trạng thái Phản hồi & Tương tác (Feedback & Interactive States)](#6-trạng-thái-phản-hồi--tương-tác-feedback--interactive-states)
7. [Ma trận Phân quyền & Hành động Giao diện (Role-Action Matrix)](#7-ma-trận-phân-quyền--hành-động-giao-diện-role-action-matrix)

---

## 1. Hệ thống Thiết kế (Design System & Tokens)

### 1.1 Phong cách thiết kế & Trải nghiệm
- **Ngôn ngữ thiết kế:** Modern Enterprise SaaS Dashboard (lấy cảm hứng từ Linear, Raycast, Vercel).
- **Trải nghiệm thị giác:**
  - Tối giản, thanh lịch, ưu tiên mật độ thông tin cao nhưng thoáng đãng, phân cấp thị giác rõ ràng.
  - Cung cấp **chế độ Kép hoàn chỉnh**: **Dark Mode** (chế độ mặc định, dịu mắt, huyền bí) và **Light Mode** (tươi sáng, độ tương phản cao, chống lóa).
  - Cơ chế chuyển theme tức thì thông qua thuộc tính `data-theme="dark" | "light"` tại thẻ `:root` mà không cần reload trang.

---

### 1.2 Bảng màu (Color Palette: Dark & Light Mode)

Hệ thống token màu được khai báo thông qua biến CSS (`CSS Variables`) tại [index.css](file:///d:/Ky%204/system-management/frontend/src/index.css):

| Token biến CSS | Dark Mode (Mặc định) | Light Mode | Ý nghĩa & Vị trí ứng dụng |
|---|---|---|---|
| `--bg-app` | `#0b0f17` | `#f8fafc` | Nền canvas toàn bộ ứng dụng |
| `--bg-surface` | `#111827` | `#ffffff` | Nền Sidebar, Topbar, Modal popups |
| `--bg-card` | `#151e2e` | `#ffffff` | Nền thẻ thống kê KPI, container danh sách |
| `--bg-input` | `#0d131f` | `#ffffff` | Nền ô nhập liệu input, select, textarea |
| `--border-color` | `#1e293b` | `#e2e8f0` | Đường kẻ phân cách, viền input, border thẻ |
| `--border-focus` | `#3b82f6` | `#2563eb` | Viền khi focus vào ô input, viền active |
| `--text-main` | `#f8fafc` | `#0f172a` | Chữ tiêu đề, nội dung chính, dữ liệu quan trọng |
| `--text-muted` | `#94a3b8` | `#475569` | Label form, thời gian, chú thích phụ, placeholder |
| `--primary` | `#3b82f6` | `#2563eb` | Màu thương hiệu chính, nút CTA, icon nổi bật |
| `--primary-hover` | `#2563eb` | `#1d4ed8` | Hover trên nút chính |
| `--accent-glow` | `rgba(59, 130, 246, 0.25)` | `rgba(37, 99, 235, 0.2)` | Hiệu ứng đổ bóng phát sáng (Focus Ring) |

---

### 1.3 Hệ thống Badges trạng thái (Status Colors)

Trong database và source code, hệ thống quản lý chính xác **4 trạng thái đơn tour**:

| Mã Enum Database | Nhãn tiếng Việt | Token Text Dark | Background Dark | Token Text Light | Background Light |
|---|---|---|---|---|---|
| `new` | **Mới** | `#60A5FA` (`--status-new-text`) | `#172C4A` (`--status-new-bg`) | `#2563eb` | `#eff6ff` |
| `consulting` | **Đang tư vấn** | `#FBBF24` (`--status-consulting-text`) | `#3B2A0A` (`--status-consulting-bg`) | `#d97706` | `#fffbeb` |
| `closed` | **Đã chốt** | `#4ADE80` (`--status-closed-text`) | `#0A2E1A` (`--status-closed-bg`) | `#16a34a` | `#f0fdf4` |
| `cancelled` | **Đã hủy** | `#F87171` (`--status-cancelled-text`) | `#2E0A0A` (`--status-cancelled-bg`) | `#dc2626` | `#fef2f2` |

---

### 1.4 Kiểu chữ (Typography)

Sử dụng bộ font hệ thống hiện đại, tối ưu rendering trên mọi màn hình:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Cấp độ | Cỡ chữ (Size) | Độ đậm (Weight) | Màu chữ (Dark / Light) | Ứng dụng |
|---|---|---|---|---|
| **Display H1** | `22px - 24px` | `700` (Bold) | `#f8fafc` / `#0f172a` | Tiêu đề trang chính (Bảng điều khiển, Đơn tour) |
| **Section H2** | `17px - 18px` | `600` (Semibold) | `#f8fafc` / `#0f172a` | Tiêu đề card biểu đồ, tiêu đề modal, tên form |
| **Card Title** | `14px - 15px` | `600` (Semibold) | `#94a3b8` / `#475569` | Label thẻ thống kê KPI |
| **Big KPI Value** | `26px - 28px` | `700` (Bold) | `#f8fafc` / `#0f172a` | Giá trị số liệu lớn trên KPI Card |
| **Body Regular** | `13px - 14px` | `400` (Normal) | `#f8fafc` / `#0f172a` | Nội dung hàng bảng, đoạn mô tả |
| **Code / Chip ID** | `12px` | `500` (Medium) | Monospace / Semibold | Mã đơn `#ORD-XXXXXX`, ngày giờ |
| **Caption / Label** | `11px - 12px` | `500` (Medium) | `#94a3b8` / `#475569` | Label input, tooltip, metadata phụ |

---

### 1.5 Hệ thống Lưới, Spacing & Bo góc

- **Spacing Scale:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.
- **Border Radius:**
  - Nút bấm (Button), Ô nhập (Input), Dropdown trigger: `8px`.
  - Thẻ thông tin (Card), Bảng dữ liệu: `12px`.
  - Hộp thoại Modal: `14px - 16px`.
  - Badge trạng thái, Phone Chip, Country Tag: `6px - 8px`.
  - Avatar hình tròn: `50%`.
- **Shadows:**
  - Card Shadow: `0 4px 20px rgba(0, 0, 0, 0.15)`.
  - Modal Drop Shadow: `0 20px 40px rgba(0, 0, 0, 0.45)`.
  - Popover / Dropdown Menu: `0 8px 24px rgba(0, 0, 0, 0.25)`.

---

### 1.6 Quy chuẩn Component cơ bản

#### 1. Nút bấm (Button System)
- **Primary Button (`.btn-primary`):** Nền `--primary`, chữ trắng, bo góc `8px`, hiệu ứng hover sáng nhẹ, padding `8px 16px`. Dùng cho hành động chính: *Lưu đơn*, *Tạo đơn mới*, *Thêm nhân viên*.
- **Secondary / Ghost Button (`.btn-secondary`):** Nền trong suốt hoặc `--bg-surface`, viền `1px solid --border-color`, chữ `--text-main`. Dùng cho: *Hủy*, *Xem chi tiết*, *Lọc ngày*, *Xuất file CSV*.
- **Danger Action Button (`.action-btn-danger`):** Nút icon thùng rác viền đỏ, hover nền đỏ nhạt (`rgba(244, 63, 94, 0.15)`), chữ đỏ `#f87171`. Dùng cho: *Xóa đơn*, *Khóa tài khoản*.
- **Small Action Button (`.action-btn`):** Kích thước nhỏ gọn `32x32px`, căn giữa icon xem (`Eye`), sửa (`Pencil`), xóa (`Trash2`).

#### 2. Ô nhập liệu (Input & Select)
- Nền `--bg-input` (Dark: `#0d131f`) hoặc `#ffffff` (Light), viền `1px solid --border-color`.
- Focus State: Viền chuyển `--border-focus`, thêm box-shadow vòng hào quang `--accent-glow`.
- Chiều cao chuẩn: `38px` (bộ lọc compact) và `42px` (form tạo/sửa).

#### 3. Phone Chip & Action Links
- Hiển thị SĐT khách hàng dạng chip có icon điện thoại.
- Clickable dạng `tel:0901234567`, hover đổi màu nhẹ, tiện lợi cho Saler gọi nhanh ngay từ bảng hoặc chi tiết đơn.
- Email clickable dạng `mailto:...` mở ứng dụng email khách hàng.

#### 4. Component Đánh giá Sao Khách sạn (`StarRating`)
- Đánh giá từ 1 đến 5 sao bằng icon sao vàng. Hỗ trợ hover động và click chọn mức sao.

#### 5. Component Avatar (`Avatar`)
- Hiển thị ảnh đại diện người dùng nếu đã upload lên Supabase Storage `avatars`, fallback hiển thị 2 chữ cái viết tắt tên trên nền màu gradient ngẫu nhiên.

---

## 2. Cấu trúc Khung Layout Tổng thể (App Architecture)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TOÀN BỘ KHUNG MÀN HÌNH                               │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│  STICKY SIDEBAR       │  STICKY TOPBAR                                                 │
│  (Cố định 100vh)      │  [TourFlow / Breadcrumb]    [Thứ X, dd/mm] [🔔] [☀️/🌙]       │
│  ───────────────────  ├────────────────────────────────────────────────────────────────┤
│  Logo "TourFlow CRM"  │  VIEWPORT NỘI DUNG CHÍNH (Cuộn độc lập)                        │
│  Pill "Workspace"     │                                                                │
│                       │  ┌──────────────────────────────────────────────────────────┐  │
│  DANH MỤC ĐIỀU HƯỚNG  │  │ Header Trang: Tiêu đề H1 + Mô tả + Nút tác vụ chính      │  │
│  - Bảng điều khiển    │  ├──────────────────────────────────────────────────────────┤  │
│  - Tất cả đơn tour    │  │ Khu vực Báo cáo KPI / Thẻ tổng quan                      │  │
│  - Nhân viên Sale     │  ├──────────────────────────────────────────────────────────┤  │
│  - Cài đặt hệ thống   │  │ Khung Bộ lọc đa tiêu chí (Search, Status, Date Picker)   │  │
│  - Hoạt động hệ thống │  ├──────────────────────────────────────────────────────────┤  │
│                       │  │ Bảng dữ liệu chi tiết (Table) / Mobile Cards               │  │
│  (Dưới cùng Sidebar)  │  └──────────────────────────────────────────────────────────┘  │
│  [Avatar] Tên User    │                                                                │
│  [Menu Tài khoản]     │                                                                │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

### 2.1 Sticky Sidebar (Cột điều hướng cố định 100vh)
- **Vị trí & Kích thước:** `position: sticky; top: 0; height: 100vh; width: 260px; z-index: 40;`.
- **Cố định tuyệt đối:** Khi người dùng cuộn xem hàng nghìn đơn hàng, Sidebar **vẫn đứng yên**, không bao giờ bị cuộn mất.
- **Thành phần trên cùng:**
  - Logo biểu tượng khiên tích (`ShieldCheck`) + Chữ "TourFlow CRM" nổi bật.
  - Tag trạng thái workspace: *"Workspace nội bộ"*.
- **Danh mục điều hướng theo phân quyền:**
  - **Admin:**
    - *Bảng điều khiển* (`/dashboard`)
    - *Tất cả đơn tour* (`/admin/orders`)
    - *Nhân viên Sale* (`/admin/salers`)
    - *Cài đặt hệ thống* (`/admin/settings` - Quản lý Tour & Loại phòng)
    - *Hoạt động hệ thống* (`/admin/activity`)
  - **Saler:**
    - *Đơn của tôi* (`/orders`)
    - *Tạo đơn mới* (`/orders/new`)
- **Thành phần dưới cùng (User Card & Popup Menu):**
  - Khối profile gồm avatar hình tròn (ảnh hoặc 2 chữ cái viết tắt), tên hiển thị, và chức vụ.
  - Click vào Avatar/Tên chuyển hướng nhanh đến trang hồ sơ cá nhân (`/profile`).
  - Nhấp chuột nút tác vụ mở popup menu nhanh: *Đổi mật khẩu*, *Đổi giao diện Sáng / Tối*, *Đăng xuất*.

### 2.2 Sticky Topbar (Thanh điều hướng đỉnh cao cấp)
- **Vị trí & Kích thước:** `position: sticky; top: 0; z-index: 30; height: 60px;`.
- **Hiệu ứng Glassmorphism:** Nền bán trong suốt kết hợp làm mờ hậu cảnh (`backdrop-filter: blur(12px)`), viền đáy mỏng `--border-color`.
- **Thành phần bên trái:**
  - Nút đóng/mở Mobile Hamburger (chỉ hiển thị trên viewport điện thoại/tablet).
  - Đường dẫn Breadcrumb thông minh: `TourFlow / Bảng điều khiển`, `TourFlow / Quản lý đơn tour`.
- **Thành phần bên phải:**
  - **Ngày giờ hệ thống:** Hiển thị thứ ngày tháng hiện tại (VD: *Thứ Bảy, 26/09/2026*).
  - **Chuông thông báo (`NotificationBell`):** Icon chuông với popover danh sách sự kiện mới, chấm đỏ báo đơn mới, hỗ trợ âm thanh Web Audio API khi có đơn phát sinh.
  - **Nút chuyển đổi Giao diện (Theme Toggle):**
    - Biểu tượng Mặt trời (`Sun`) khi đang ở Dark Mode (click để sang Light).
    - Biểu tượng Mặt trăng (`Moon`) khi đang ở Light Mode (click để sang Dark).

### 2.3 Khu vực Nội dung chính (Main Content Viewport)
- Cuộn mượt (`overflow-y: auto`), padding chuẩn `24px 32px` trên desktop, co giãn tự động xuống `16px 16px` trên mobile.
- Bố cục responsive hỗ trợ từ màn hình di động 360px đến desktop 4K.

---

## 3. Đặc tả Chi tiết Từng Màn hình (Screen Specifications)

---

### Screen 01 — Đăng nhập
- **Đường dẫn (Route):** `/login`
- **Quyền truy cập:** Public (Người chưa đăng nhập)
- **Bố cục giao diện:**
  - Toàn trang căn giữa tuyệt đối (`min-height: 100vh; display: flex; align-items: center; justify-content: center;`).
  - Hộp đăng nhập (Card) kích thước `440px`, bo góc `16px`, viền phát sáng nhẹ.
- **Thành phần bên trong:**
  - Logo TourFlow CRM và tiêu đề: *"Đăng nhập hệ thống điều hành"*.
  - Ô nhập Tên đăng nhập / Email (Hỗ trợ cả username hoặc email).
  - Ô nhập Mật khẩu (Icon Khóa, nút bật/tắt hiển thị mật khẩu `Eye`/`EyeOff`).
  - Nút bấm: *"Đăng nhập"* (Full width, loading spinner khi xử lý).
  - Liên kết phụ: *"Quên mật khẩu?"* điều hướng sang `/forgot-password`.
- **Xử lý luồng:**
  - Kiểm tra tài khoản nếu bị khóa (`is_active = false`): Báo lỗi đỏ *"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên."*
  - Đăng nhập thành công: Phân luồng điều hướng: Admin chuyển về `/dashboard`, Saler chuyển về `/orders`.

---

### Screen 02 — Quên mật khẩu
- **Đường dẫn (Route):** `/forgot-password`
- **Quyền truy cập:** Public
- **Bố cục giao diện:**
  - Card nhập email công vụ, tiêu đề: *"Khôi phục mật khẩu"*.
  - Nút bấm: *"Gửi hướng dẫn khôi phục"*.
  - Nút *"Quay lại đăng nhập"*.
- **Phản hồi:**
  - Sau khi gửi: Chuyển sang thông báo thành công hướng dẫn kiểm tra hộp thư email và đồng hồ đếm ngược gửi lại (60s cooldown).

---

### Screen 03 — Đặt lại mật khẩu từ email
- **Đường dẫn (Route):** `/reset-password`
- **Quyền truy cập:** Public (Kèm mã token khôi phục trong URL từ Supabase Auth)
- **Bố cục giao diện:**
  - Card nhập mật khẩu mới và xác nhận mật khẩu mới.
  - Tự động kiểm tra độ dài tối thiểu 6 ký tự và trùng khớp mật khẩu.
  - Cập nhật thành công sẽ tự động điều hướng về `/login`.

---

### Screen 04 — Đổi mật khẩu trong hệ thống
- **Đường dẫn (Route):** `/settings/change-password`
- **Quyền truy cập:** Nhân viên Sale & Quản trị viên đã đăng nhập
- **Bố cục giao diện:**
  - Nằm trong khung Layout chung (có Sidebar và Topbar).
  - Form gồm: *Mật khẩu mới* và *Xác nhận mật khẩu mới*.
  - Nút *"Lưu thay đổi"* và thông báo toast notification khi hoàn tất.

---

### Screen 05 — Bảng điều khiển Quản trị
- **Đường dẫn (Route):** `/dashboard`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - **Header trang:** Tiêu đề *"Bảng điều khiển"*, mô tả phân tích hiệu suất và cơ cấu đơn tour.
  - **Bộ lọc thời gian nhanh:** Nút chọn khoảng thời gian phân tích: `Tất cả` | `7 ngày qua` | `30 ngày qua` | `Tháng này`.
  - **Hàng Thống kê Chỉ số Cốt lõi (4 KPI Cards):**
    1. **Tổng đơn:** Icon túi hàng (`ShoppingBag`), tổng số đơn tour trong kỳ.
    2. **Đang tư vấn:** Icon đồng hồ (`Clock`), số đơn có trạng thái `consulting`.
    3. **Đã chốt:** Icon tích xanh (`CheckCircle2`), số đơn có trạng thái `closed`.
    4. **Tỷ lệ chốt:** Icon xu hướng (`TrendingUp`), tính theo công thức: `(Đã chốt / Tổng đơn) * 100%`.
  - **Khu vực Trực quan hóa Dữ liệu (Recharts Charts):**
    - **Biểu đồ 1: Hiệu suất Nhân viên Sale (Recharts BarChart):** Biểu đồ cột phân nhóm theo từng nhân viên thể hiện số lượng đơn theo 4 trạng thái (*Mới, Tư vấn, Chốt, Hủy*).
    - **Biểu đồ 2: Cơ cấu Quốc tịch Khách hàng (Recharts PieChart):** Phân bổ tỷ lệ khách theo quốc gia (Việt Nam, Quốc tế...).
    - **Biểu đồ 3: Nguồn khách hàng tiếp cận (Recharts BarChart):** Thống kê kênh tiếp cận marketing (Facebook, Zalo, TikTok, Website, Khách giới thiệu, Hotline...).

---

### Screen 06 — Quản lý Tất cả Đơn tour - Admin
- **Đường dẫn (Route):** `/admin/orders`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - **Header:** Tiêu đề *"Tất cả đơn tour"*, tổng số đơn, nút tác vụ nhanh và **Nút Xuất dữ liệu CSV (`exportData`)**.
  - **Thanh Bộ lọc Nâng cao (Advanced Filter Bar):**
    - Tìm kiếm đa tiêu chí: Tên khách hàng, Số điện thoại, Email, Sản phẩm đã gửi (Tên tour).
    - Lọc theo **Nhân viên Sale phụ trách** (Dropdown chọn từng nhân viên hoặc tất cả).
    - Lọc theo **Trạng thái đơn** (`new`, `consulting`, `closed`, `cancelled`).
    - Dropdown **Lọc Ngày / Tháng nâng cao (Dual Date Filter)**:
      - Tùy chọn lọc theo: *Ngày đặt đơn (`booking_date`)* HOẶC *Tháng đi tour (`tour_date`)*.
      - Khi lọc theo Tháng đi tour: Lọc theo **toán tử logic OR** (khớp bất kỳ tháng nào trong các tháng khách yêu cầu). Hỗ trợ chọn nhanh các tháng có dữ liệu thực tế, tháng này, tháng sau, 3 tháng tới, năm nay, năm sau, hoặc chọn tháng bất kỳ dạng `MM/YYYY`.
    - Nút *"Xóa bộ lọc"* (`RotateCcw` icon): Hiển thị khi có bất kỳ điều kiện lọc nào được kích hoạt.
  - **Bảng dữ liệu Đơn tour trên Desktop (`.orders-table-desktop`):**
    - Cột 1: **Mã đơn** (Tag dạng `#ORD-XXXXXX`).
    - Cột 2: **Khách hàng** (Tên in đậm, Email, Quốc kỳ và tên quốc gia).
    - Cột 3: **Số điện thoại** (Phone Chip có thể click gọi điện thoại ngay).
    - Cột 4: **Nguồn** (Badge nguồn marketing: Facebook, Zalo, TikTok...).
    - Cột 5: **Sản phẩm đã gửi** (Tên sản phẩm/tour nổi bật kèm đánh giá sao khách sạn & loại phòng).
    - Cột 6: **Ngày đặt** (`dd/mm/yyyy`).
    - Cột 7: **Tháng khởi hành** (Dạng huy hiệu tháng `MM/YYYY`, hiển thị gọn `02/2027 +2` khi chọn nhiều tháng, kèm tooltip danh sách đầy đủ).
    - Cột 8: **Phụ trách (Saler)** (Badge nhân viên với avatar chữ cái/ảnh).
    - Cột 9: **Trạng thái** (Badge 4 màu chuẩn theo trạng thái đơn).
    - Cột 10: **Thao tác**:
      - Nút Xem chi tiết (Icon `Eye`).
      - Nút Chỉnh sửa (Icon `Pencil`).
      - Nút Xóa đơn (Icon `Trash2` màu đỏ kèm modal xác nhận).
  - **Giao diện Card trên Mobile (`.orders-cards-mobile`):**
    - Tự động thay thế bảng khi màn hình `<768px`.
    - Thẻ đơn hiển thị mã đơn, tên khách, số điện thoại bấm gọi ngay, sản phẩm đã gửi, tháng khởi hành, trạng thái và bộ 3 nút thao tác nhanh.
  - **Phân trang (Pagination Bar):** Điều khiển trang Trước/Sau và hiển thị tổng số kết quả.

---

### Screen 07 — Đơn tour của tôi - Saler
- **Đường dẫn (Route):** `/orders`
- **Quyền truy cập:** Nhân viên Sale (Saler)
- **Bố cục giao diện:**
  - Tương tự màn hình của Admin nhưng được tối ưu hóa riêng cho cá nhân Saler:
    - RLS chỉ trả về các đơn tour do chính Saler đó tạo ra (`owner_id = auth.uid()`).
    - Nút CTA nổi bật ở Header: `+ Tạo đơn mới` (Dẫn tới `/orders/new`).
    - Nút Xuất dữ liệu CSV các đơn tour của chính mình.
    - Bộ lọc tìm kiếm và bộ lọc thời gian kép đầy đủ tính năng (không có dropdown chọn Saler khác).
  - **Thao tác trên từng đơn:**
    - Xem chi tiết (`Eye`).
    - Chỉnh sửa thông tin đơn (`Pencil`).
    - **Xóa đơn của chính mình (`Trash2` màu đỏ):** Saler có toàn quyền xóa đơn do chính mình tạo ra nếu nhập sai hoặc khách hủy nhầm. Có hộp thoại xác nhận bảo vệ.

---

### Screen 08 — Tạo đơn tour mới & Chỉnh sửa
- **Đường dẫn (Route):** `/orders/new` (Tạo mới) & `/orders/:id/edit` (Chỉnh sửa)
- **Quyền truy cập:** Nhân viên Sale & Admin
- **Bố cục giao diện:**
  - Nút quay lại danh sách (`ArrowLeft`).
  - Tiêu đề: *"Tạo đơn tour mới"* hoặc *"Chỉnh sửa đơn tour #ORD-XXXXXX"*.
  - Form được chia thành 3 khối thẻ trực quan:
    1. **Thông tin khách hàng:**
       - Họ và tên khách hàng (*) (Bắt buộc).
       - Số điện thoại liên hệ (*) (Bắt buộc, tự động format).
       - Email khách hàng (Tùy chọn).
       - **Quốc tịch khách hàng:** Dropdown chọn quốc gia kèm cờ biểu tượng (danh mục `ALL_COUNTRIES`).
       - **Nguồn khách hàng tiếp cận:** Dropdown chọn kênh marketing (Facebook, Zalo, TikTok, Website, Khách giới thiệu, Trực tiếp, Khác).
    2. **Chi tiết chuyến đi & Dịch vụ:**
       - Sản phẩm đã gửi (*) (Dropdown chọn từ bảng `tours` đang kích hoạt hoặc tour hiện tại).
       - Ngày đặt đơn (*) (Mặc định là ngày hiện tại).
       - Tháng khởi hành (*) (Tích hợp component `MonthMultiSelector` cho phép khách hàng chọn một hoặc nhiều tháng mong muốn trong năm dạng `MM/YYYY`, ví dụ: `02/2027`, `03/2027`, `05/2027`).
       - **Tiêu chuẩn khách sạn:** Chọn từ 1 đến 5 sao thông qua component `StarRating`.
       - **Loại phòng lưu trú:** Dropdown chọn từ danh mục bảng `room_types` (Standard, Deluxe, Suite, Family...).
       - Trạng thái đơn tour (Dropdown 4 trạng thái: *Mới, Đang tư vấn, Đã chốt, Đã hủy*).
    3. **Ghi chú & Yêu cầu đặc biệt:**
       - Khung textarea nhập các lưu ý về phòng, số lượng khách, thực đơn ăn uống, thanh toán cọc...
  - Nút bấm chân trang:
    - Nút *"Hủy bỏ"* (Quay lại trang trước).
    - Nút *"Lưu đơn tour"* (Gửi dữ liệu lên Supabase, có spinner trạng thái).

---

### Screen 09 — Chi tiết đơn tour
- **Đường dẫn (Route):** `/orders/:id`
- **Quyền truy cập:** Admin (Xem mọi đơn) & Saler (Xem đơn của chính mình)
- **Bố cục giao diện:**
  - **Thanh tiêu đề:** Nút quay lại, Mã đơn lớn, Badge trạng thái hiện tại.
  - **Thanh chuyển trạng thái nhanh (Quick Status Switcher):** Dãy nút bấm chuyển nhanh giữa 4 trạng thái (*Mới*, *Đang tư vấn*, *Đã chốt*, *Đã hủy*) chỉ với 1 click.
  - **Hàng nút tác vụ bên phải:**
    - Nút *Chỉnh sửa* (Icon `Pencil`).
    - Nút *Xóa đơn tour* (Icon `Trash2` màu đỏ có modal xác nhận).
  - **Khung thông tin chi tiết:**
    - **Thẻ Khách hàng:** Họ tên, Quốc tịch (cờ + tên nước), Nguồn tiếp cận, SĐT click gọi điện, Email click gửi thư.
    - **Thẻ Hành trình & Dịch vụ:** Tên tour, Đánh giá sao khách sạn, Loại phòng, Ngày đặt, Ngày khởi hành, Nhân viên phụ trách.
    - **Thẻ Ghi chú:** Nội dung ghi chú chi tiết.
    - **Thẻ Nhật ký thời gian:** Thời điểm tạo đơn và thời điểm cập nhật mới nhất.

---

### Screen 10 — Quản lý Nhân viên Sale
- **Đường dẫn (Route):** `/admin/salers`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - Header trang: Tiêu đề *"Quản lý Nhân viên Sale"*, tổng số nhân sự, nút `+ Thêm nhân viên`.
  - Thanh tìm kiếm theo tên nhân viên, username hoặc email.
  - **Bảng danh sách nhân viên:**
    - Avatar (ảnh đại diện hoặc chữ cái) + Tên nhân viên.
    - Tên đăng nhập (Username dạng `@saler01`).
    - Email liên hệ.
    - Số lượng đơn tour đã xử lý.
    - Trạng thái tài khoản: Badge *Hoạt động* (Xanh) hoặc *Đã khóa* (Đỏ).
    - **Thao tác:**
      - Nút *Đặt lại mật khẩu* (Icon `Key`): Mở modal cấp mật khẩu mới trực tiếp.
      - Switch/Nút *Khóa / Mở khóa tài khoản* (`Lock` / `Unlock`): Cập nhật cờ `is_active`.
- **Modal Thêm nhân viên mới:**
  - Họ và tên nhân viên.
  - Email công vụ.
  - Tên đăng nhập (Tự động gợi ý).
  - Mật khẩu tạm thời (Có nút bấm *Tạo tự động* an toàn).
  - Nút *Tạo tài khoản*.

---

### Screen 11 — Hoạt động hệ thống
- **Đường dẫn (Route):** `/admin/activity`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - Header trang: Tiêu đề *"Nhật ký hoạt động hệ thống"*.
  - **Chỉ báo Realtime:** Chấm xanh nhấp nháy kèm chữ `● LIVE — Cập nhật thời gian thực` (Sử dụng kênh Supabase Realtime).
  - Thanh công cụ: Tìm kiếm theo tên nhân viên, lọc theo loại hành động (*Đăng nhập, Tạo đơn, Chỉnh sửa đơn, Xóa đơn, Khóa tài khoản*), lọc theo ngày.
  - **Dòng thời gian hoạt động (Activity Feed / Table):**
    - Cột Thời gian: `HH:mm:ss dd/mm/yyyy`.
    - Cột Nhân sự: Avatar + Tên tài khoản thực hiện.
    - Cột Hành động: Badge phân loại có màu sắc phân biệt (`LOGIN` - Xanh lá, `CREATE_ORDER` - Xanh dương, `UPDATE_ORDER` - Vàng cam, `DELETE_ORDER` - Đỏ).
    - Cột Chi tiết: Mô tả cụ thể (VD: *Tạo đơn mới #ORD-A27B79 cho khách hàng Nguyễn Văn A*).
    - Cột Địa chỉ IP & Thiết bị: Hiển thị IP và trình duyệt thực hiện tác vụ.

---

### Screen 12 — Cài đặt Hệ thống - Tour & Loại phòng
- **Đường dẫn (Route):** `/admin/settings`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - Header trang: Tiêu đề *"Cài đặt Hệ thống"*, mô tả quản trị danh mục dùng chung cho toàn bộ công ty.
  - **Thanh Tabs chuyển đổi:**
    - **Tab 1: Quản lý Danh mục Tour:**
      - Danh sách tất cả các tour du lịch hiện có trong bảng `tours`.
      - Ô nhập thêm tour mới: Tên tour du lịch, mô tả ngắn, giá niêm yết tham khảo.
      - Nút sửa tên tour tại chỗ và nút xóa tour.
    - **Tab 2: Quản lý Danh mục Loại phòng:**
      - Danh sách các loại phòng lưu trú trong bảng `room_types` (Standard, Deluxe, Suite, Villa, Bungalow...).
      - Thêm mới loại phòng, chỉnh sửa và xóa danh mục.

---

### Screen 13 — Trang Hồ sơ Cá nhân & Âm thanh
- **Đường dẫn (Route):** `/profile`
- **Quyền truy cập:** Nhân viên Sale & Quản trị viên đã đăng nhập
- **Bố cục giao diện:**
  - Header trang: Tiêu đề *"Hồ sơ cá nhân"*, mô tả cập nhật thông tin nhận diện tài khoản.
  - **Khu vực Ảnh đại diện (Avatar Section):**
    - Hiển thị avatar tròn lớn hiện tại.
    - Nút *"Tải ảnh lên"* (Hỗ trợ định dạng `.jpg`, `.jpeg`, `.png`, `.webp`, dung lượng tối đa 5MB).
    - Xử lý upload trực tiếp lên Supabase Storage bucket `avatars` và cập nhật cột `avatar_url` trong bảng `profiles`.
  - **Khu vực Thông tin tài khoản:**
    - Tên hiển thị (`display_name`): Ô nhập có thể chỉnh sửa và bấm lưu.
    - Tên đăng nhập (`username`): Readonly.
    - Email công vụ: Readonly.
    - Chức vụ / Vai trò: Badge hiển thị Quản trị viên (`admin`) hoặc Nhân viên Sale (`saler`).
  - **Cài đặt Âm thanh Thông báo:**
    - Nút kiểm tra âm thanh thông báo (*Test notification sound*): Phát thử chuông âm bổng tổng hợp qua Web Audio API synthesizer.

---

## 4. Đặc tả Bộ lọc Thông minh (Smart Filter Specification)

Bộ lọc đơn hàng tại `/admin/orders` và `/orders` được xây dựng với tư duy UX tối ưu, giải quyết triệt để vấn đề xung đột tiêu chí lọc:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BỘ LỌC TỔNG HỢP (FILTER BAR)                                                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [👤 Tìm tên khách]   [📞 Số điện thoại]   [✉️ Email]   [🏖️ Sản phẩm đã gửi] [👥 Saler ▼] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Trạng thái: Tất cả ▼]  [📅 Tháng đi tour · sep. 2026 +1 ▼]  [⟲ Xóa tìm kiếm]          │
│                                                                                        │
│ ┌─── Dropdown Lọc Thời Gian (Click mở Popover) ──────────────────────────────────────┐ │
│ │  TIÊU CHÍ THỜI GIAN:  [ Ngày tạo đơn ]   [ Tháng đi tour (Active) ]                 │ │
│ │  ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  KHOẢNG THỜI GIAN:                                                                 │ │
│ │  ✓ Tất cả các tháng                                                                 │ │
│ │  Tháng này / Tháng tới / 3 tháng tới / Năm nay / Năm sau                           │ │
│ │  ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  CHỌN THÁNG CỤ THỂ (Lọc tức thì - Instant Reactive):                               │ │
│ │  ‹  Năm 2026  ›                                                                    │ │
│ │  [ene.] [feb.] [mar.] [abr.]                                                       │ │
│ │  [may.] [jun.] [jul.] [ago.]                                                       │ │
│ │  [sep.] [oct.] [nov.] [dic.]                                                       │ │
│ │  ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  [sep. 2026 ✕]  [nov. 2026 ✕]                                                      │ │
│ │  [Xóa chọn (2)]                                           Đang lọc 2 tháng         │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Quy tắc Tương tác & Lọc tức thì (Instant Reactive Multi-Month):
1. **Chuyển đổi Tiêu chí Lọc Ngày linh hoạt:** Người dùng có thể chuyển đổi giữa *Ngày tạo đơn* (`booking_date`) và *Tháng đi tour* (`tour_date`) mà không làm mất các điều kiện tìm kiếm từ khóa khác.
2. **Chọn nhiều tháng (Multi-month OR logic):** Khách hàng có nhu cầu đi trong một hoặc nhiều tháng khác nhau. Khi lọc nhiều tháng (ví dụ: `sep. 2026` và `nov. 2026`), hệ thống áp dụng logic OR: hiển thị mọi đơn tour có ít nhất một tháng khởi hành nằm trong danh sách đã chọn.
3. **Lọc tức thì (Instant Reactive - Không cần bấm nút Áp dụng):** Mỗi thao tác nhấp chọn/bỏ chọn tháng trong lưới 4x3 lập tức kích hoạt cập nhật bảng kết quả và badge trên thanh công cụ trong thời gian thực.
4. **Chuẩn hóa Tháng bằng Tiếng Tây Ban Nha:** Lưới tháng sử dụng chữ viết tắt chuẩn tiếng Tây Ban Nha chuyên nghiệp (`ene.`, `feb.`, `mar.`, `abr.`, `may.`, `jun.`, `jul.`, `ago.`, `sep.`, `oct.`, `nov.`, `dic.`), kèm tooltip hiển thị tên đầy đủ (`enero`, `febrero`,...).
5. **Nút Reset & Xóa chọn:** Có nút *"Xóa chọn"* trong popover và nút `✕` trên badge `table-meta` để đưa bộ lọc về trạng thái ban đầu nhanh chóng.

---

## 5. Đặc tả Giao diện Responsive Mobile (<768px)

Giao diện mobile được tối ưu chuyên biệt cho trải nghiệm thao tác trên thiết bị di động:

1. **Điều hướng Sidebar -> Hamburger Drawer:**
   - Trên màn hình `<768px`, Sidebar được ẩn đi. Topbar xuất hiện nút bấm Menu Hamburger.
   - Khi nhấp Menu Hamburger, Sidebar trượt ra dạng Drawer từ cạnh trái với lớp phủ mờ (backdrop overlay), đóng lại khi chọn mục hoặc bấm ra ngoài.
2. **Chuyển đổi Bảng sang Card View (`.orders-cards-mobile`):**
   - Ẩn hoàn toàn bảng rộng nhiều cột (`.orders-table-desktop { display: none; }`).
   - Hiển thị danh sách Card đơn tour (`.orders-cards-mobile { display: flex; flex-direction: column; gap: 12px; }`).
   - Mỗi Card hiển thị:
     - Header Card: Mã đơn tour `#ORD-XXXXXX` (in đậm) + Badge trạng thái 4 màu.
     - Body Card: Tên khách hàng, Quốc kỳ & Nguồn, Số điện thoại (Chip bấm gọi trực tiếp), Tên tour du lịch, Ngày khởi hành.
     - Footer Card: Hàng 3 nút tác vụ kích thước chuẩn chạm ngón tay (tối thiểu 40x40px): Xem chi tiết, Chỉnh sửa, Xóa đơn.
3. **Bộ lọc trên Mobile:**
   - Các trường tìm kiếm tự động co giãn full width 100%.
   - Popover lọc ngày tự động căn giữa màn hình di động, phím tắt nhanh dạng lưới nút dễ bấm.
4. **Biểu đồ Dashboard:**
   - Recharts responsive container tự động co giãn 100% chiều rộng màn hình, không gây tràn ngang (horizontal scroll).

---

## 6. Trạng thái Phản hồi & Tương tác (Feedback & Interactive States)

### 6.1 Trạng thái Tải dữ liệu (Loading States)
- **Toàn trang:** Skeleton placeholders hoặc spinner trung tâm tinh gọn khi tải phiên đăng nhập hoặc tải dữ liệu.
- **Nút bấm Submit:** Icon chuyển thành spinner xoay tròn, nút chuyển sang trạng thái `disabled` chống bấm trùng (double submit).

### 6.2 Trạng thái Trống (Empty States)
- Khi không có dữ liệu đơn tour: Hiển thị hình minh họa icon la bàn mờ, thông điệp *"Chưa có đơn tour nào"* kèm nút bấm dẫn nhanh tới *"Tạo đơn tour mới"*.
- Khi kết quả lọc không khớp: Hiển thị icon kính lúp, thông điệp *"Không tìm thấy đơn tour phù hợp với điều kiện tìm kiếm"* kèm nút *"Xóa bộ lọc"*.

### 6.3 Thông báo nổi (Toast Notifications)
- Xuất hiện ở góc trên bên phải màn hình (`top: 24px; right: 24px; z-index: 9999;`).
- Tự động biến mất sau 3.5 giây.
- **Success Toast:** Nền viền xanh lá, thông báo: *Tạo đơn thành công!*, *Xóa đơn thành công!*, *Đổi mật khẩu thành công!*.
- **Error Toast:** Nền viền đỏ, thông báo: *Lỗi kết nối cơ sở dữ liệu*, *Không có quyền thực hiện thao tác*.

### 6.4 Hộp thoại xác nhận nguy hiểm (Confirmation Modals)
- Bắt buộc kích hoạt trước khi thực thi:
  - **Xóa đơn tour (Admin & Saler)**: *"Bạn có chắc chắn muốn xóa đơn tour này? Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục."*
  - **Khóa tài khoản nhân viên**: *"Nhân viên này sẽ bị ngắt phiên đăng nhập và không thể truy cập hệ thống."*
  - **Xóa Tour / Loại phòng**: Cảnh báo xác nhận trước khi xóa mục trong cài đặt.

---

## 7. Ma trận Phân quyền & Hành động Giao diện (Role-Action Matrix)

| Màn hình & Tác vụ UI | Quản trị viên (Admin) | Nhân viên Sale (Saler) | Ghi chú kỹ thuật |
|---|---|---|---|
| **Chuyển đổi Theme Sáng/Tối** | ✅ Có quyền | ✅ Có quyền | Nút icon Topbar & Menu Sidebar |
| **Bảng điều khiển (`/dashboard`)** | ✅ Toàn quyền xem KPIs & Chart | ❌ Chặn truy cập (Redirect) | RLS + Route Guard |
| **Xem danh sách đơn tour** | ✅ Xem tất cả đơn toàn công ty | ✅ Chỉ xem đơn của chính mình | Cách ly dữ liệu tại Supabase RLS |
| **Tạo đơn tour mới** | ✅ Có quyền | ✅ Có quyền | Gán `saler_id = auth.uid()` |
| **Chỉnh sửa đơn tour** | ✅ Sửa mọi đơn | ✅ Chỉ sửa đơn của mình | RLS UPDATE Policy |
| **Xóa đơn tour** | ✅ Xóa bất kỳ đơn nào | ✅ **Xóa đơn của chính mình** | RLS DELETE Policy `Salers can delete their own orders` |
| **Lọc ngày nâng cao & Auto-clear** | ✅ Đầy đủ | ✅ Đầy đủ | Dropdown lọc kép + Clear cụ thể |
| **Xuất dữ liệu CSV** | ✅ Xuất tất cả đơn | ✅ Xuất đơn của mình | Hàm `exportData` trên frontend |
| **Quản lý Nhân viên (`/admin/salers`)** | ✅ Tạo, sửa, khóa, reset pass | ❌ Chặn truy cập | Chỉ dành riêng cho Admin |
| **Cài đặt Tour & Loại phòng (`/admin/settings`)** | ✅ Thêm, sửa, xóa tour/phòng | ❌ Chặn truy cập | Bảng `tours`, `room_types` |
| **Xem Nhật ký hệ thống (`/admin/activity`)** | ✅ Xem Realtime toàn hệ thống | ❌ Chặn truy cập | Supabase Realtime Stream |
| **Trang Hồ sơ cá nhân (`/profile`)** | ✅ Đổi tên, tải avatar | ✅ Đổi tên, tải avatar | Upload Supabase Bucket `avatars` |
| **Đổi mật khẩu cá nhân** | ✅ Có quyền | ✅ Có quyền | Trang `/settings/change-password` |

---

*Tài liệu đặc tả UI này là căn cứ chuẩn mực cho thiết kế và kiểm thử giao diện của dự án TourFlow CRM.*
