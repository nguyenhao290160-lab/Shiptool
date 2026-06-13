# AI Help Assistant (server-side)

Hướng dẫn tóm tắt về kiến trúc AI Assistant server-side cho ShipRoute AI.

- Client (components/AiHelpWidget.tsx) gửi câu hỏi tới API route: `/api/ai-help`.
- API route (server) kiểm tra biến môi trường `OPENAI_API_KEY` (hoặc key của provider) và chạy provider adapter.
- Nếu server thiếu key hoặc provider chưa được cấu hình, API trả `fallbackToLocal: true` và widget sẽ dùng local rule-based engine.
- Không bao giờ đặt AI API key vào frontend (không dùng `NEXT_PUBLIC_` prefix cho key).
- Khi bật `NEXT_PUBLIC_AI_HELP_ENABLED=true`, widget sẽ thử gọi server; nếu tắt, widget luôn dùng local fallback.

Tệp liên quan:

- `app/api/ai-help/route.ts` — API route server-side (adapter placeholder).
- `lib/aiHelpClient.ts` — helper client gọi API route.
- `lib/aiHelpContext.ts` — helper xây dựng context ngắn gọn từ Feature Registry.
- `lib/appFeatureRegistry.ts` — nguồn dữ liệu tính năng (feature registry).

Lưu ý bảo mật:

- Không gửi thông tin nhạy cảm (địa chỉ, số điện thoại, danh sách đơn chi tiết) lên API server trừ khi có xác nhận rõ ràng.
- Luôn kiểm tra `OPENAI_API_KEY` trên server; không commit `.env.local`.
