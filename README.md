# Tủ sách Phòng HCM

Trang web đọc dữ liệu từ file Excel và hiển thị danh mục sách theo từng trang. Nhấp vào một dòng để xem đầy đủ thông tin của sách.

## Các tệp

- `index.html` – giao diện trang web
- `styles.css` – phần định dạng giao diện
- `app.js` – đọc file Excel và hiển thị dữ liệu
- `sach.xlsx` – file Excel danh mục sách

## Cách sử dụng

1. Đặt file Excel vào thư mục này với tên `sach.xlsx`.
2. Đưa các tệp lên dịch vụ lưu trữ tĩnh như GitHub Pages, Netlify hoặc Cloudflare Pages.
3. Trang web sẽ tự động đọc file `sach.xlsx` và hiển thị danh mục sách.
4. Tạo mã QR cho đường dẫn đã xuất bản và đặt tại thư viện.

## Các cột trong file Excel

Hàng đầu tiên của file Excel cần có các cột sau:

- STT
- Mã số sách
- Tên sách
- Tác giả
- Nơi xuất bản
- Năm xuất bản
- Khổ
- Số trang
- Tiền VNĐ
- Ngày vào sổ
- Ghi chú

Ô tìm kiếm kiểm tra tất cả dữ liệu của sách. Nhấp vào một dòng để xem các thông tin bổ sung trong cửa sổ bật lên. Phân trang giúp bảng gọn và dễ sử dụng khi danh mục có hàng nghìn sách.

## Đưa lên GitHub Pages

1. Tạo một kho lưu trữ mới trên GitHub.
2. Tải lên các tệp `index.html`, `styles.css`, `app.js` và `sach.xlsx`.
3. Mở phần cài đặt của kho lưu trữ.
4. Chọn Pages và chọn nhánh chính.
5. Lưu lại và chờ trang web được xuất bản.
6. Sao chép đường dẫn cuối cùng và tạo mã QR.

## Xem thử trên máy tính

Chạy trang web trên máy tính bằng máy chủ tĩnh:

```bash
python -m http.server 8000
```

Sau đó mở đường dẫn:

```text
http://localhost:8000/
```

Máy chủ tĩnh giúp trình duyệt có thể đọc file Excel từ cùng một nguồn với trang web.
