# Quy trình thêm tính năng mới cho ShipRoute AI

Mỗi khi thêm một tính năng mới, cần kiểm tra đủ các nhóm sau:

## 1. Xác định phạm vi tính năng

- Tính năng này giải quyết vấn đề gì?
- Tính năng nằm ở module nào?
- Có cần route/trang mới không?
- Có cần component mới không?
- Có cần helper/type mới không?
- Có cần lưu dữ liệu localStorage không?
- Có cần Google API không?
- Có ảnh hưởng offline không?

## 2. Code chính

- Tạo/sửa component cần thiết.
- Tạo/sửa route nếu có trang mới.
- Tạo/sửa type trong `lib/types.ts` hoặc file type phù hợp.
- Tạo/sửa helper nếu có logic riêng.
- Không phá module cũ.
- Không đổi kiến trúc lớn nếu không cần.

## 3. localStorage

Nếu tính năng có lưu dữ liệu:

- Đặt key rõ ràng, ví dụ `shiproute_feature_name`.
- Không đổi key cũ làm mất dữ liệu.
- Đọc dữ liệu phải có fallback khi rỗng/sai format.
- Parse JSON phải an toàn.
- Dữ liệu mới nên tương thích backup/import.

## 4. Backup/import

Nếu tính năng có dữ liệu local:

- Thêm dữ liệu đó vào backup JSON.
- Import backup phải khôi phục được dữ liệu.
- Backup cũ vẫn import được.
- Không làm crash app nếu thiếu field mới.

## 5. Dashboard/Reports

Nếu tính năng có thống kê:

- Cân nhắc thêm vào Dashboard.
- Cân nhắc thêm vào Reports.
- Cân nhắc export JSON/CSV nếu phù hợp.
- Không thêm nếu làm UI rối hoặc chưa cần.

## 6. Navigation/UI

Nếu có trang mới:

- Thêm navigation.
- Kiểm tra desktop/mobile.
- Không tràn ngang.
- Không dùng chữ khó đọc.
- Có empty/loading/error state nếu cần.

## 7. AI Help Widget

Mỗi tính năng mới phải cập nhật:

- `lib/appFeatureRegistry.ts`
- keywords
- shortDescription
- userGuide
- commonQuestions
- troubleshooting nếu có

Sau đó test AI Help bằng câu hỏi:

- “Tính năng mới là gì?”
- “Hướng dẫn dùng [tên tính năng]”
- “App có những tính năng gì?”
- “Lỗi [tên tính năng] thì sao?”

## 8. Docs

Tính năng lớn cần cập nhật:

- README.md
- USER_GUIDE.md nếu có
- docs liên quan nếu cần

## 9. Test

Sau khi thêm tính năng, chạy:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Test thủ công:

- Tính năng mới hoạt động.
- Reload không mất dữ liệu nếu có localStorage.
- Backup/import hoạt động nếu có dữ liệu.
- Offline không crash.
- Thiếu API key không crash nếu có Google API.
- AI Help trả lời được về tính năng mới.
- Mobile không lỗi layout.
