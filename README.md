# Lập Trình Mạng - Cuối Kỳ
# Thành Viên Nhóm

- Cao Xuân Dự
- Nguyễn Duy Khánh
- Đoàn Quang Hưng
- Nguyễn Việt Dũng
- Nông Hùng Phi

# MessZola
là ứng dụng trò chuyện thời gian thực gồm backend Node.js (Express + WebSocket) và frontend web HTML/CSS/JS. Lưu trữ dữ liệu bằng sql.js (SQLite in-memory + file persistence) và triển khai WebRTC để gọi video.Ứng dụng các kiến thức cơ bản trong quá trình học môn lập trình mạng

## Thư mục chính

```
├─ server/
│  ├─ core/            # HTTP, WS, RTC, DB, config
|  |- data/            # upload, sql file           
│  ├─ shared/          # Entity, Repository, Service, UseCase
│  ├─ features/        # auth, user, friend, room, chat, call, file
│  ├─ presentation/    # REST router + WS router
│  └─ server.js        # điểm khởi động
└─ web/
   ├─ app/             # AppShell + khởi động SPA
   ├─ core/            # HttpClient, WsClient, RtcClient, Store
   ├─ features/        # auth, chat, friends, profile, call UI
   ├─ assets/          # CSS theme, logo
   └─ index.html
```

## Cách chạy

```bash
npm install
npm run dev   
# hoặc nếu đã cài dependent
npm start
```
Server mặc định tại http://localhost:4000 và frontend từ thư mục `web/`.


## Chức năng chính

- **Đăng nhập/đăng ký** bằng số điện thoại, giữ phiên bằng JWT.
- **Quản lý bạn bè**: tìm kiếm, gửi lời mời, xác nhận, từ chối, xem trạng thái online/offline.
- **Chat 1-1 và nhóm** với lịch sử tin nhắn, call history và typing indicator.
- **Quản trị nhóm**: tạo nhóm, đổi tên, mời thêm bạn, rời hoặc giải tán nhóm.
- **Gửi file**: kéo/thả hoặc chọn file để gửi ngay trong khung chat.
- **Gọi video** nhiều người với bật/tắt mic, camera, chia sẻ màn hình.
- **Tối ưu UX**: cache dữ liệu cục bộ, tự reconnect WS,
