# PikPak URL Extractor PRO

**PikPak URL Extractor PRO** là một tiện ích mở rộng Chrome (Manifest V3) mạnh mẽ, được thiết chế để tự động bắt và hiển thị các liên kết video (pre-signed URLs) trực tiếp từ trình phát video của PikPak.

## 🚀 Tính năng nổi bật

- **Phát hiện tự động**: Tự động bắt link từ thẻ `<video>`, các yêu cầu `fetch` và `XMLHttpRequest`.
- **Giao diện hiện đại**: Bảng điều khiển nổi (Floating Panel) phong cách Dark Theme với điểm nhấn Neon Green.
- **Quản lý thông minh**:
  - Hiển thị thời gian hết hạn (countdown timer) của từng liên kết.
  - Tự động xóa các liên kết đã hết hạn.
  - Tránh trùng lặp liên kết.
- **Tiện ích tối đa**:
  - Bảng điều khiển có thể kéo thả (draggable) và thay đổi kích thước (resizable).
  - Sao chép nhanh, mở trong tab mới hoặc xóa từng link.
  - **Xuất danh sách**: Lưu tất cả các link đã bắt được thành file `.txt`.
- **Trạng thái linh hoạt**: Bật/Tắt tiện ích dễ dàng bằng cách click vào biểu tượng extension. Badge sẽ hiển thị số lượng link đang hoạt động hoặc trạng thái "OFF".

## 🛠 Hướng dẫn cài đặt

### Cho Chrome / Edge / Brave

1.  Tải xuống hoặc sao chép thư mục mã nguồn `pikpak-url-extractor-pro`.
2.  Mở trình duyệt và truy cập: `chrome://extensions/`.
3.  Bật **Chế độ dành cho nhà phát triển (Developer mode)**.
4.  Nhấn vào nút **Tải tiện ích đã giải nén (Load unpacked)**.
5.  Chọn thư mục `pikpak-url-extractor-pro`.

### Cho Firefox

1.  Mở Firefox và truy cập: `about:debugging#/runtime/this-firefox`.
2.  Nhấn vào nút **Load Temporary Add-on...**.
3.  Chọn file `manifest.json` trong thư mục `pikpak-url-extractor-pro`.
4.  Tiện ích sẽ được cài đặt tạm thời.

## 📖 Hướng dẫn sử dụng

1.  **Kích hoạt**: Đảm bảo tiện ích đang ở trạng thái **ON** (kiểm tra badge trên biểu tượng extension).
2.  **Truy cập PikPak**: Mở trang web [PikPak](https://mypikpak.com/) và đăng nhập.
3.  **Xem Video**: Chọn một video bất kỳ và nhấn Play.
4.  **Bắt Link**: Bảng điều khiển sẽ tự động xuất hiện (nếu ẩn, hãy đảm bảo extension đang ON) và hiển thị các URL bắt được.
5.  **Thao tác**:
    - **Copy**: Sao chép URL vào clipboard.
    - **Open**: Mở link trực tiếp trong tab mới để tải xuống.
    - **Export**: Nhấn nút Export ở Header để lưu toàn bộ danh sách link.
    - **Clear**: Xóa sạch danh sách hiện tại.

## 🔒 Bảo mật và Quyền riêng tư

- Tiện ích **không** can thiệp vào quá trình đăng nhập hoặc tài khoản của bạn.
- Tiện ích **không** thay đổi hành vi của trang web PikPak.
- Mọi dữ liệu (URL) chỉ được lưu trữ tạm thời trong bộ nhớ (in-memory) của trang web hiện tại và sẽ mất khi bạn reload trang hoặc tắt trình duyệt (trừ khi lưu lại qua Export).
- Không thu thập thông tin cá nhân của người dùng.

---

Hiện tại vẫn còn khá nhiều bug và vẫn chưa lấy đúng 100% url cần thiết để dowloand dữ liệu!
Nhưng vẫn dùng được
