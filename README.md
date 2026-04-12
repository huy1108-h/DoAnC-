# DoAnC - Web Backend

Hệ thống quản lý **điểm du lịch, quán ăn và tour** kết hợp công nghệ AR (Narration Point) cho ứng dụng di động và web admin.

---

# Tính năng chính

- Quản lý điểm narration (POI)
- Seller có thể claim quán mồi hoặc tạo quán mới
- Admin duyệt yêu cầu từ seller
- Quản lý tour du lịch
- Bản dịch đa ngôn ngữ
- Lịch sử scan & heatmap người dùng
- Xác thực JWT (Admin & Seller)

---

# Công nghệ sử dụng

| Công nghệ              | Mục đích                     |
|------------------------|------------------------------|
| ASP.NET Core           | Backend API                  |
| Entity Framework Core  | Kết nối database             |
| Supabase (PostgreSQL)  | Database & Storage ảnh       |
| JWT                    | Đăng nhập                    |
| BCrypt                 | Bảo mật mật khẩu             |

---

# Cấu trúc thư mục
```bash
DoAnC--web/
├── backend/                  ← Toàn bộ mã nguồn backend
│   ├── Controllers/          ← Các API (Auth, Stall, Tour, FoodPlace...)
│   ├── Models/               ← Bảng database
│   ├── AppDbContext.cs       ← Kết nối EF Core
│   ├── Program.cs            ← Cấu hình ứng dụng
│   └── wwwroot/
│       └── images/           ← Ảnh lưu trên server
├── frontend/                 ← Toàn bộ mã nguồn frontend
│   ├── src/
│   ├── admin/                ← Thư mục chứa các trang admin quản lý
│   ├── seller/               ← Thư mục chứa các trang seller quản lý
│   └── css/                  ← Thư mục chứa file css
└── README.md
```
# Các vai trò người dùng

| Vai trò   | Quyền hạn chính |
|-----------|-----------------|
| **Admin**     | Quản lý toàn bộ hệ thống, duyệt quán, quản lý tour |
| **Seller**    | Claim quán, tạo quán, yêu cầu cập nhật, tạo audio |
| **User**      | (Ứng dụng di động) scan điểm, nghe narration |

---

# Hướng dẫn chạy project

# Bước 1: Chạy Backend
cd backend
dotnet run
→ API chạy tại: http://localhost:5050
# Bước 2: Chạy Frontend (React)
cd frontend 
npm run dev
→ Mở trình duyệt: http://localhost:5173

# Tài khoản mặc định (Admin)
Username: admin
Password: 123456

# Một số API quan trọng
```bash
POST /api/auth/login → Đăng nhập
GET /api/stalls/unclaimed → Lấy danh sách quán mồi
POST /api/stalls/claim/{id} → Seller claim quán
PUT /api/requests/{id}/approve → Admin duyệt yêu cầu
```

# Lưu ý

- Ảnh sẽ được lưu 2 nơi: thư mục wwwroot/images (web admin) và Supabase Storage (cho app di động).
- File cấu hình quan trọng: backend/appsettings.json
- Project đang dùng Supabase làm database.
