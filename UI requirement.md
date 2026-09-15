# UI Design & Specification — TourFlow CRM

> **Tài liệu đặc tả giao diện người dùng (UI Specification)** cho hệ thống **TourFlow CRM — Website Quản Lý Đơn Tour**.  
> Được cập nhật chuẩn xác theo kiến trúc hiện hành của dự án: React 18, TypeScript, Vanilla CSS Tokens, Lucide Icons, hỗ trợ **Light/Dark Mode**, **Sticky Layout**, **Bộ lọc ngày kép**, **Quyền xóa đơn của Saler**, và **Topbar User Badge**.

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
4. [Đặc tả Bộ lọc Thông minh (Smart Filter Specification)](#4-đặc-tả-bộ-lọc-thông-minh-smart-filter-specification)
5. [Trạng thái Phản hồi & Tương tác (Feedback & Interactive States)](#5-trạng-thái-phản-hồi--tương-tác-feedback--interactive-states)
6. [Ma trận Phân quyền & Hành động Giao diện (Role-Action Matrix)](#6-ma-trận-phân-quyền--hành-động-giao-diện-role-action-matrix)

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

Hệ thống token màu được khai báo thông qua biến CSS (`CSS Variables`) tại `index.css`:

| Token biến CSS | Dark Mode (Mặc định) | Light Mode | Ý nghĩa & Vị trí ứng dụng |
|---|---|---|---|
| `--bg` | `#0d111b` | `#f8fafc` | Nền canvas toàn bộ ứng dụng |
| `--surface` | `#101721` | `#ffffff` | Nền Sidebar, Topbar, Modal popups |
| `--card` | `#151b27` | `#ffffff` | Nền thẻ thống kê, card bảng, container |
| `--card-hover` | `#1a2232` | `#f1f5f9` | Trạng thái hover trên hàng bảng / item danh sách |
| `--border` | `#253044` | `#e2e8f0` | Đường kẻ phân cách, viền input, border thẻ |
| `--border-focus` | `#3b82f6` | `#2563eb` | Viền khi focus vào ô input, viền active |
| `--text` / `--text-main` | `#f3f6fc` | `#0f172a` | Chữ tiêu đề, nội dung chính, dữ liệu quan trọng |
| `--text-muted` | `#8b9bb4` | `#475569` | Label form, thời gian, chú thích phụ, placeholder |
| `--accent` | `#4b83d1` | `#2563eb` | Màu thương hiệu chính, nút CTA, icon nổi bật |
| `--accent-hover` | `#3a70be` | `#1d4ed8` | Hover trên nút chính |
| `--accent-glow` | `rgba(75, 131, 209, 0.25)` | `rgba(37, 99, 235, 0.2)` | Hiệu ứng đổ bóng phát sáng (Focus Ring) |

---

### 1.3 Hệ thống Badges trạng thái (Status Colors)

Mỗi trạng thái đơn tour và hoạt động có mã màu riêng biệt đảm bảo khả năng nhận diện ngay lập tức:

| Trạng thái Đơn | Token Text Dark | Background Dark | Token Text Light | Background Light |
|---|---|---|---|---|
| **MỚI** (`new`) | `#94a3b8` | `rgba(100, 116, 139, 0.15)` | `#475569` | `#f1f5f9` |
| **ĐÃ XÁC NHẬN** (`confirmed`) | `#38bdf8` | `rgba(56, 189, 248, 0.15)` | `#0284c7` | `#e0f2fe` |
| **ĐÃ CỌC** (`deposited`) | `#f59e0b` | `rgba(245, 158, 11, 0.15)` | `#d97706` | `#fef3c7` |
| **HOÀN THÀNH** (`completed`) | `#22c55e` | `rgba(34, 197, 94, 0.15)` | `#16a34a` | `#dcfce7` |
| **ĐÃ HỦY** (`cancelled`) | `#f43f5e` | `rgba(244, 63, 94, 0.15)` | `#dc2626` | `#fee2e2` |

---

### 1.4 Kiểu chữ (Typography)

Sử dụng bộ font hệ thống hiện đại, tối ưu rendering trên mọi màn hình:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Cấp độ | Cỡ chữ (Size) | Độ đậm (Weight) | Màu chữ (Dark / Light) | Ứng dụng |
|---|---|---|---|---|
| **Display H1** | `22px - 24px` | `700` (Bold) | `#f3f6fc` / `#0f172a` | Tiêu đề trang chính (Bảng điều khiển, Đơn tour) |
| **Section H2** | `17px - 18px` | `600` (Semibold) | `#f3f6fc` / `#0f172a` | Tiêu đề card biểu đồ, tiêu đề modal, tên form |
| **Card Title** | `14px - 15px` | `600` (Semibold) | `#8b9bb4` / `#475569` | Label thẻ thống kê KPI |
| **Big KPI Value** | `26px - 28px` | `700` (Bold) | `#f3f6fc` / `#0f172a` | Giá trị số liệu lớn trên KPI Card |
| **Body Regular** | `13px - 14px` | `400` (Normal) | `#f3f6fc` / `#0f172a` | Nội dung hàng bảng, đoạn mô tả |
| **Code / Chip ID** | `12px` | `500` (Medium) | Monospace / Semibold | Mã đơn `#ORD-XXXXXX`, ngày giờ |
| **Caption / Label** | `11px - 12px` | `500` (Medium) | `#8b9bb4` / `#475569` | Label input, tooltip, metadata phụ |

---

### 1.5 Hệ thống Lưới, Spacing & Bo góc

- **Spacing Scale:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.
- **Border Radius:**
  - Nút bấm (Button), Ô nhập (Input), Dropdown trigger: `8px`.
  - Thẻ thông tin (Card), Bảng dữ liệu: `12px`.
  - Hộp thoại Modal: `14px - 16px`.
  - Badge trạng thái, Phone Chip: `6px - 8px`.
  - Avatar hình tròn: `50%`.
- **Shadows:**
  - Card Shadow: `0 4px 20px rgba(0, 0, 0, 0.15)`.
  - Modal Drop Shadow: `0 20px 40px rgba(0, 0, 0, 0.45)`.
  - Popover / Dropdown Menu: `0 8px 24px rgba(0, 0, 0, 0.25)`.

---

### 1.6 Quy chuẩn Component cơ bản

#### 1. Nút bấm (Button System)
- **Primary Button (`.btn-primary`):** Nền `--accent`, chữ trắng, bo góc `8px`, hiệu ứng hover sáng nhẹ, padding `8px 16px`. Dùng cho hành động chính: *Lưu đơn*, *Tạo đơn mới*, *Thêm nhân viên*.
- **Secondary / Ghost Button (`.btn-secondary`):** Nền trong suốt hoặc `--surface`, viền `1px solid --border`, chữ `--text-main`. Dùng cho: *Hủy*, *Xem chi tiết*, *Lọc ngày*.
- **Danger Action Button (`.action-btn-danger`):** Nút icon thùng rác viền đỏ, hover nền đỏ nhạt (`rgba(244, 63, 94, 0.15)`), chữ đỏ `#f43f5e`. Dùng cho: *Xóa đơn*, *Khóa tài khoản*.
- **Small Action Button (`.action-btn`):** Kích thước nhỏ gọn `32x32px`, căn giữa icon xem (Eye), sửa (Pencil), xóa (Trash2).

#### 2. Ô nhập liệu (Input & Select)
- Nền `--bg` (Dark) hoặc `#ffffff` (Light), viền `1px solid --border`.
- Focus State: Viền chuyển `--border-focus`, thêm box-shadow vòng hào quang `--accent-glow`.
- Chiều cao chuẩn: `38px` (bộ lọc compact) và `42px` (form tạo/sửa).

#### 3. Chip số điện thoại tương tác (Phone Chip)
- Hiển thị SĐT khách hàng dạng chip có icon điện thoại.
- Clickable dạng `tel:0901234567`, hover đổi màu nhẹ, tiện lợi cho Saler gọi nhanh ngay từ bảng.

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
│  - Hoạt động hệ thống │  │ Khung Bộ lọc đa tiêu chí (Search, Status, Date Picker)   │  │
│                       │  ├──────────────────────────────────────────────────────────┤  │
│  (Dưới cùng Sidebar)  │  │ Bảng dữ liệu chi tiết (Table) kèm Phân trang              │  │
│  [AD] Admin System    │  └──────────────────────────────────────────────────────────┘  │
│  [Menu Tài khoản]     │                                                                │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

### 2.1 Sticky Sidebar (Cột điều hướng cố định 100vh)
- **Vị trí & Kích thước:** `position: sticky; top: 0; height: 100vh; width: 260px; z-index: 40;`.
- **Cố định tuyệt đối:** Khi người dùng cuộn xem hàng nghìn đơn hàng, Sidebar **vẫn đứng yên**, không bao giờ bị cuộn mất.
- **Thành phần trên cùng:**
  - Logo biểu tượng la bàn/mũi tên + Chữ "TourFlow CRM" nổi bật.
  - Tag trạng thái workspace: *"Workspace nội bộ"*.
- **Danh mục điều hướng theo phân quyền:**
  - **Admin:** *Bảng điều khiển* (`/dashboard`), *Tất cả đơn tour* (`/admin/orders`), *Nhân viên Sale* (`/admin/salers`), *Hoạt động hệ thống* (`/admin/activity`).
  - **Saler:** *Đơn của tôi* (`/orders`), *Tạo đơn mới* (`/orders/new`).
- **Thành phần dưới cùng (User Card & Popup Menu):**
  - Khối profile gồm avatar hình tròn chứa 2 chữ cái viết tắt, tên hiển thị, và chức vụ.
  - Nhấp chuột mở popup menu nhanh: *Đổi mật khẩu*, *Đổi giao diện Sáng / Tối*, *Đăng xuất*.

### 2.2 Sticky Topbar (Thanh điều hướng đỉnh cao cấp)
- **Vị trí & Kích thước:** `position: sticky; top: 0; z-index: 30; height: 60px;`.
- **Hiệu ứng Glassmorphism:** Nền bán trong suốt kết hợp làm mờ hậu cảnh (`backdrop-filter: blur(12px)`), viền đáy mỏng `--border`.
- **Thành phần bên trái:**
  - Đường dẫn Breadcrumb thông minh: `TourFlow / Bảng điều khiển`, `TourFlow / Quản lý đơn tour`.
- **Thành phần bên phải:**
  - **Ngày giờ hệ thống:** Hiển thị thứ ngày tháng hiện tại (VD: *Thứ Năm, 10/09/2026*).
  - **Chuông thông báo (Bell):** Icon chuông với chấm xanh báo hiệu hoạt động realtime.
  - **Nút chuyển đổi Giao diện (Theme Toggle):**
    - Biểu tượng Mặt trời (`Sun`) khi đang ở Dark Mode (click để sang Light).
    - Biểu tượng Mặt trăng (`Moon`) khi đang ở Light Mode (click để sang Dark).

### 2.3 Khu vực Nội dung chính (Main Content Viewport)
- Cuộn mượt (`overflow-y: auto`), padding chuẩn `28px 32px`.
- Độ rộng co giãn tối ưu cho màn hình Desktop độ phân giải từ 1280px đến 2560px.

---

## 3. Đặc tả Chi tiết Từng Màn hình (Screen Specifications)

---

### Screen 01 — Đăng nhập
- **Đường dẫn (Route):** `/login`
- **Quyền truy cập:** Public (Người chưa đăng nhập)
- **Bố cục giao diện:**
  - Toàn trang căn giữa tuyệt đối (`min-height: 100vh; display: flex; align-items: center; justify-content: center;`).
  - Nền tối hiệu ứng gradient radial chiều sâu.
  - Hộp đăng nhập (Card) kích thước `440px`, bo góc `16px`, viền phát sáng nhẹ.
- **Thành phần bên trong:**
  - Logo TourFlow CRM và tiêu đề: *"Đăng nhập hệ thống điều hành"*.
  - Ô nhập Tên đăng nhập / Email (Icon `@`).
  - Ô nhập Mật khẩu (Icon Khóa, nút bật/tắt hiển thị mật khẩu Eye/EyeOff).
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
  - Hộp thông tin dạng Card tối giản `440px`.
  - Tiêu đề: *"Khôi phục mật khẩu"*, mô tả: *"Nhập email đã đăng ký của bạn để nhận liên kết đặt lại mật khẩu an toàn."*
  - Ô nhập Email công vụ.
  - Nút bấm: *"Gửi hướng dẫn khôi phục"*.
  - Nút *"Quay lại đăng nhập"*.
- **Phản hồi:**
  - Sau khi gửi: Chuyển sang trạng thái thành công với thông báo kiểm tra hộp thư email và đồng hồ đếm ngược gửi lại (60s cooldown).

---

### Screen 03 — Đặt lại mật khẩu từ email
- **Đường dẫn (Route):** `/reset-password`
- **Quyền truy cập:** Public (Kèm mã xác thực `access_token` hợp lệ trong URL hash từ Supabase Auth)
- **Bố cục giao diện:**
  - Card nhập mật khẩu mới.
  - Ô 1: *Mật khẩu mới* (Tối thiểu 6 ký tự).
  - Ô 2: *Xác nhận mật khẩu mới*.
  - Kiểm tra trực quan: Báo lỗi ngay nếu 2 mật khẩu không trùng khớp.
  - Nút: *"Cập nhật mật khẩu mới"*.
  - Sau khi thành công: Tự động đăng xuất phiên tạm và chuyển hướng về `/login` kèm thông báo xanh.

---

### Screen 04 — Đổi mật khẩu trong hệ thống
- **Đường dẫn (Route):** `/settings/change-password`
- **Quyền truy cập:** Nhân viên Sale & Quản trị viên đã đăng nhập
- **Bố cục giao diện:**
  - Nằm trong khung Layout chung (có Sidebar và Topbar).
  - Form bảo mật chuẩn gồm:
    - *Mật khẩu mới*
    - *Xác nhận mật khẩu mới*
  - Nút bấm: *"Lưu thay đổi"* và *"Hủy bỏ"*.
  - Báo toast notification nổi góc phải sau khi cập nhật thành công.

---

### Screen 05 — Bảng điều khiển Quản trị
- **Đường dẫn (Route):** `/dashboard`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - **Header trang:** Tiêu đề *"Bảng điều khiển"*, mô tả tổng quan doanh thu & điều hành đơn tour.
  - **Bộ lọc thời gian nhanh:** Nút chọn khoảng thời gian phân tích: `7 ngày qua` | `30 ngày qua` | `Tháng này`.
  - **Hàng Thống kê Chỉ số Cốt lõi (4 KPI Cards):**
    1. **Tổng đơn:** Icon túi hàng (`ShoppingBag`), hiển thị tổng số lượng đơn đặt trong kỳ.
    2. **Đang xử lý:** Icon đồng hồ (`Clock`), tổng hợp các đơn có trạng thái *Mới*, *Đã xác nhận*, *Đã cọc*.
    3. **Hoàn thành:** Icon tích xanh (`CheckCircle2`), các đơn tour đã hoàn tất chuyến đi.
    4. **Tỷ lệ hoàn thành:** Icon xu hướng (`TrendingUp`), phần trăm đơn thành công trên tổng đơn đã chốt.
  - **Khu vực Trực quan hóa Dữ liệu (Analytics Grid - 2 cột):**
    - **Cột 1: Cơ cấu trạng thái đơn tour:** Danh sách 5 thanh tiến độ ngang phân tầng (Progress bar tracks) hiển thị số lượng và phần trăm của từng trạng thái (*Mới, Đã xác nhận, Đã cọc, Hoàn thành, Đã hủy*) với màu sắc chuẩn của Design System.
    - **Cột 2: Xu hướng đơn tour:** Biểu đồ xu hướng theo ngày phản ánh trực quan nhịp độ phát sinh đơn đặt tour.
  - *(Lưu ý chuẩn hóa: Bảng "Đơn tour gần đây" đã được loại bỏ khỏi trang Dashboard theo yêu cầu để giữ giao diện cô đọng, tập trung toàn diện vào các chỉ số phân tích điều hành).*

---

### Screen 06 — Quản lý Tất cả Đơn tour - Admin
- **Đường dẫn (Route):** `/admin/orders`
- **Quyền truy cập:** Chỉ Quản trị viên (Admin)
- **Bố cục giao diện:**
  - **Header:** Tiêu đề *"Tất cả đơn tour"*, tổng số đơn trong hệ thống, nút tác vụ nhanh.
  - **Thanh Bộ lọc Nâng cao (Advanced Filter Bar):**
    - Ô tìm kiếm Tên khách hàng.
    - Ô tìm kiếm Số điện thoại khách hàng.
    - Ô tìm kiếm Email khách hàng.
    - Ô tìm kiếm Tên chuyến tour.
    - Dropdown lọc theo **Nhân viên Sale phụ trách** (Chọn cụ thể từng nhân viên hoặc tất cả).
    - Dropdown lọc theo **Trạng thái đơn** (Mới, Đã xác nhận, Đã cọc, Hoàn thành, Đã hủy).
    - Dropdown **Lọc Ngày nâng cao (Dual Date Filter)**:
      - Tùy chọn lọc theo: *Ngày đặt đơn (`booking_date`)* HOẶC *Ngày đi tour (`tour_date`)*.
      - Phím tắt nhanh: *Hôm nay*, *Hôm qua*, *7 ngày qua*, *30 ngày qua*, *Tháng này*, *Tháng trước*.
      - Ô chọn ngày cụ thể (`input date picker`). Khi click phím tắt nhanh, ô ngày cụ thể sẽ **tự động xóa** để không gây xung đột tiêu chí lọc.
    - Nút *"Xóa bộ lọc"* (RotateCcw icon): Hiển thị khi đang có bất kỳ điều kiện lọc nào được kích hoạt.
  - **Bảng dữ liệu Đơn tour (Admin Data Table):**
    - Cột 1: **Mã đơn** (Tag dạng `#ORD-XXXXXX`).
    - Cột 2: **Khách hàng** (Tên in đậm + Email hiển thị màu phụ).
    - Cột 3: **Số điện thoại** (Phone Chip có thể click gọi điện thoại ngay).
    - Cột 4: **Tour du lịch** (Tên tour nổi bật).
    - Cột 5: **Ngày đặt** (Định dạng `dd/mm/yyyy`).
    - Cột 6: **Ngày đi tour** (Định dạng `dd/mm/yyyy`).
    - Cột 7: **Phụ trách (Saler)** (Badge nhân viên với avatar chữ cái).
    - Cột 8: **Trạng thái** (Badge màu chuẩn theo trạng thái đơn).
    - Cột 9: **Thao tác**:
      - Nút Xem chi tiết (Icon mắt `Eye`).
      - Nút Chỉnh sửa (Icon bút chì `Pencil`).
      - **Nút Xóa đơn** (Icon thùng rác đỏ `Trash2`): Kích hoạt hộp thoại cảnh báo xác nhận trước khi xóa vĩnh viễn khỏi Database.
  - **Phân trang (Pagination Bar):** Điều khiển trang Trước/Sau và hiển thị tổng số kết quả.

---

### Screen 07 — Đơn tour của tôi - Saler
- **Đường dẫn (Route):** `/orders`
- **Quyền truy cập:** Nhân viên Sale (Saler)
- **Bố cục giao diện:**
  - Tương tự bảng của Admin nhưng được tối ưu hóa riêng cho cá nhân Saler:
    - RLS chỉ trả về các đơn tour do chính Saler đó tạo ra.
    - Nút CTA nổi bật ở Header: `+ Tạo đơn mới` (Dẫn tới `/orders/new`).
    - Bộ lọc tìm kiếm và bộ lọc ngày kép đầy đủ tính năng.
    - Không có cột chọn nhân viên sale phụ trách.
  - **Thao tác trên từng đơn:**
    - Xem chi tiết (Icon `Eye`).
    - Chỉnh sửa thông tin đơn (Icon `Pencil`).
    - **Xóa đơn của chính mình (Icon `Trash2` màu đỏ):** Saler có toàn quyền xóa các đơn do chính mình tạo ra nếu nhập sai hoặc khách hủy nhầm. Có hộp thoại xác nhận bảo vệ.

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
       - Số điện thoại liên hệ (*) (Bắt buộc, tự động format chuẩn).
       - Email khách hàng (Tùy chọn).
    2. **Chi tiết chuyến đi:**
       - Tên tour du lịch (*) (Bắt buộc).
       - Ngày đặt đơn (*) (Mặc định là ngày hiện tại).
       - Ngày khởi hành / đi tour (*) (Ràng buộc: Ngày đi tour phải lớn hơn hoặc bằng Ngày đặt đơn).
       - Trạng thái đơn tour (Dropdown chọn 1 trong 5 trạng thái).
    3. **Ghi chú & Yêu cầu đặc biệt:**
       - Khung textarea nhập các lưu ý về phòng, số lượng khách, chế độ ăn uống, đặt cọc...
  - Nút bấm chân trang:
    - Nút *"Hủy bỏ"* (Quay lại trang trước).
    - Nút *"Lưu đơn tour"* (Gửi dữ liệu lên Supabase, có spinner trạng thái).

---

### Screen 09 — Chi tiết đơn tour
- **Đường dẫn (Route):** `/orders/:id`
- **Quyền truy cập:** Admin (Xem mọi đơn) & Saler (Xem đơn của chính mình)
- **Bố cục giao diện:**
  - **Thanh tiêu đề:** Nút quay lại, Mã đơn lớn, Badge trạng thái hiện tại.
  - **Hàng nút tác vụ bên phải:**
    - Nút *Chỉnh sửa* (Icon `Pencil`).
    - **Nút *Xóa đơn tour* (Icon `Trash2` màu đỏ):** Hiển thị cho cả Admin và Saler phụ trách đơn.
  - **Khung thông tin chi tiết:**
    - **Thẻ Khách hàng:** Tên đầy đủ, số điện thoại bấm gọi ngay, địa chỉ email bấm gửi thư ngay.
    - **Thẻ Hành trình & Dịch vụ:** Tên tour, Ngày đặt, Ngày khởi hành, Nhân viên phụ trách.
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
    - Avatar chữ cái + Tên nhân viên.
    - Tên đăng nhập (Username dạng `@saler01`).
    - Email liên hệ.
    - Số lượng đơn tour đã xử lý.
    - Trạng thái tài khoản: Badge *Hoạt động* (Xanh) hoặc *Đã khóa* (Xám/Đỏ).
    - **Thao tác:**
      - Nút *Đặt lại mật khẩu* (Icon chìa khóa `Key`): Mở modal cấp mật khẩu mới.
      - Switch/Nút *Khóa / Mở khóa tài khoản* (`Lock` / `Unlock`): Cập nhật cờ `is_active`.
- **Modal Thêm nhân viên mới:**
  - Họ và tên nhân viên.
  - Email công vụ.
  - Tên đăng nhập (Tự động tạo gợi ý hoặc chỉnh sửa).
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

## 4. Đặc tả Bộ lọc Thông minh (Smart Filter Specification)

Bộ lọc đơn hàng tại `/admin/orders` và `/orders` được xây dựng với tư duy UX tối ưu, giải quyết triệt để vấn đề xung đột tiêu chí lọc:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BỘ LỌC TỔNG HỢP (FILTER BAR)                                                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [👤 Tìm tên khách]   [📞 Số điện thoại]   [✉️ Email]   [🏖️ Tên chuyến tour]  [👥 Saler ▼] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Trạng thái: Tất cả ▼]  [📅 Lọc ngày: Ngày đặt đơn ▼]  [⟲ Xóa tất cả bộ lọc]           │
│                                                                                        │
│ ┌─── Dropdown Lọc Ngày (Click mở Popover) ───────────────────────────────────────────┐ │
│ │  CHẾ ĐỘ LỌC:  (●) Ngày đặt đơn (booking_date)    ( ) Ngày đi tour (tour_date)     │ │
│ │  ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  PHÍM TẮT NHANH:                                                                   │ │
│ │  [Hôm nay]  [Hôm qua]  [7 ngày qua]  [30 ngày qua]  [Tháng này]  [Tháng trước]     │ │
│ │  ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  HOẶC CHỌN NGÀY CỤ THỂ:                                                            │ │
│ │  [ 📅 Chọn ngày (dd/mm/yyyy)    ]   [ Xóa ngày ]                                   │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Quy tắc Tương tác & Xóa tiêu chí (Auto-clear Logic):
1. **Chuyển đổi Tiêu chí Lọc Ngày linh hoạt:** Người dùng có thể chuyển đổi giữa *Ngày đặt đơn* và *Ngày đi tour* mà không làm mất các điều kiện tìm kiếm từ khóa khác.
2. **Tự động xóa ngày cụ thể:** Khi người dùng đang chọn một ngày cụ thể (ví dụ: `10/09/2026`) nhưng sau đó bấm vào một nút phím tắt nhanh (ví dụ: `Hôm nay` hoặc `7 ngày qua`), trường ngày cụ thể sẽ **ngay lập tức được làm trống (clear)**, đảm bảo kết quả lọc luôn chính xác theo ý muốn người dùng mà không cần phải reload (F5) trang.
3. **Nút Reset tổng thể:** Khi có bất kỳ bộ lọc nào đang hoạt động, nút *"Xóa bộ lọc"* màu đỏ nhạt xuất hiện. Khi bấm vào, toàn bộ input tìm kiếm, dropdown trạng thái và ngày tháng được đưa về giá trị rỗng mặc định.

---

## 5. Trạng thái Phản hồi & Tương tác (Feedback & Interactive States)

### 5.1 Trạng thái Tải dữ liệu (Loading States)
- **Toàn trang:** Skeleton placeholders hoặc spinner trung tâm tinh gọn khi tải phiên đăng nhập hoặc tải trang ban đầu.
- **Nút bấm Submit:** Icon chuyển thành spinner xoay tròn, nút chuyển sang trạng thái `disabled` chống bấm trùng (double submit).

### 5.2 Trạng thái Trống (Empty States)
- Khi không có dữ liệu đơn tour: Hiển thị hình minh họa icon la bàn mờ, thông điệp *"Chưa có đơn tour nào"* kèm nút bấm dẫn nhanh tới *"Tạo đơn tour mới"*.
- Khi kết quả lọc không khớp: Hiển thị icon kính lúp, thông điệp *"Không tìm thấy đơn tour phù hợp với điều kiện tìm kiếm"* kèm nút *"Xóa bộ lọc"*.

### 5.3 Thông báo nổi (Toast Notifications)
- Xuất hiện ở góc trên bên phải màn hình (`top: 24px; right: 24px; z-index: 9999;`).
- Tự động biến mất sau 3.5 giây.
- **Success Toast:** Nền viền xanh lá, thông báo: *Tạo đơn thành công!*, *Xóa đơn thành công!*, *Đổi mật khẩu thành công!*.
- **Error Toast:** Nền viền đỏ, thông báo: *Lỗi kết nối cơ sở dữ liệu*, *Không có quyền thực hiện thao tác*.

### 5.4 Hộp thoại xác nhận nguy hiểm (Confirmation Modals)
- Bắt buộc kích hoạt trước khi thực thi:
  - **Xóa đơn tour (Admin & Saler)**: *"Bạn có chắc chắn muốn xóa đơn tour này? Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục."*
  - **Khóa tài khoản nhân viên**: *"Nhân viên này sẽ bị ngắt phiên đăng nhập và không thể truy cập hệ thống."*

---

## 6. Ma trận Phân quyền & Hành động Giao diện (Role-Action Matrix)

| Màn hình & Tác vụ UI | Quản trị viên (Admin) | Nhân viên Sale (Saler) | Ghi chú kỹ thuật |
|---|---|---|---|
| **Chuyển đổi Theme Sáng/Tối** | ✅ Có quyền | ✅ Có quyền | Nút icon Topbar & Menu Sidebar |
| **Bảng điều khiển (`/dashboard`)** | ✅ Toàn quyền xem KPIs & Chart | ❌ Chặn truy cập (Redirect) | RLS + Route Guard |
| **Xem danh sách đơn tour** | ✅ Xem tất cả đơn toàn công ty | ✅ Chỉ xem đơn của chính mình | Cách ly dữ liệu tại Supabase RLS |
| **Tạo đơn tour mới** | ✅ Có quyền | ✅ Có quyền | Gán `saler_id = auth.uid()` |
| **Chỉnh sửa đơn tour** | ✅ Sửa mọi đơn | ✅ Chỉ sửa đơn của mình | RLS UPDATE Policy |
| **Xóa đơn tour** | ✅ Xóa bất kỳ đơn nào | ✅ **Xóa đơn của chính mình** | RLS DELETE Policy `Salers can delete their own orders` |
| **Lọc ngày nâng cao & Auto-clear** | ✅ Đầy đủ | ✅ Đầy đủ | Dropdown lọc kép + Clear cụ thể |
| **Quản lý Nhân viên (`/admin/salers`)** | ✅ Tạo, sửa, khóa, reset pass | ❌ Chặn truy cập | Chỉ dành riêng cho Admin |
| **Xem Nhật ký hệ thống (`/admin/activity`)** | ✅ Xem Realtime toàn hệ thống | ❌ Chặn truy cập | Supabase Realtime Stream |
| **Đổi mật khẩu cá nhân** | ✅ Có quyền | ✅ Có quyền | Trang `/settings/change-password` |

---

*Tài liệu đặc tả UI này là căn cứ chuẩn mực cho thiết kế và hoàn thiện mã nguồn giao diện của dự án TourFlow CRM.*
