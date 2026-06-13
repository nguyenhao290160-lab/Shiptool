# ShipRoute AI - Trợ lý sắp tuyến giao hàng

Ứng dụng **local-first** (ưu tiên cục bộ) dành cho shipper giúp quản lý đơn giao, lập tuyến tối ưu, xem bản đồ, theo dõi giao hàng, sao lưu dữ liệu và xem báo cáo hiệu suất.

**Đặc điểm:**
- 📱 **Local-first**: Tất cả dữ liệu lưu trên thiết bị, không cần backend
- 🌐 **Offline-friendly**: Hoạt động khi mất kết nối mạng
- 📦 **PWA**: Cài đặt như ứng dụng trên điện thoại
- ⚡ **Nhanh & nhẹ**: Không phụ thuộc server, phản hồi nhanh

## Tính năng chính

### Quản lý & Tối ưu
- **Quản lý đơn giao**: Thêm, chỉnh sửa, xóa, tìm kiếm, lọc theo trạng thái/mức độ ưu tiên
- **Dashboard**: Thống kê đơn giao, đơn sắp giao, đơn thất bại, tỷ lệ hoàn thành
- **Lập tuyến local**: Sắp tuyến giao hàng từ danh sách đơn
- **Tối ưu tuyến**: Dùng Google Distance Matrix hoặc rule-based local (fallback)
- **Bản đồ Google Maps**: Xem marker các đơn giao
- **Geocoding**: Chuyển đổi địa chỉ → tọa độ GPS
- **Directions**: Vẽ tuyến đường chi tiết trên bản đồ

### Dữ liệu & Lưu trữ
- **Lịch sử tuyến**: Xem lại các tuyến đã giao, thống kê quãng đường, thời gian, số đơn
- **Backup/Import**: Export toàn bộ dữ liệu JSON, CSV; import để khôi phục
- **Khách hàng thường xuyên**: Lưu danh sách khách, tìm nhanh khi tạo đơn

### Tài chính & Báo cáo
- **Chi phí vận hành**: Tính toán giá xăng, chi phí bảo trì, lợi nhuận ước tính
- **Báo cáo nâng cao**: Tổng hợp đơn, tuyến, khách, chi phí trong kỳ báo cáo
- **Export báo cáo**: Xuất JSON, CSV, in báo cáo bằng `window.print()`
- **Gợi ý thông minh**: Cảnh báo đơn ưu tiên cao, đơn thiếu tọa độ, vấn đề chi phí

### Ngoại tuyến & PWA
- **Chế độ Offline**: Tất cả dữ liệu được lưu cục bộ, app hoạt động khi mất mạng
- **PWA**: Cài đặt như một ứng dụng trên thiết bị
- **Service Worker**: Caching thông minh, tránh stale data từ Google API

## Công nghệ sử dụng

- **Next.js 16.2.9** - React framework, App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Styling utility-first
- **localStorage** - Client-side data storage
- **Google Maps JavaScript API** - Bản đồ
- **Google Geocoding API** - Chuyển địa chỉ → tọa độ
- **Google Directions API** - Vẽ tuyến đường
- **Google Distance Matrix API** - Tối ưu tuyến theo khoảng cách
- **PWA & Service Worker** - Offline support, installable
- **ESLint 9** - Code quality

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Trình duyệt: Chrome, Edge, Firefox, Safari (recommended: Chromium-based)

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem app.

**Lưu ý Windows/PowerShell**: Nếu gặp lỗi `npm.ps1 cannot be loaded`, dùng `npm.cmd` thay cho `npm`:

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Cấu hình Google Maps API

Để sử dụng Google Maps, Geocoding, Directions và Distance Matrix, bạn cần:

1. **Tạo file `.env.local`** trong thư mục root của project:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

2. **Lấy API key** từ [Google Cloud Console](https://console.cloud.google.com/):
   - Tạo project mới hoặc chọn project cũ
   - Tạo API key
   - Bật các API sau:
     - Maps JavaScript API
     - Geocoding API
     - Directions API
     - Distance Matrix API

3. **Sao chép API key** vào `.env.local`

**Lưu ý quan trọng:**
- Không bao giờ commit `.env.local` lên repository (đã thêm vào `.gitignore`)
- Không share API key thật công khai
- App sẽ hoạt động bình thường offline và hiển thị fallback khi thiếu API key

### Bảo mật Google Maps API key
Để giảm nguy cơ lộ API key và tránh bị sử dụng trái phép, hãy cấu hình giới hạn (restrictions) cho API key trong Google Cloud Console:

1. Vào Google Cloud Console → APIs & Services → Credentials → chọn API key sử dụng cho ShipRoute AI.
2. Ở mục "Application restrictions" chọn **HTTP referrers (web sites)**.
3. Thêm các referrer cho local/dev và Vercel, ví dụ:

```
http://localhost:3000/*
http://localhost:3001/*
https://ten-du-an.vercel.app/*
```

4. Ở mục "API restrictions" chỉ cho phép các API sau:

- Maps JavaScript API
- Geocoding API
- Directions API
- Distance Matrix API

5. Lưu thay đổi và đợi vài phút để Google áp dụng.

Lưu ý: Không để API key ở trạng thái "Unrestricted". Nếu gặp lỗi `RefererNotAllowedMapError`, kiểm tra lại danh sách referrers. Không đưa API key thật vào README hoặc mã nguồn.

## Build production

```bash
npm run build
npm start
```

## Kiểm tra lint

```bash
npm run lint
```

### Kiểm tra toàn bộ

Trước khi commit/push lên GitHub, chạy:

```bash
npm run lint
npm run build
git status --short
```

## Chế độ Offline / PWA

### Offline Status Banner

Khi mất kết nối mạng, app sẽ hiển thị banner cảnh báo màu vàng ở phía trên. Tất cả dữ liệu local vẫn có sẵn:

- ✅ Quản lý đơn giao (thêm, sửa, xóa)
- ✅ Lập tuyến local (không cần Google API)
- ✅ Xem lịch sử tuyến
- ✅ Backup dữ liệu

### Google API Limitations Offline

Các tính năng này cần kết nối mạng:

- ❌ Google Maps markers & maps
- ❌ Geocoding (chuyển địa chỉ → tọa độ)
- ❌ Directions (vẽ tuyến trên bản đồ)
- ❌ Distance Matrix (tối ưu tuyến)

Khi offline, app sẽ hiển thị thông báo lỗi rõ ràng thay vì crash.

### Cài đặt PWA

Trình duyệt hỗ trợ:
- Chrome / Chromium
- Edge
- Firefox (phần mềm, chưa web app)
- Safari (partial support)

**Hướng dẫn cài đặt:**

1. **Chrome / Edge**: Menu ba chấm (⋯) → "Cài đặt ứng dụng" / "Install app"
2. **Firefox**: Menu (≡) → "Cài đặt ứng dụng"
3. **Safari**: Dùng nút Share → "Thêm vào màn hình chính"

Sau khi cài, app sẽ:
- Mở nhanh hơn từ icon trên màn hình chính
- Hoạt động chế độ fullscreen
- Giữ dữ liệu local cục bộ trên thiết bị

### Service Worker & Caching

App sử dụng Service Worker để:
- Cache app shell (HTML, CSS, JS)
- Network-first strategy cho trang chính
- Không cache Google API responses (tránh stale data)

Service worker tự động đăng ký ở chế độ production.

## Cấu trúc dự án

```
ShipRoute AI/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout + PWA metadata
│   ├── page.tsx                   # Home/index
│   ├── home/                      # Dashboard
│   ├── orders/                    # Quản lý đơn giao
│   ├── customers/                 # Khách hàng thường xuyên
│   ├── route-planner/             # Lập tuyến
│   ├── history/                   # Lịch sử tuyến
│   ├── reports/                   # Báo cáo nâng cao
│   ├── settings/                  # Cài đặt, API key
│   ├── route/[id]/
│   │   ├── delivery/              # Theo dõi giao hàng
│   │   ├── orders/                # Xem đơn của tuyến
│   │   └── scan/                  # Quét OCR
│   ├── globals.css                # Tailwind + global styles
│   └── page.tsx                   # Route-specific pages
│
├── components/                    # React components
│   ├── Dashboard.tsx              # Trang chủ
│   ├── OrderForm.tsx              # Form tạo/sửa đơn
│   ├── MapView.tsx                # Bản đồ Google Maps
│   ├── OperatingCostCalculator.tsx # Tính chi phí
│   ├── ReportPanel.tsx            # Báo cáo
│   ├── OfflineStatusBanner.tsx    # Banner offline
│   ├── RootClientWrapper.tsx      # Service worker + online status
│   └── [more components]
│
├── lib/                           # Utilities & helpers
│   ├── types.ts                   # TypeScript interfaces
│   ├── deliveryStorage.ts         # Order storage
│   ├── routeHistoryStorage.ts     # Route history storage
│   ├── customerStorage.ts         # Customer storage
│   ├── costStorage.ts             # Cost settings storage
│   ├── mapUtils.ts                # Maps utilities
│   ├── geocoding.ts               # Geocoding API
│   ├── directions.ts              # Directions API
│   ├── distanceMatrix.ts          # Distance Matrix API
│   ├── backupUtils.ts             # Backup/export/import
│   ├── reportExport.ts            # Report export
│   ├── smartSuggestions.ts        # Smart suggestions
│   ├── dashboardStats.ts          # Dashboard calculations
│   └── [more utilities]
│
├── hooks/                         # React hooks
│   └── useOnlineStatus.ts         # Online/offline detection
│
├── public/                        # Static files
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   ├── favicon.ico                # App icon
│   └── icons/                     # PWA icons
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind CSS config
├── next.config.ts                 # Next.js config
├── eslint.config.mjs              # ESLint config
├── postcss.config.mjs             # PostCSS config
├── .gitignore                     # Git ignore patterns
├── README.md                      # This file
└── RELEASE_NOTES.md               # Release notes (optional)
```

## Triển khai (Deploy) & Vercel

Ứng dụng có thể được deploy nhanh lên Vercel (hoặc hosting hỗ trợ Next.js). Hướng dẫn nhanh:

1. Push mã nguồn sạch lên GitHub (branch `master` hoặc `main`).
2. Đăng nhập vào https://vercel.com và chọn **Import Project** → **From Git** → chọn repository của bạn.
3. Chọn framework: **Next.js** (Vercel tự nhận thường đúng).
4. Trong mục **Environment Variables**, thêm:

```text
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> Lưu ý: Vì Maps JavaScript API chạy trên trình duyệt, biến môi trường này là public. Hãy **bật** các API cần thiết và **giới hạn** key bằng HTTP referrers (domain) trong Google Cloud Console.

5. Deploy và kiểm tra trang sản phẩm. Kiểm tra các route chính và chức năng offline/local.

6. Nếu muốn test trên domain riêng, cấu hình DNS trên Vercel và thêm domain vào Google Cloud API restrictions.

## Troubleshooting


### App không mở được / Hydration error

1. Kiểm tra console DevTools (F12 → Console)
2. Xóa cache trình duyệt: `Ctrl+Shift+Delete` (Chrome/Edge) hoặc `Ctrl+Shift+Delete` (Firefox)
3. Chạy `npm run build` lại
4. Khởi động lại dev server: `npm run dev`

### Google Maps không hiển thị

- Kiểm tra `.env.local` có API key không
- Đảm bảo có kết nối mạng
- Xem console DevTools để lỗi chi tiết (Network tab, Console tab)
- Kiểm tra API key không bị hết quota

### Geocoding/Directions/Distance Matrix báo lỗi

- Kiểm tra `.env.local` có API key không
- Kiểm tra API đã bật trên Google Cloud Console không
- Nếu offline, các API Google sẽ không hoạt động

### Dữ liệu bị mất

- Kiểm tra `localStorage` trong DevTools: F12 → Application → Local Storage → http://localhost:3000
- Khôi phục từ file backup JSON nếu có
- Nếu vô tình xóa, không thể khôi phục (khuyến cáo: backup thường xuyên)

### Service Worker không đăng ký

1. Kiểm tra: DevTools → Application → Service Workers
2. Chỉ hoạt động ở production build
3. Chạy `npm run build` để test

### App chậm

- Xóa cache: DevTools → Application → Clear storage
- Rebuild: `npm run build` → `npm start`
- Kiểm tra console cho error/warning lớn

## Ghi chú phát triển

- **Giai đoạn hiện tại**: Local-first, không backend
- **Kế tiếp (nếu cần)**: Có thể thêm backend/database/auth sau
- **Module có thể mở rộng**: Tất cả module đều kế thừa từ types.ts, có thể extend
- **Google API**: Đã bọc fallback an toàn, không crash khi offline/thiếu key

## AI Help Assistant

ShipRoute AI có AI Help Widget local/rule-based. Có thể bật AI thật server-side bằng cách cấu hình biến môi trường phía server và bật flag sau:

```env
NEXT_PUBLIC_AI_HELP_ENABLED=true
OPENAI_API_KEY=your_server_side_ai_key_here
AI_HELP_MODEL=your_ai_model_here
```

Lưu ý:
- Không đặt AI API key ở frontend (không dùng `NEXT_PUBLIC_` cho key).
- Nếu server thiếu key hoặc offline, widget tự fallback về local/rule-based.

## Quy trình thêm tính năng mới

Để đảm bảo tính nhất quán khi mở rộng ShipRoute AI, xem các tài liệu trong thư mục `docs/` trước khi bắt đầu phát triển một tính năng mới. Các tài liệu chính:

- `docs/FEATURE_DEVELOPMENT_WORKFLOW.md` — Quy trình chuẩn từng bước.
- `docs/NEW_FEATURE_TEMPLATE.md` — Template mô tả tính năng (dùng để lập kế hoạch và PR).
- `docs/NEW_FEATURE_PROMPT_TEMPLATE.md` — Prompt mẫu để dùng khi nhờ AI code editor tạo feature.

Mỗi tính năng mới nên cập nhật `lib/appFeatureRegistry.ts` để AI Help Widget tự động biết về tính năng đó và có thể hướng dẫn người dùng.

## Lưu trữ dữ liệu & Backup

### Dữ liệu local
Tất cả dữ liệu được lưu cục bộ trên thiết bị bằng `localStorage` trình duyệt. **Không có backend server hoặc database cloud**.

Dữ liệu gồm:
- Danh sách đơn giao
- Tuyến đường hiện tại
- Lịch sử tuyến
- Khách hàng thường xuyên
- Cài đặt chi phí vận hành
- Dữ liệu báo cáo

### Backup dữ liệu
**Khuyến cáo**: Thực hiện backup định kỳ để tránh mất dữ liệu.

App cung cấp chức năng:
- **Export JSON**: Xuất toàn bộ dữ liệu thành file `.json`
- **Export CSV**: Xuất danh sách đơn thành file `.csv`
- **Import JSON**: Khôi phục dữ liệu từ file backup

Truy cập chức năng Backup tại: **Settings → Backup dữ liệu**

### Lưu ý quan trọng
- Nếu xóa cache/cookies trình duyệt, dữ liệu sẽ mất
- Nếu đổi máy, cần import backup từ máy cũ
- Khôi phục từ Drive/cloud cá nhân là trách nhiệm người dùng

## Git & GitHub

### File không commit

**Tuyệt đối không commit các file sau:**

```
.env.local
.env*.local
node_modules/
.next/
.idea/
.vscode/
*.log
*.tmp.driveupload
*.tmp.drivedownload
```

Các file này đã được thêm vào `.gitignore`.

### Nếu project nằm trên Google Drive

Project có thể nằm trong thư mục Desktop đang sync Google Drive, gây phát sinh file tạm:

```
*.tmp.driveupload
*.tmp.drivedownload
```

**Khuyến cáo**: Chuyển project ra thư mục không sync Drive, ví dụ:

```
C:\Development\shiproute-ai
```

Hoặc loại trừ project khỏi Drive sync.

### Workflow push GitHub

Trước khi push lên GitHub:

```bash
# 1. Kiểm tra trạng thái
git status --short

# 2. Kiểm tra lint/build
npm run lint
npm run build

# 3. Commit nếu có thay đổi
git add -A
git commit -m "Describe your changes"

# 4. Push
git push origin master
```

## Checklist kiểm tra trước release

### Tự động
```bash
npm run lint       # Kiểm tra code quality
npm run build      # Build production
```

### Thủ công - Quản lý đơn
- [ ] Dashboard mở được, hiển thị thống kê
- [ ] Thêm đơn giao được
- [ ] Chỉnh sửa đơn giao được
- [ ] Xóa đơn giao được
- [ ] Tìm kiếm, lọc đơn giao được

### Thủ động - Lập tuyến & Bản đồ
- [ ] Lập tuyến từ danh sách đơn được
- [ ] Tối ưu tuyến local được (không cần API key)
- [ ] Bản đồ hiển thị khi có API key
- [ ] Bản đồ hiển thị fallback khi thiếu API key
- [ ] Bản đồ hiển thị fallback khi offline

### Thủ động - Geocoding & Directions
- [ ] Geocoding báo lỗi rõ ràng khi thiếu API key
- [ ] Geocoding báo lỗi rõ ràng khi offline
- [ ] Directions báo lỗi rõ ràng khi thiếu API key
- [ ] Distance Matrix báo lỗi rõ ràng khi thiếu API key

### Thủ động - Dữ liệu & Backup
- [ ] Lịch sử tuyến hiển thị được
- [ ] Export JSON backup hoạt động
- [ ] Export CSV hoạt động
- [ ] Import JSON backup không crash app
- [ ] Dữ liệu khách hàng thường xuyên lưu được

### Thủ động - Báo cáo
- [ ] Báo cáo tổng hợp đơn/tuyến/chi phí được
- [ ] Export báo cáo JSON hoạt động
- [ ] Export báo cáo CSV hoạt động
- [ ] In báo cáo hoạt động (`Ctrl+P`)

### Thủ động - UI/UX
- [ ] Không có chữ trắng trên nền sáng
- [ ] Không tràn ngang trên mobile (375px)
- [ ] Không tràn ngang trên tablet (768px)
- [ ] Responsive tốt trên desktop
- [ ] Không có console error/warning

### Thủ động - Offline
- [ ] Offline banner hiển thị khi mất mạng
- [ ] Quản lý đơn vẫn dùng được offline
- [ ] Lập tuyến local vẫn dùng được offline
- [ ] Backup vẫn dùng được offline
- [ ] Báo cáo vẫn dùng được offline

### Git & Repository
- [ ] Không commit `.env.local`
- [ ] Không commit `node_modules/`
- [ ] Không commit `.next/`
- [ ] Không commit `.idea/` hoặc `.vscode/`
- [ ] Không commit `*.log`
- [ ] Không commit file tạm Google Drive

## License

MIT
