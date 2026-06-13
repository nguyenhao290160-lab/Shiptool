# Prompt mẫu thêm tính năng mới cho ShipRoute AI

Hãy tiếp tục dự án Next.js App Router ShipRoute AI trong thư mục hiện tại.

Tôi muốn thêm tính năng mới:

Tên tính năng: [ĐIỀN TÊN TÍNH NĂNG]

Mục tiêu: [ĐIỀN MỤC TIÊU]

Yêu cầu:

- Không rebuild app từ đầu.
- Không xóa code cũ.
- Không đổi kiến trúc lớn.
- Không thêm backend/database/auth nếu chưa được yêu cầu.
- Không hardcode API key.
- Không làm mất dữ liệu localStorage cũ.
- UI tiếng Việt.
- Responsive desktop/mobile.
- Ưu tiên local/offline.

Trước khi code, hãy đọc:

- `docs/FEATURE_DEVELOPMENT_WORKFLOW.md`
- `docs/NEW_FEATURE_TEMPLATE.md`
- `lib/appFeatureRegistry.ts`
- các file/module liên quan hiện có

Khi thêm tính năng, bắt buộc kiểm tra:

1. Code tính năng chính.
2. Type/helper nếu cần.
3. localStorage key nếu có lưu dữ liệu.
4. Backup/import nếu có dữ liệu local.
5. Dashboard/Reports nếu có thống kê.
6. Navigation nếu có trang mới.
7. README/USER_GUIDE nếu tính năng lớn.
8. Cập nhật AI Help Registry trong `lib/appFeatureRegistry.ts`.
9. Test AI Help hỏi được về tính năng mới.
10. Chạy `npm.cmd run lint`.
11. Chạy `npm.cmd run build`.

Sau khi xong, báo cáo:

- Đã thêm/sửa file nào.
- localStorage key mới là gì nếu có.
- Backup/import đã cập nhật chưa.
- AI Help Registry đã cập nhật chưa.
- README/docs đã cập nhật chưa.
- Kết quả lint/build.
- Còn lỗi gì không.
