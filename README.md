# ShipRoute AI - Trợ lý sắp tuyến giao hàng

Ứng dụng PWA (Progressive Web App) dành cho shipper giúp quản lý đơn giao, lập tuyến tối ưu và theo dõi giao hàng một cách hiệu quả.

## Tính năng chính

- **Quản lý đơn giao**: Thêm, chỉnh sửa, xóa và phân loại đơn giao
- **Lập tuyến tối ưu**: Sử dụng Google Distance Matrix API để tối ưu tuyến đường
- **Bản đồ tương tác**: Hiển thị marker đơn giao trên Google Maps
- **Geocoding**: Chuyển đổi địa chỉ thành tọa độ GPS
- **Chế độ Offline**: Tất cả dữ liệu được lưu cục bộ, app hoạt động khi mất mạng
- **PWA**: Cài đặt như một ứng dụng trên thiết bị

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem app.

## Build production

```bash
npm run build
npm start
```

## Lint code

```bash
npm run lint
```

## Cấu hình Google Maps API

Để sử dụng Google Maps, Geocoding, Directions và Distance Matrix, bạn cần:

1. Tạo file `.env.local` trong thư mục root:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

2. Lấy API key từ [Google Cloud Console](https://console.cloud.google.com/)

3. Bật các API sau:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API

**Lưu ý**: Không commit API key lên repository. File `.env.local` không được tracked by git.

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
app/
├── home/                    # Trang chủ
├── orders/                  # Quản lý đơn giao
├── route-planner/           # Lập tuyến
├── route/[id]/
│   ├── delivery/            # Theo dõi giao hàng
│   ├── orders/              # Xem đơn của tuyến
│   └── scan/                # Quét OCR
├── history/                 # Lịch sử tuyến
├── layout.tsx               # Root layout + PWA metadata
└── globals.css              # Tailwind + global styles

components/
├── OfflineStatusBanner.tsx   # Banner cảnh báo offline
├── PwaInstallHint.tsx        # Hướng dẫn cài PWA
├── RootClientWrapper.tsx     # Client wrapper (service worker)
├── MapView.tsx              # Google Maps viewer
└── [other components]

lib/
├── mapUtils.ts              # Google Maps utilities
├── geocoding.ts             # Geocoding API
├── directions.ts            # Directions API
├── distanceMatrix.ts        # Distance Matrix API
├── deliveryStorage.ts       # Order localStorage
├── routeStorage.ts          # Route localStorage
└── [other utilities]

public/
├── manifest.json            # PWA manifest
├── sw.js                    # Service Worker
├── icons/
│   ├── icon-192.svg         # PWA icon 192x192
│   └── icon-512.svg         # PWA icon 512x512
└── [other assets]

hooks/
└── useOnlineStatus.ts       # Hook kiểm tra online status
```

## Lưu trữ dữ liệu

Tất cả dữ liệu được lưu tại:
- `localStorage` (mặc định trong browser)
- Local cơ sở dữ liệu của thiết bị (không cần server)

Không có backend / database server - app hoạt động 100% cục bộ.

## Backup & Restore

App có tính năng:
- Export toàn bộ dữ liệu dưới dạng JSON
- Import dữ liệu từ file JSON

Xem "Backup dữ liệu" trong app để sử dụng.

## Troubleshooting

### App không mở được offline

1. Kiểm tra service worker đã đăng ký chưa (DevTools → Application → Service Workers)
2. Xóa cache và reload
3. Chạy `npm run build` lại

### Google Maps không hiển thị

- Kiểm tra API key ở `.env.local`
- Đảm bảo có kết nối mạng
- Xem console DevTools để lỗi chi tiết

### Dữ liệu bị mất

- Kiểm tra `localStorage` trong DevTools → Application → Local Storage
- Khôi phục từ file backup nếu có

## License

MIT
