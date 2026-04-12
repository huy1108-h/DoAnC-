import os

# Nội dung tài liệu Markdown dựa trên đồ án FoodMap
markdown_content = """# 🏆 FoodMap - Vinh Khanh Street Food Discovery App

Hệ thống hỗ trợ khám phá văn hóa ẩm thực đường phố tại khu vực Quận 4 (Vĩnh Khánh), tích hợp công nghệ thuyết minh tự động và định vị GPS thông minh.

## 🚀 Tính năng nổi bật (Key Features)

Ứng dụng được thiết kế theo tư duy **Offline-First** với các cơ chế dự phòng (Fallback) đa tầng để đảm bảo trải nghiệm người dùng không bị gián đoạn.

### 1. Nạp dữ liệu 3-Tier Fallback
Hệ thống quản lý dữ liệu linh hoạt qua 3 cấp độ:
* **Tier 1 (Online):** Truy xuất dữ liệu thời gian thực từ C# .NET API kết nối Supabase.
* **Tier 2 (Cache):** Sử dụng LocalStorage để lưu trữ phiên làm việc gần nhất.
* **Tier 3 (Offline Storage):** Tích hợp SQLite WASM đọc trực tiếp tệp cấu trúc `.db` nhúng trong mã nguồn khi hoàn toàn mất kết nối.

### 2. Định vị GPS & Geofencing Engine
* Sử dụng `navigator.geolocation.watchPosition` để theo dõi tọa độ người dùng theo thời gian thực.
* Tích hợp thuật toán toán học tính khoảng cách tọa độ để kích hoạt điểm thuyết minh (POI) trong bán kính cài đặt.
* Cơ chế **Auto Check-in**: Tự động ghi nhận lịch sử ghé thăm vào cơ sở dữ liệu khi người dùng đi vào vùng kích hoạt.

### 3. Engine Thuyết minh Đa tầng (3-Tier TTS)
Cung cấp giọng đọc thuyết minh tự động hỗ trợ đa ngôn ngữ (Việt, Anh, Trung):
* **Native Bridge:** Gọi trực tiếp gói ngôn ngữ của hệ điều hành Android.
* **Web Speech API:** Sử dụng trình duyệt nội bộ làm phương án dự phòng.
* **Cloud TTS:** Gọi API Google Translate TTS khi thiết bị không hỗ trợ giọng đọc bản địa.

### 4. Quản lý Yêu thích & Lịch sử
* Lưu trữ danh sách quán ăn yêu thích đồng bộ với tài khoản người dùng qua bảng `favorites`.
* Truy xuất và hiển thị lịch sử hành trình từ bảng `histories` trên Supabase Cloud.

## 🛠 Công nghệ sử dụng (Tech Stack)

### Frontend
* **Framework:** React.js (Hooks & Context API).
* **Bản đồ:** Leaflet.js & React-Leaflet.
* **Dữ liệu bản đồ:** CartoDB Voyager.
* **Offline Engine:** SQL.js (SQLite WASM).

### Backend & Database
* **Server:** C# .NET Web API.
* **ORM:** Entity Framework Core.
* **Database Cloud:** Supabase (PostgreSQL).
* **Tunneling:** Ngrok (Internet Gateway).

## 🏗 Kiến trúc hệ thống (System Architecture)

Hệ thống hoạt động dựa trên luồng End-to-End chặt chẽ:
1.  **Client (Mobile App)** thực hiện gửi yêu cầu.
2.  **C# API** đóng vai trò trung gian xử lý nghiệp vụ.
3.  **Supabase** lưu trữ trạng thái bền vững (Favorites, Histories, Places).
4.  **Local Storage** đảm nhận vai trò bộ nhớ đệm và lưu trữ ngoại tuyến.

## 📥 Cài đặt & Khởi chạy (Setup Guide)

### Yêu cầu hệ thống
* Node.js & npm.
* Visual Studio (cho Backend).
* Supabase Account.

### Khởi chạy Backend
1. Mở Solution `FoodMapAPI.sln`.
2. Cập nhật Connection String của Supabase trong `appsettings.json`.
3. Chạy ứng dụng tại cổng `5111`.
4. Mở Ngrok để Forward cổng: `ngrok http 5111`.

### Khởi chạy Frontend
1. Cài đặt dependencies: `npm install`.
2. Cập nhật `API_BASE` trong `App.js` bằng link Ngrok mới.
3. Chạy App: `npm start`.

## 📜 Giấy phép & Tác giả
* **Tác giả:** Vũ Châu Uy (chauuyvu0809@gmail.com).
* **Đồ án:** Phát triển ứng dụng thuyết minh ẩm thực đường phố.
"""

# Lưu file vào thư mục làm việc
file_path = "/mnt/data/FoodMap_Project_Documentation.md"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print(file_path)
