# Product Requirements Document (PRD) — TourFlow CRM

**Tên sản phẩm:** TourFlow CRM — Hệ Thống Quản Lý & Điều Hành Đơn Tour Du Lịch Nội Bộ  
**Phiên bản:** 2.5  
**Trạng thái:** Đã hoàn thiện tính năng cốt lõi (Production-ready & Synchronized)  
**Ngày cập nhật:** 26/09/2026  

---

## 1. Bối cảnh & Tầm nhìn Sản phẩm

### 1.1 Vấn đề nghiệp vụ
Trong các doanh nghiệp kinh doanh tour du lịch, việc quản lý yêu cầu đặt tour (booking requests) thường gặp các thách thức:
- Đơn tour bị phân tán trên nhiều kênh chat (Zalo, Messenger, WhatsApp), bảng tính Excel, dễ dẫn đến thất lạc khách hàng.
- Nguy cơ lộ dữ liệu khách hàng giữa các nhân viên Sale nếu không có cơ chế phân quyền bảo mật cấp database.
- Ban Quản trị khó nắm bắt tức thì tỷ lệ chốt đơn, tiến độ xử lý và doanh số tour theo thời gian thực.
- Khó khăn trong việc tra cứu theo cả hai mốc: ngày khách đặt tour (để đối soát hoa hồng sale) và ngày khách khởi hành (để điều hành dịch vụ, đặt phòng và hướng dẫn viên).
- Thiếu thống kê về nguồn khách tiếp thị và thị trường quốc gia của du khách.

### 1.2 Giải pháp — TourFlow CRM
TourFlow CRM là nền tảng quản trị nội bộ chuyên biệt, mang lại giải pháp toàn diện:
- Tập trung hóa dữ liệu đơn tour và sản phẩm vào một nền tảng duy nhất với giao diện Dark/Light hiện đại.
- Cơ chế bảo mật cách ly cấp cơ sở dữ liệu (**PostgreSQL Row-Level Security**): Nhân viên Sale chỉ quản lý đơn của chính mình; Quản trị viên nắm toàn quyền hệ thống.
- Tra cứu đa chiều với bộ lọc thông minh: ngày đặt, tháng khởi hành (logic OR cho khách chọn nhiều tháng), trạng thái đơn, quốc gia, nguồn marketing và nhân viên sale.
- Trực quan hóa chỉ số với Recharts: Biểu đồ hiệu suất nhân viên, nhu cầu theo tháng khởi hành, phân bổ quốc gia và kênh tiếp thị.

---

## 2. Đối tượng Người dùng & Ma trận Phân quyền

Hệ thống quản trị truy cập theo vai trò (Role-Based Access Control - RBAC) chặt chẽ giữa hai vai trò: **`admin` (Quản trị viên)** và **`saler` (Nhân viên Sale)**.

| Chức năng / Quyền hạn | Nhân viên Sale (`saler`) | Quản trị viên (`admin`) | Trạng thái triển khai |
| :--- | :---: | :---: | :---: |
| Đăng nhập hệ thống (Username/Email + Password) | ✅ | ✅ | **Implemented** |
| Đổi mật khẩu cá nhân (xác thực mật khẩu cũ) | ✅ | ✅ | **Implemented** |
| Quên mật khẩu / Đặt lại qua email | ✅ | ✅ | **Implemented** |
| Xem hồ sơ cá nhân & Upload avatar | ✅ | ✅ | **Implemented** |
| Bật / Tắt âm thanh thông báo chuông Chime | ✅ | ✅ | **Implemented** |
| Tạo đơn tour mới (`/orders/new`) | ✅ | ✅ *(qua URL)* | **Implemented** |
| Xem danh sách đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Toàn bộ đơn hệ thống)* | **Implemented** |
| Xem chi tiết đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Mọi đơn tour)* | **Implemented** |
| Chỉnh sửa đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Mọi đơn tour)* | **Implemented** |
| Xóa đơn tour | ✅ *(Chỉ đơn của mình)* | ✅ *(Mọi đơn tour)* | **Implemented** |
| Xuất danh sách ra file Excel (.xlsx) & CSV | ✅ *(Đơn của mình)* | ✅ *(Toàn bộ đơn)* | **Implemented** |
| Tìm kiếm đa trường & Lọc ngày kép | ✅ | ✅ | **Implemented** |
| Lọc theo Nhân viên Sale | ❌ | ✅ | **Implemented** |
| Bảng điều khiển tổng quan (Dashboard Recharts) | ❌ | ✅ | **Implemented** |
| Quản trị danh mục Tours & Dạng phòng | ❌ | ✅ | **Implemented** |
| Quản trị tài khoản đội ngũ Sale | ❌ | ✅ | **Implemented** |
| Theo dõi nhật ký hoạt động hệ thống (Activity Logs) | ❌ | ✅ | **Implemented** |
| Tự động gửi email/SMS thông báo cho khách | ❌ | ❌ | **Planned / Not implemented** |
| Quản lý hoa hồng và thu chi lợi nhuận tour | ❌ | ❌ | **Planned / Not implemented** |
| Tích hợp cổng thanh toán trực tuyến | ❌ | ❌ | **Planned / Not implemented** |

---

## 3. User Stories & Tiêu chí Nghiệp vụ

### 3.1 Nhóm Nhân viên Sale (Saler)

#### US-S01: Tạo đơn tour mới
- **Mô tả:** Là một Saler, tôi muốn tạo đơn tour mới bằng cách nhập đầy đủ thông tin khách hàng, sản phẩm đã gửi (tour), loại tour (grupal hoặc privado) và dịch vụ lưu trú kèm tháng khởi hành mong muốn.
- **Tiêu chí chấp nhận (AC):**
  - **Trường bắt buộc:** Họ và tên khách, Số điện thoại, Sản phẩm đã gửi (chọn từ danh mục `tours`), Loại tour (`tour_type`: `grupal` hoặc `privado`), Số lượng khách (`num_guests` > 0), Hạng sao khách sạn (`rating` 1-5 sao), Ngày đặt (`booking_date`), Tháng khởi hành (`tour_date` dạng `text`, định dạng `MM/YYYY`, hỗ trợ chọn một hoặc nhiều tháng trong năm), Trạng thái đơn (`status`).
  - **Trường tùy chọn:** Email khách hàng, Dạng phòng (`room_type`), Quốc tịch khách hàng (`customer_country` - lưu mã ISO 2 ký tự, hiển thị cờ và tên quốc gia, phân biệt hoàn toàn với điểm đến), Điểm đến khách quan tâm (`destinations` - multi-select các điểm đến: Vietnam, Tailandia, Camboya, Bali, China, Japon, Corea, Laos, Singapore, Malaisia), Nguồn request (`request_source`), Ghi chú tour (`notes`).
  - **Quy tắc Quốc tịch & Destino:**
    - `Quốc tịch` (`customer_country`): Đại diện cho quốc tịch của du khách (ví dụ: 🇦🇷 Argentina, 🇪🇸 Spain, 🇻🇳 Vietnam).
    - `Destino` (`destinations`): Đại diện cho các điểm đến du khách mong muốn ghé thăm trong hành trình. Cho phép chọn nhiều điểm đến từ danh mục 10 điểm đến chuẩn hóa, hiển thị dạng tag/badge có nút xóa nhanh `×`.
  - **Quy tắc Loại tour (Tour grupal / Tour privado):**
    - Mặc định là `Tour grupal` (tour ghép đoàn tiêu chuẩn). Khi chọn `Tour grupal`, các trường tour riêng và upload PDF tự động ẩn.
    - Khi chọn `Tour privado` (tour riêng), hiển thị thêm 2 trường: **Tên tour riêng** (`private_tour_name`) và **Chương trình tour (PDF)** (`private_tour_pdf_path`). File upload được validate chặt chẽ (định dạng PDF, dung lượng tối đa 20MB) và lưu trữ trên Supabase Storage bucket riêng tư (`private-tour-programs`).
  - **Quy tắc đa tháng:** Khách hàng có thể mong muốn đi tour vào 1 hoặc vài tháng trong năm (ví dụ: `02/2027`, `03/2027`, `05/2027`). Tích hợp component `MonthMultiSelector` để chọn tiện lợi.
  - Hệ thống tự sinh mã đơn duy nhất định dạng `ORD-XXXXXX`.
  - Tự động gán `owner_id` là user đang đăng nhập.

#### US-S02: Xem & Tra cứu đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi muốn xem danh sách các đơn do mình tạo để theo dõi tiến độ chăm sóc khách hàng.
- **Tiêu chí chấp nhận (AC):**
  - Chỉ trả về danh sách đơn có `owner_id = auth.uid()` (bảo vệ kép bằng RLS).
  - Tìm kiếm đồng thời: Tên khách hàng, Số điện thoại, Email, Sản phẩm đã gửi (Tên tour) và Tên tour riêng (`private_tour_name`).
  - Bảng danh sách hiển thị cột **LOẠI TOUR** với compact badge trực quan: `[Users Grupal]` (xanh dương) hoặc `[UserRound Privado]` (tím). Không dùng icon máy bay và không dùng emoji trực tiếp.
  - Lọc theo trạng thái: Tất cả, Mới (`new`), Đang tư vấn (`consulting`), Đã chốt (`closed`), Đã hủy (`cancelled`).
  - Lọc thời gian linh hoạt theo Ngày đặt hoặc Tháng đi tour (hỗ trợ toán tử logic OR: nếu đơn có nhiều tháng, chỉ cần chứa tháng được lọc là sẽ xuất hiện).
  - Giao diện tự động thích ứng: Bảng có cuộn ngang trên Desktop (hiển thị tháng gọn `02/2027 +2` kèm tooltip); Danh sách Thẻ di động (Cards) trên Mobile với nút bấm gọi điện trực tiếp `tel:` và badge loại tour.

#### US-S03: Chỉnh sửa đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi muốn cập nhật thông tin đơn hàng khi khách đổi lịch trình, đổi dạng phòng, đổi loại tour hoặc thay đổi file PDF chương trình.
- **Tiêu chí chấp nhận (AC):**
  - Saler chỉ sửa được đơn của mình.
  - **Bảo toàn quyền sở hữu:** Giữ nguyên `owner_id` ban đầu của đơn, không ghi đè bằng ID của người thực hiện sửa.
  - **Quản lý vòng đời PDF:** Hiển thị file PDF hiện tại kèm các thao tác `[Xem]` (qua Signed URL), `[Thay file]`, `[Xóa]`. Nếu chuyển từ `Privado` sang `Grupal`, hệ thống dọn dẹp file PDF cũ an toàn.

#### US-S05: Quản trị Định danh Khách hàng (Customer ID) & Nhận diện Khách quay lại (Return Visits)
- **Mô tả:** Là một Saler, tôi muốn hệ thống tự động nhận diện khách hàng cũ và quản lý các đợt quay lại (Return Visits) mà không cần phải ghi nhớ hay nhập thủ công mã khách hàng.
- **Tiêu chí chấp nhận (AC):**
  - **Mô hình thực thể độc lập:**
    - `Customer` (Khách hàng) → `Customer Return Visit` (Đợt tương tác/quay lại) → `Order` (Đơn tour).
    - Một đợt quay lại có thể chứa nhiều đơn tour khác nhau (ví dụ: khách đặt cùng lúc 3 tour trong 1 đợt liên hệ). Hệ thống **tuyệt đối không đánh đồng 1 đơn tour = 1 lần quay lại**.
    - Mã khách hàng (`customer_code`, định dạng `CUS-XXXXXX`) được sinh ngẫu nhiên tự động và duy nhất, tách biệt với mã đơn hàng (`ORD-XXXXXX`).
  - **Luồng Khách hàng Mới:**
    - Saler chọn tab "Khách hàng mới". Giữ nguyên trải nghiệm tạo đơn quen thuộc.
    - Hệ thống tự động khởi tạo bản ghi `customers` mới, tự sinh Customer ID và tạo `customer_return_visits` Lần #1 liên kết với đơn tour.
    - **Cảnh báo trùng lặp thông minh (Requirement 26):** Nếu Saler nhập SĐT hoặc Email trùng khớp với khách hàng đã có trong hệ thống, giao diện hiển thị banner thông báo đề xuất và cho phép Saler chuyển sang khách hàng cũ này chỉ với 1 click, hoặc tiếp tục tạo mới. Quyết định luôn minh bạch và thuộc về Saler.
  - **Luồng Khách hàng Cũ & Tra cứu Server-side:**
    - Saler chọn tab "Khách hàng cũ".
    - Tìm kiếm server-side qua RPC `search_customers` theo: Họ tên, Số điện thoại, Email (hỗ trợ tìm kiếm không phân biệt hoa thường, cắt khoảng trắng thừa, hoạt động mượt mà khi khách không có SĐT hoặc không có Email).
    - Kết quả tìm kiếm hiển thị đầy đủ: Họ tên, Mã khách hàng (`CUS-XXXXXX`), SĐT, Email, Quốc tịch, Tổng số đơn tour và Tổng số đợt quay lại để Saler dễ dàng phân biệt khách trùng tên.
  - **Nhận diện Trùng lịch trình (Overlap Detection) & Xác nhận đợt quay lại:**
    - Khi chọn khách cũ, hệ thống tự động đối chiếu tháng khởi hành mong muốn (`tour_date`) của đơn mới với lịch sử các đơn trước của khách hàng.
    - **Có trùng tháng khởi hành:** Hiển thị banner cảnh báo trùng lịch tour kèm danh sách đơn bị trùng, cung cấp 2 lựa chọn rõ ràng:
      1. *Cùng đợt quay lại này:* Gán đơn vào đợt quay lại đang trùng, giữ nguyên số thứ tự đợt (không tăng số lần quay lại của khách).
      2. *Tạo đợt quay lại mới:* Ghi nhận chuyến đi mới, tăng số lần quay lại lên `Lần #{N + 1}`.
    - **Không trùng tháng:** Cung cấp tùy chọn tạo đợt quay lại mới (`Lần #{N + 1}`) hoặc gộp chung với đợt gần nhất.
  - **Bảo toàn lịch sử khi hủy đơn (Requirement 18):**
    - Hủy đơn tour (`status = 'cancelled'`) chỉ thay đổi trạng thái đơn, không xóa hay giảm số lần quay lại trong lịch sử khách hàng.
  - **Xem Lịch sử Khách hàng (Customer History):**
    - Modal tra cứu trực quan nhóm các đơn tour theo từng đợt quay lại (Lần #1, Lần #2...), thể hiện rõ tên tour, tháng khởi hành, trạng thái đơn và nhân viên phụ trách.
    - Hỗ trợ mở modal từ form tạo đơn, chi tiết đơn tour (`/orders/:id`) và trực tiếp từ bảng danh sách đơn (`/orders`).

#### US-S04: Xóa đơn tour cá nhân
- **Mô tả:** Là một Saler, tôi có quyền xóa đơn tour của chính mình khi đơn bị hủy hoặc nhập trùng.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị nút xóa thùng rác kèm hộp thoại xác nhận `Bạn có chắc chắn muốn xóa đơn tour [mã_đơn]?`.
  - Database RLS kiểm tra `auth.uid() = owner_id` và `is_my_account_active() = true`.
  - Tự động xóa file PDF liên kết trong bucket `private-tour-programs` để ngăn chặn file mồ côi (orphan files).

#### US-S05: Xuất báo cáo dữ liệu
- **Mô tả:** Là một Saler, tôi muốn xuất danh sách đơn ra file Excel/CSV để báo cáo định kỳ.
- **Tiêu chí chấp nhận (AC):**
  - Xuất đầy đủ 17 cột thông tin ra file `.xlsx` hoặc `.csv` (bao gồm `Loại tour` và `Tên tour riêng`).

---

### 3.2 Nhóm Quản trị viên (Admin)

#### US-A01: Bảng điều khiển Giám sát (Executive Dashboard)
- **Mô tả:** Là Admin, tôi muốn xem các chỉ số KPI và biểu đồ trực quan để đánh giá tốc độ bán hàng và thị trường mục tiêu.
- **Tiêu chí chấp nhận (AC):**
  - 4 thẻ KPI: Tổng đơn tour, Đơn đang xử lý, Đã chốt thành công, Tỷ lệ chốt đơn trung bình.
  - Biểu đồ cột Recharts Bar Chart đo lường hiệu suất từng Saler theo 4 trạng thái (`new`, `consulting`, `closed`, `cancelled`) kèm bộ lọc thời gian và nhân viên.
  - Biểu đồ phân bổ thị trường Quốc gia (Top 5, Top 10, Tất cả).
  - Biểu đồ tròn Recharts PieChart phân bổ nguồn tiếp thị (Facebook, Instagram, WhatsApp, Email, Khách cũ, Khác).
  - Tự động đồng bộ số liệu qua Realtime WebSocket.

#### US-A02: Quản trị toàn bộ đơn tour hệ thống
- **Mô tả:** Là Admin, tôi muốn xem, lọc, can thiệp và xuất báo cáo mọi đơn tour trong doanh nghiệp.
- **Tiêu chí chấp nhận (AC):**
  - Xem toàn bộ đơn tour của tất cả nhân viên.
  - Cột nhân viên hiển thị avatar và họ tên Saler phụ trách.
  - Bộ lọc có thêm ô chọn/tìm kiếm theo từng nhân viên Sale.
  - Toàn quyền chỉnh sửa hoặc xóa bất kỳ đơn tour nào.

#### US-A03: Quản trị danh mục Hệ thống (`/admin/settings`)
- **Mô tả:** Là Admin, tôi muốn quản trị danh mục các gói tour du lịch và các dạng phòng để nhân viên chọn khi tạo đơn.
- **Tiêu chí chấp nhận (AC):**
  - Quản lý bảng `tours`: Thêm tour mới, sửa tên tour inline, bật/tắt mở bán (`is_active`), xóa tour.
  - Quản lý bảng `room_types`: Thêm dạng phòng, sửa tên, bật/tắt áp dụng, xóa dạng phòng.

#### US-A04: Quản trị đội ngũ Nhân viên Sale (`/admin/salers`)
- **Mô tả:** Là Admin, tôi muốn tạo tài khoản cho nhân viên mới và kiểm soát quyền truy cập của đội ngũ.
- **Tiêu chí chấp nhận (AC):**
  - Tạo nhân viên mới: Nhập Họ tên (tự sinh username chuẩn không dấu), Email, Mật khẩu. Tạo user tự động qua Supabase Admin API.
  - Khóa / Mở khóa tài khoản (`is_active`): Khi bị khóa, tài khoản lập tức bị đăng xuất và bị chặn đọc ghi DB.
  - Đặt lại mật khẩu trực tiếp cho nhân viên.
  - Xóa tài khoản nhân viên khỏi hệ thống.

#### US-A05: Theo dõi Hoạt động Hệ thống (Activity Logs)
- **Mô tả:** Là Admin, tôi muốn xem nhật ký hành động để kiểm soát an toàn thông tin nội bộ.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị luồng sự kiện theo thời gian thực (LIVE indicator).
  - Ghi nhận: Tạo đơn (`create_order`), Cập nhật đơn (`update_order`), Cập nhật trạng thái (`update_status`), Xóa đơn (`delete_order`).
  - Tìm kiếm nhật ký theo tên nhân viên (hỗ trợ tiếng Việt không dấu).
  - Bấm vào hoạt động chứa mã đơn `ORD-XXXXXX` để mở nhanh chi tiết đơn.

---

## 4. Yêu cầu Chi tiết về Bộ lọc Thời gian (Advanced Date Filters)

Hệ thống giải quyết triệt để bài toán đối soát tour du lịch bằng cơ chế lọc kép:

### 4.1 Loại ngày lọc (Date Type Selector)
Người dùng chuyển đổi linh hoạt giữa:
- **Ngày tạo đơn (Booking Date):** Lọc theo thời điểm khách hàng gửi yêu cầu / chốt đơn.
- **Ngày đi tour (Tour Date):** Lọc theo ngày khách hàng thực tế khởi hành tour du lịch.

### 4.2 Các mốc thời gian (Presets & Specific Day)
1. **Hôm nay (Today):** Từ `00:00:00` đến `23:59:59` của ngày hiện tại.
2. **Hôm qua (Yesterday):** Toàn bộ ngày hôm trước.
3. **7 ngày qua (7 Days):** Trong vòng 7 ngày gần nhất đến hết ngày hôm nay.
4. **30 ngày qua (30 Days):** Trong vòng 30 ngày gần nhất đến hết ngày hôm nay.
5. **Tháng này (This Month):** Từ ngày 01 đến ngày cuối cùng của tháng hiện tại.
6. **Tháng trước (Last Month):** Toàn bộ các ngày trong tháng trước.
7. **Ngày cụ thể (Specific Day Picker):** Chọn chính xác 1 ngày bất kỳ qua lịch.

---

## 5. Dữ Liệu & Trạng Thái Thực Tế

### 5.1 Bảng `profiles`
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, REFERENCES `auth.users(id)` | ID người dùng |
| `username` | `text` | UNIQUE | Tên đăng nhập nội bộ |
| `display_name` | `text` | NULLABLE | Tên hiển thị của nhân viên |
| `email` | `text` | UNIQUE, NOT NULL | Email liên hệ / đăng nhập |
| `role` | `app_role` | NOT NULL, DEFAULT `'saler'` | Vai trò (`admin` hoặc `saler`) |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Trạng thái tài khoản |
| `avatar_url` | `text` | NULLABLE | URL ảnh đại diện trên Supabase Storage |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm tạo |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm cập nhật |

### 5.2 Bảng `customers` (Định danh Khách hàng Toàn diện)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID định danh khách hàng nội bộ |
| `customer_code` | `text` | UNIQUE, NOT NULL | Mã khách hàng tự động sinh (vd: `CUS-9A787A`) |
| `full_name` | `text` | NOT NULL | Họ và tên khách hàng |
| `phone` | `text` | NULLABLE | Số điện thoại liên hệ |
| `email` | `text` | NULLABLE | Email khách hàng |
| `country` | `varchar(2)` | NULLABLE | Quốc tịch khách hàng (Mã ISO 2 ký tự) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm tạo hồ sơ khách |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm cập nhật hồ sơ khách |

### 5.3 Bảng `customer_return_visits` (Đợt tương tác / Lần quay lại)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID đợt quay lại |
| `customer_id` | `uuid` | FK REFERENCES `customers(id)` ON DELETE CASCADE | Khách hàng tương ứng |
| `visit_number`| `integer` | NOT NULL, CHECK `> 0`, UNIQUE `(customer_id, visit_number)` | Thứ tự đợt quay lại (Lần #1, #2...) |
| `notes` | `text` | NULLABLE | Ghi chú đợt trao đổi |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm khởi tạo đợt |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm cập nhật đợt |

### 5.4 Bảng `orders`
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID định danh đơn tour |
| `order_code` | `text` | UNIQUE, NOT NULL | Mã đơn (vd: `ORD-A27B79`) |
| `owner_id` | `uuid` | FK REFERENCES `profiles(id)` | Nhân viên phụ trách đơn |
| `customer_id` | `uuid` | NULLABLE, FK REFERENCES `customers(id)` ON DELETE SET NULL | Liên kết hồ sơ khách hàng |
| `return_visit_id` | `uuid` | NULLABLE, FK REFERENCES `customer_return_visits(id)` ON DELETE SET NULL | Liên kết đợt quay lại cụ thể |
| `customer_name` | `text` | NOT NULL | Họ và tên khách hàng |
| `customer_phone` | `text` | NOT NULL | Số điện thoại liên hệ |
| `customer_email` | `text` | NULLABLE | Email khách hàng |
| `tour_name` | `text` | NOT NULL | Tên chương trình tour đã gửi |
| `tour_type` | `text` | NOT NULL, DEFAULT `'grupal'`, CHECK `('grupal', 'privado')` | Loại tour: Tour grupal hoặc Tour privado |
| `private_tour_name` | `text` | NULLABLE | Tên tour riêng tùy chỉnh (chỉ dùng khi `tour_type = 'privado'`) |
| `private_tour_pdf_path` | `text` | NULLABLE | Đường dẫn file PDF chương trình tour trong Storage bucket |
| `booking_date` | `date` | NOT NULL | Ngày tạo đơn |
| `tour_date` | `text` | NOT NULL | Tháng khởi hành tour (hỗ trợ nhiều tháng `MM/YYYY`) |
| `status` | `order_status` | NOT NULL, DEFAULT `'new'` | Trạng thái xử lý |
| `room_type` | `text` | NULLABLE | Dạng phòng lưu trú |
| `num_guests` | `integer` | DEFAULT `1`, CHECK `> 0` | Số lượng du khách |
| `rating` | `integer` | DEFAULT `5`, CHECK `1..5` | Hạng sao khách sạn (1-5 sao) |
| `customer_country`| `varchar(2)` | NULLABLE | Quốc tịch khách hàng (Mã quốc gia ISO 2 ký tự, hiển thị cờ + tên) |
| `destinations`    | `text[]`     | DEFAULT `'{}'::text[]` | Danh sách điểm đến khách quan tâm (Destino: Vietnam, Tailandia, Camboya...) |
| `request_source` | `varchar(50)` | NULLABLE | Kênh tiếp thị nguồn khách |
| `request_source_other`| `text` | NULLABLE | Chi tiết nguồn nếu chọn nguồn khác |
| `notes` | `text` | NULLABLE | Ghi chú yêu cầu đặc biệt |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm tạo đơn |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Thời điểm cập nhật đơn |

**Enum `order_status` (4 trạng thái chuẩn):**
- `'new'`: Mới tiếp nhận
- `'consulting'`: Đang tư vấn
- `'closed'`: Đã chốt thành công
- `'cancelled'`: Đã hủy đơn

### 5.3 Bảng `tours` & `room_types`
- `public.tours`: `id` (uuid, PK), `name` (text, UNIQUE), `is_active` (boolean, default true), `created_at`, `updated_at`.
- `public.room_types`: `id` (uuid, PK), `name` (text, UNIQUE), `is_active` (boolean, default true), `created_at`, `updated_at`.

### 5.4 Bảng `activity_logs`
- `id` (uuid, PK), `actor_id` (uuid, FK), `target_user_id` (uuid, FK), `action_type` (text), `description` (text), `ip_address` (text), `created_at` (timestamptz).

### 5.5 Supabase Storage Buckets
1. **`avatars` (Public):**
   - Giới hạn: 5MB, MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.
   - Mục đích: Lưu ảnh đại diện nhân viên đã nén qua HTML5 Canvas.
2. **`private-tour-programs` (Private, `public = false`):**
   - Giới hạn: 20MB, MIME: `application/pdf`.
   - Quy ước đường dẫn: `{order_id}/{timestamp}-{clean_filename}.pdf`.
   - Bảo mật & Phân quyền RLS:
     - Truy cập qua **Signed URL** bảo mật có thời hạn (1 giờ), không lưu hoặc public URL cố định.
     - Saler chỉ có quyền xem/sửa/xóa file thuộc các đơn tour do chính mình quản lý (`owner_id = auth.uid()`).
     - Admin nắm toàn quyền đọc và quản lý file của mọi đơn tour.
     - File PDF tự động được dọn dẹp khi đổi sang Grupal hoặc khi xóa đơn tour để chống orphan files.

---

## 6. Yêu cầu Phi chức năng (Non-Functional Requirements)

1. **Hiệu năng & Tốc độ:**
   - Phản hồi lọc và tìm kiếm client-side < 100ms thông qua `useMemo`.
   - Nén ảnh avatar bằng HTML5 Canvas trên client giảm 90% dung lượng trước khi upload, tiết kiệm băng thông và tăng tốc tải avatar.
2. **Khả năng tương thích:**
   - Tương thích tốt trên Chrome, Safari, Edge, Firefox.
   - Trải nghiệm cảm ứng mượt mà trên smartphone, tự động hiển thị thẻ đơn tour và drawer menu.
3. **Độ tin cậy giao diện:**
   - Giao diện Sáng (Light) và Tối (Dark) tuân thủ tiêu chuẩn tương phản WCAG AA.
   - Thông báo và xử lý lỗi hoàn toàn bằng tiếng Việt chuẩn mực.

---

## 7. Roadmap & Kế Hoạch Phát Triển (Feature Roadmap)

| Tính năng dự kiến | Trạng thái | Ghi chú kỹ thuật |
| :--- | :---: | :--- |
| Core CRM, Order CRUD, Date Filters, RLS | **Đã hoàn thành** | Production-ready |
| Dashboard Recharts, Hiệu suất Saler, Thống kê Quốc gia & Kênh Marketing | **Đã hoàn thành** | Production-ready |
| Quản lý Tours & Loại phòng, StarRating, Xuất Excel/CSV | **Đã hoàn thành** | Production-ready |
| Realtime WebSocket & Chuông âm thanh Web Audio Chime | **Đã hoàn thành** | Production-ready |
| Chuyển tác vụ Admin User sang Supabase Edge Functions | **Planned / Not implemented** | Tăng cường bảo mật service role key |
| Server-Side Pagination cho quy mô > 50,000 đơn | **Planned / Not implemented** | Dùng Supabase `.range(from, to)` |
| Tự động gửi Email / Zalo xác nhận đặt tour cho khách | **Planned / Not implemented** | Tích hợp SendGrid / Zalo ZNS API |
| Báo cáo Doanh thu, Chi phí & Hoa hồng Sale | **Planned / Not implemented** | Bổ sung module tài chính |