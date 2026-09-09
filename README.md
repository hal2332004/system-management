# Website Quản Lý Đơn Tour

**Website Quản Lý Đơn Tour** là hệ thống quản lý bán hàng nội bộ, được xây dựng nhằm hỗ trợ các **Saler** theo dõi và quản lý các đơn tour của mình, đồng thời cung cấp cho **Admin** khả năng quản lý toàn bộ dữ liệu và hoạt động của hệ thống.

Trong tương lai, hệ thống sẽ tích hợp dữ liệu từ API của các nền tảng bán hàng để Admin quản lý tập trung.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [User Roles](#user-roles)
- [User Stories](#user-stories)
- [Authentication](#authentication)
- [Tech Stack & Triển khai](#tech-stack--triển-khai)
- [Màn hình UI](#màn-hình-ui)
- [Database](#database)

---

## Tech Stack & Triển khai

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React / Next.js |
| **Hosting** | [Vercel](https://vercel.com) |
| **Backend / Database** | [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS) |
| **API** | Supabase REST API & Supabase JS Client |

### Kiến trúc triển khai

```
Browser
   ↓
Frontend (Vercel)
   ↓  gọi API
Supabase
   ├── Auth (đăng nhập, reset mật khẩu)
   ├── Database (PostgreSQL + RLS)
   └── REST API / Realtime
```

- Frontend được deploy lên **Vercel**, tự động CI/CD từ nhánh `main`.
- Mọi thao tác dữ liệu đều thông qua **Supabase API** — không có backend server riêng.
- Phân quyền được thực thi tại tầng database bằng **Row Level Security (RLS)** của Supabase.
- Biến môi trường cần cấu hình trên Vercel Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Tổng quan

Mỗi Saler có thể tạo, cập nhật và theo dõi các đơn hàng do mình phụ trách, bao gồm thông tin khách hàng, ngày đặt, tour, trạng thái đơn và ghi chú. Dữ liệu được phân quyền theo tài khoản, đảm bảo Saler **chỉ có thể xem và quản lý các đơn của chính mình**, không thể truy cập dữ liệu của Saler khác.

Admin có toàn quyền quản lý hệ thống, bao gồm **quản lý tài khoản Saler, tạo/update trạng thái tài khoản, cập nhật mật khẩu và theo dõi toàn bộ đơn tour**. Hệ thống cũng cung cấp các công cụ **lọc đơn theo trạng thái** và **trực quan hóa dữ liệu**, giúp Admin nhanh chóng nắm được tình hình kinh doanh và hiệu suất bán hàng.

---

## User Roles

| Role | Quyền |
|------|-------|
| **Saler** | Quản lý đơn của chính mình |
| **Admin** | Quản lý toàn bộ hệ thống |

---

## User Stories

### Saler

Là một Saler, tôi có thể nhập và quản lý các thông tin sau:

- Ngày nhận request
- Số điện thoại khách
- Họ và tên khách
- Email khách
- Nội dung tour
- Ngày đi tour
- Trạng thái tour
- Ghi chú

> Saler chỉ có thể xem và quản lý đơn của mình, **không thể xem đơn của Saler khác**.

### Admin

Là Admin, tôi có toàn bộ quyền:

- Quản lý tài khoản Saler: tạo, cập nhật trạng thái, đặt lại mật khẩu
- Xem danh sách tất cả tài khoản Saler và lịch sử đăng nhập (không hiển thị mật khẩu)
- Xem và quản lý toàn bộ đơn tour của mọi Saler
- Xem hoạt động hệ thống (IP, địa chỉ thiết bị, thời gian đăng nhập...)

> Tài khoản Admin được tạo thông qua SQL migration/Supabase bởi đội IT Support.

---

## Authentication

### Cấu trúc tài khoản

```
┌─────────────────────────────────┐
│ User                            │
├─────────────────────────────────┤
│ username     → saler01          │
│ email        → xxx@company.com  │
│ password     → hash             │
│ role         → saler / admin    │
│ status       → active/inactive  │
└─────────────────────────────────┘
```

- `status` dùng để xác định tài khoản có được phép sử dụng hệ thống hay không.
- Khi Admin tạo tài khoản Saler, cần nhập cả `username` và `email`.
- Khi đăng nhập, Saler nhập `username` và `password`.

---

### Đổi mật khẩu (đang đăng nhập)

Người dùng biết mật khẩu hiện tại — form có **3 ô**:

```
┌─────────────────────────────┐
│       Đổi mật khẩu          │
│                             │
│ Mật khẩu hiện tại           │
│ [____________________]      │
│                             │
│ Mật khẩu mới                │
│ [____________________]      │
│                             │
│ Xác nhận mật khẩu mới       │
│ [____________________]      │
│                             │
│       [Đổi mật khẩu]        │
└─────────────────────────────┘
```

---

### Reset mật khẩu (quên mật khẩu)

Người dùng không nhớ mật khẩu cũ. Sau khi click link trong email — form chỉ có **2 ô**:

```
┌─────────────────────────────┐
│      Đặt mật khẩu mới       │
│                             │
│ Mật khẩu mới                │
│ [____________________]      │
│                             │
│ Xác nhận mật khẩu mới       │
│ [____________________]      │
│                             │
│      [Đặt mật khẩu]         │
└─────────────────────────────┘
```

> Link trong email đã là bằng chứng xác thực, nên không cần nhập mật khẩu cũ.

---

### Flow quên mật khẩu (Supabase Auth)

```
Người dùng → "Quên mật khẩu"
     ↓
Nhập email
     ↓
Supabase Auth → Tạo recovery token
     ↓
Gửi email qua Custom SMTP
     ↓
Người dùng click link
     ↓
Trang "Đặt mật khẩu mới"
     ↓
Nhập password mới → Supabase cập nhật
```

```js
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://your-domain.com/update-password"
})
```

> **Lưu ý Production:** Supabase default email service giới hạn ~2 email/giờ.
> Nên cấu hình **Custom SMTP** (Resend, Brevo, AWS SES, SendGrid...) cho môi trường production.

---

### Tóm tắt 2 flow mật khẩu

| Flow | Điều kiện | Số ô nhập |
|------|-----------|----------|
| **Đổi mật khẩu** | Đang đăng nhập, biết mật khẩu cũ | 3 ô |
| **Reset mật khẩu** | Quên mật khẩu, xác thực qua email | 2 ô |

> Nên tách thành **2 trang/UI riêng** để UX rõ ràng hơn — có thể tái sử dụng phần layout.

---

## Màn hình UI

| # | Màn hình | Mô tả |
|---|----------|-------|
| 1 | **Đăng nhập** | Form username + password, link quên mật khẩu |
| 2 | **Quên mật khẩu** | Nhập email để nhận link reset |
| 3 | **Đổi mật khẩu** | Nhập mật khẩu cũ + mới (thiết kế tương tự trang reset) |
| 4 | **Nhập đơn (Saler)** | Form nhập liệu: họ tên, SĐT, email, tour, ngày, trạng thái, ghi chú |
| 5 | **Danh sách đơn (Admin)** | Xem tất cả đơn tour mà các Saler đã chốt |
| 6 | **Hoạt động hệ thống (Admin)** | Log hoạt động: ai làm gì, lúc mấy giờ, địa chỉ IP, vị trí thiết bị |
| 7 | **Quản lý tài khoản (Admin)** | Danh sách Saler, tạo/deactivate tài khoản, đặt lại mật khẩu |

---

## Database

### Yêu cầu thiết kế

Thiết kế schema các bảng đáp ứng:

- Phân quyền **RLS (Row Level Security)** rõ ràng cho Admin và Saler
- Hỗ trợ **authentication**: đăng nhập, đổi mật khẩu, reset mật khẩu
- Đảm bảo **tính triển khai**: khi đổi Supabase account có thể deploy lại nhanh chóng

> Xem chi tiết schema và kiến trúc trong [`PRD.md`](./PRD.md) — mục **5. Order Management** và **18. Định hướng kiến trúc**.
