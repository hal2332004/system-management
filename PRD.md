**Version:** 1.0

**Product:** Website Quản Lý Đơn Tour

**Mục tiêu:** Quản lý đơn tour nội bộ cho Saler và Admin

---

## 1. Tổng quan

**Website Quản Lý Đơn Tour** là hệ thống quản lý bán hàng nội bộ, cho phép Saler quản lý các đơn tour do mình phụ trách và cho phép Admin quản lý toàn bộ đơn hàng, tài khoản Saler và tình hình kinh doanh.

Trong giai đoạn đầu, dữ liệu được nhập thủ công bởi Saler.

Trong các giai đoạn tiếp theo, hệ thống có thể **đồng bộ dữ liệu tự động từ API của các nền tảng bán hàng** về một hệ thống quản lý tập trung để Admin theo dõi.

### Mục tiêu chính

- Tập trung dữ liệu đơn tour vào một hệ thống.
- Saler dễ dàng tạo và quản lý đơn của mình.
- Ngăn Saler truy cập dữ liệu của Saler khác.
- Admin có quyền xem và quản lý toàn bộ dữ liệu.
- Hỗ trợ lọc và theo dõi trạng thái đơn.
- Cung cấp dashboard trực quan cho Admin.
- Có khả năng mở rộng để tích hợp API bên ngoài.

---

# 2. User Roles

Hệ thống có 2 role chính:

| Role | Quyền |
| --- | --- |
| **Saler** | Quản lý đơn của chính mình |
| **Admin** | Quản lý toàn bộ hệ thống |

### Saler

Saler có thể:

- Đăng nhập.
- Tạo đơn tour.
- Xem đơn của mình.
- Cập nhật đơn của mình.
- Thay đổi trạng thái đơn của mình.
- Thêm/cập nhật ghi chú.
- Tìm kiếm và filter đơn của mình.

Saler **không được**:

- Xem đơn của Saler khác.
- Sửa/xóa đơn của Saler khác.
- Xem dữ liệu nội bộ của Saler khác.
- Quản lý tài khoản Saler khác.

### Admin

Admin có toàn quyền:

- Xem tất cả đơn tour.
- Tạo/sửa/xóa đơn.
- Filter và tìm kiếm toàn bộ đơn.
- Xem dữ liệu theo từng Saler.
- Quản lý tài khoản Saler.
- Tạo tài khoản Saler.
- Xóa tài khoản Saler.
- Cập nhật mật khẩu Saler.
- Xem dashboard/thống kê.
- Quản lý dữ liệu toàn hệ thống.

---

# 3. Core User Stories

## 3.1. Saler

> Là một Saler, tôi muốn tạo đơn tour bằng cách nhập thông tin khách hàng và đơn hàng để có thể theo dõi khách hàng của mình.
> 

Thông tin đơn:

- Họ tên khách hàng
- Số điện thoại
- Email
- Ngày đặt
- Ngày tour
- Đơn tour
- Trạng thái
- Ghi chú

---

> Là một Saler, tôi muốn xem danh sách các đơn mình phụ trách để theo dõi tình hình bán hàng.
> 

Danh sách chỉ trả về:

```
orders WHERE saler_id = current_user.id
```

---

> Là một Saler, tôi muốn cập nhật đơn của mình để thông tin luôn chính xác.
> 

Có thể cập nhật:

- Thông tin khách hàng
- Ngày
- Tour
- Trạng thái
- Ghi chú

---

> Là một Saler, tôi không được phép xem đơn của Saler khác.
> 

Đây là **security requirement**, không chỉ là UI requirement.

Backend phải kiểm tra quyền truy cập chứ không chỉ ẩn dữ liệu ở frontend.

---

# 4. Admin User Stories

> Là Admin, tôi muốn xem toàn bộ đơn tour để quản lý hoạt động bán hàng.
> 

Admin có thể xem:

```
Tất cả Saler
        ↓
Tất cả Orders
        ↓
Trạng thái
        ↓
Thông tin khách hàng
```

---

> Là Admin, tôi muốn tạo tài khoản Saler mới.
> 

Admin nhập:

- Username/email
- Tên Saler
- Password
- Role

---

> Là Admin, tôi muốn cập nhật mật khẩu của Saler.
> 

Admin có thể reset/update password khi cần.

---

> Là Admin, tôi muốn xóa tài khoản Saler.
> 

Khi xóa Saler, hệ thống cần có **business rule rõ ràng đối với các đơn của Saler đó**.

Khuyến nghị MVP:

```
Không hard delete Saler
        ↓
deactivate account
        ↓
Giữ nguyên lịch sử đơn
```

Điều này an toàn hơn việc xóa cascade toàn bộ đơn.

---

# 5. Order Management

## Order Entity — MVP

Đề xuất cấu trúc:

```
Order
├── id
├── saler_id
├── customer_name
├── customer_phone
├── customer_email
├── booking_date
├── tour_date
├── tour
├── status
├── note
├── created_at
└── updated_at
```

### Quan trọng

`booking_date` và `tour_date` nên tách riêng.

Ví dụ:

```
Ngày khách đặt: 08/09/2026
Ngày đi tour:   15/09/2026
```

Không nên gộp thành một field `date`.

---

# 6. Order Status

MVP nên giới hạn một số trạng thái cố định thay vì cho nhập text tự do.

Ví dụ:

```
NEW
CONFIRMED
DEPOSITED
COMPLETED
CANCELLED
```

Có thể thay đổi theo nghiệp vụ thực tế.

### Flow

```
NEW
 ↓
CONFIRMED
 ↓
DEPOSITED
 ↓
COMPLETED
```

Có thể:

```
NEW → CANCELLED
CONFIRMED → CANCELLED
DEPOSITED → CANCELLED
```

Việc giới hạn status giúp dashboard và thống kê sau này chính xác hơn.

---

# 7. Filtering & Search

Đây là tính năng **MVP**.

Saler:

```
Filter
├── Status
├── Ngày đặt
├── Ngày tour
└── Search khách hàng / SĐT
```

Admin có thêm:

```
Filter
├── Saler
├── Status
├── Ngày đặt
├── Ngày tour
└── Search khách hàng / SĐT / email
```

Có thể hỗ trợ:

```
Ngày từ ───── Ngày đến
```

thay vì chỉ filter một ngày.

---

# 8. Dashboard — Admin

Dashboard là tính năng Admin.

### KPI

Ví dụ:

```
┌──────────────┐ ┌──────────────┐
│ Tổng đơn     │ │ Đơn mới      │
│     235      │ │      32      │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Đã hoàn thành│ │ Đã hủy       │
│     152      │ │      18      │
└──────────────┘ └──────────────┘
```

### Visualization

Có thể có:

**Orders by Status**

```
NEW          ███████ 32
CONFIRMED    ███████████ 51
DEPOSITED    █████████████ 67
COMPLETED    █████████████████ 152
CANCELLED    ███ 18
```

**Orders by Saler**

```
Saler A     █████████████
Saler B     ████████
Saler C     ███████████████
Saler D     █████
```

**Orders over time**

```
Orders
  │
  │       ╭──╮
  │   ╭───╯  ╰──╮
  │───╯         ╰───
  └────────────────── Date
```

---

# 9. Customer Information Validation

### Future

Hệ thống sẽ validate:

**Số điện thoại**

```
✓ 0901234567
✗ abc123
✗ 123
```

**Email**

```
✓ customer@gmail.com
✗ customer@
✗ abc.com
```

**Họ tên**

Kiểm tra:

- Không để trống.
- Không chứa ký tự bất hợp lệ.
- Giới hạn độ dài.

### Lưu ý

Validation nên thực hiện **cả frontend và backend**.

Frontend:

> UX
> 

Backend:

> Security + data integrity
> 

Không nên chỉ validate bằng frontend.

---

# 10. Authentication & Authorization

MVP cần:

```
Login
  ↓
Authentication
  ↓
Check Role
  ├── Admin
  └── Saler
```

### Authorization

Ví dụ:

```
GET /orders
```

Nếu Saler:

```
WHERE saler_id = current_user.id
```

Nếu Admin:

```
WHERE true
```

Đây là một trong những requirement quan trọng nhất của hệ thống.

**Không được dựa vào frontend để bảo vệ dữ liệu.**

---

# 11. Future — Platform API Integration

Đây là hướng phát triển quan trọng của hệ thống.

Hiện tại:

```
Saler
  │
  │ nhập thủ công
  ▼
Website
  │
  ▼
Database
```

Future:

```
        Platform A API
              │
        Platform B API
              │
        Platform C API
              │
              ▼
       Integration Layer
              │
              ▼
          Database
              │
       ┌──────┴──────┐
       ▼             ▼
    Saler          Admin
                    │
                 Dashboard
```

Các nền tảng có thể được tích hợp trong tương lai.

Hệ thống nên thiết kế database/API từ đầu để **không phụ thuộc hoàn toàn vào việc dữ liệu được tạo thủ công**.

Ví dụ Order nên có khả năng mở rộng:

```
source
source_order_id
```

Ví dụ:

```
source = manual
source_order_id = null
```

hoặc:

```
source = platform_a
source_order_id = "ABC123"
```

Điều này sẽ giúp tránh phải redesign database khi bắt đầu tích hợp API.

---

# 12. MVP Scope

## P0 — Bắt buộc

### Authentication

- Login
- Logout
- Role-based access

### Saler

- Xem đơn của mình
- Tạo đơn
- Edit đơn
- Filter/search
- Xem trạng thái

### Admin

- Xem toàn bộ đơn
- Tạo/edit/delete đơn
- Filter/search
- Filter theo Saler
- Quản lý Saler
- Tạo Saler
- Deactivate Saler
- Reset password

### Security

- Data isolation giữa Saler
- Backend authorization

---

# 13. Phase 2

- Dashboard Admin
- Charts
- Statistics
- Customer validation
- Advanced filtering
- Export Excel/CSV
- Order history/audit log

---

# 14. Phase 3 — External Integration

- Platform API integration
- Automatic order synchronization
- Mapping platform → internal order
- Duplicate detection
- Sync status
- Retry mechanism
- API error monitoring
- Webhook nếu platform hỗ trợ

Ví dụ:

```
External API
     ↓
Fetch/Webhook
     ↓
Normalize
     ↓
Validate
     ↓
Deduplicate
     ↓
Upsert Order
     ↓
Database
```

---

# 15. Non-functional Requirements

### Security

- Password phải được hash.
- JWT/session phải được bảo vệ.
- Backend authorization bắt buộc.
- Saler không thể truy cập ID đơn của Saler khác bằng cách sửa URL/API.
- Admin endpoint phải được bảo vệ.

Ví dụ không được có lỗ hổng:

```
GET /orders/123
```

Saler A không được lấy đơn `123` chỉ vì đoán được ID.

---

### Performance

MVP hướng tới:

- Danh sách đơn phân trang.
- Không load toàn bộ database một lần.
- Filter thực hiện ở backend/database.
- Index các field thường xuyên query.

Ví dụ:

```
orders.saler_id
orders.status
orders.booking_date
orders.tour_date
orders.customer_phone
```

---

# 16. MVP Success Criteria

MVP được coi là đạt khi:

### Saler

- Có thể đăng nhập.
- Tạo được đơn.
- Chỉnh sửa được đơn của mình.
- Filter/search được đơn.
- Không thể xem dữ liệu Saler khác.

### Admin

- Quản lý được Saler.
- Xem được toàn bộ đơn.
- Filter theo Saler/status/date.
- Quản lý trạng thái đơn.
- Dashboard cơ bản hoạt động.

### Security

Test:

```
Saler A
   ↓
request Order của Saler B
   ↓
403 Forbidden
```

Nếu request vẫn trả dữ liệu → **MVP chưa đạt**.

---

# 17. MVP User Flow

```
                 LOGIN
                   │
             ┌─────┴─────┐
             │            │
          SALER         ADMIN
             │            │
             ▼            ▼
       My Orders      Dashboard
             │            │
       ┌─────┼─────┐      ├── Orders
       │     │     │      ├── Salers
      Add   Edit  Filter  └── Statistics
       │
       ▼
    Order DB
```

---

## 18. Định hướng kiến trúc

Mình khuyên **đừng làm MVP theo kiểu "CRUD đơn giản rồi sau này sửa lại"**.

Ngay từ đầu nên có 4 lớp logic rõ:

```
Frontend
   ↓
API / Backend
   ↓
Business Logic
   ↓
Database
```

và model dữ liệu nên chuẩn bị cho:

```
Manual Order
      +
Platform Order
      +
Future API Integration
      ↓
Unified Order
```

### Một quyết định kiến trúc đặc biệt quan trọng

Không nên thiết kế:

```
Order → Saler
```

theo nghĩa Saler là nguồn dữ liệu duy nhất.

Nên nghĩ theo:

```
Order
├── owner_saler_id
├── source
├── source_order_id
├── customer
├── tour
├── status
└── timestamps
```