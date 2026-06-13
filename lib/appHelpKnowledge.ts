export interface HelpTopic {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
  steps?: string[];
  relatedModules?: string[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    keywords: ["dashboard", "bảng", "thống kê"],
    summary:
      "Trang Dashboard hiển thị thống kê đơn giao, trạng thái đơn và hiệu suất tổng quan.",
    steps: [
      "Mở trang Dashboard từ menu chính.",
      "Xem số đơn chờ, đang giao, đã giao và thống kê hiệu suất.",
      "Dùng bộ lọc để xem theo khoảng thời gian hoặc trạng thái.",
    ],
    relatedModules: ["reports", "orders"],
  },
  {
    id: "orders",
    title: "Quản lý đơn giao",
    keywords: ["đơn", "thêm đơn", "quản lý đơn", "order", "tạo đơn"],
    summary:
      "Thêm, sửa, xóa đơn giao. Mỗi đơn có tên khách, số điện thoại, địa chỉ, ưu tiên và ghi chú.",
    steps: [
      "Vào mục Quản lý đơn (Orders).",
      "Nhấn 'Thêm đơn' hoặc icon '+' để tạo đơn mới.",
      "Nhập tên khách, số điện thoại, địa chỉ và các thông tin cần thiết.",
      "Lưu lại. Đơn sẽ lưu vào localStorage trên trình duyệt.",
    ],
    relatedModules: ["route-planner", "customers"],
  },
  {
    id: "route_planner",
    title: "Lập tuyến đường",
    keywords: ["lập tuyến", "tuyến", "route", "sắp tuyến"],
    summary:
      "Tạo tuyến giao hàng từ danh sách đơn, có thể sắp thủ công hoặc tối ưu tự động.",
    steps: [
      "Mở Route Planner.",
      "Chọn các đơn muốn đưa vào tuyến.",
      "Chọn điểm xuất phát nếu cần.",
      "Bấm 'Tối ưu' để dùng Distance Matrix (nếu có API key) hoặc sắp thủ công.",
    ],
    relatedModules: ["distance_matrix", "directions", "map"],
  },
  {
    id: "map",
    title: "Bản đồ Google Maps",
    keywords: ["bản đồ", "map", "google maps", "marker"],
    summary:
      "Hiển thị marker đơn giao trên bản đồ. Cần cấu hình NEXT_PUBLIC_GOOGLE_MAPS_API_KEY để bật bản đồ.",
    steps: [
      "Bảo đảm đã đặt NEXT_PUBLIC_GOOGLE_MAPS_API_KEY trong .env.local hoặc Environment Variables trên Vercel.",
      "Nếu không có key hoặc offline, app sẽ hiển thị vùng fallback và vẫn cho phép lập tuyến local.",
    ],
    relatedModules: ["geocoding", "directions"],
  },
  {
    id: "geocoding",
    title: "Lấy tọa độ (Geocoding)",
    keywords: ["geocoding", "tọa độ", "địa chỉ", "lat", "lng"],
    summary:
      "Chuyển địa chỉ thành toạ độ (lat/lng) để hiển thị marker và tối ưu tuyến. Cần bật Geocoding API và key.",
    steps: [
      "Trên form tạo/sửa đơn, nhập địa chỉ đầy đủ.",
      "Sử dụng chức năng 'Lấy tọa độ' để gọi Geocoding (cần API key và mạng).",
    ],
    relatedModules: ["map", "orders"],
  },
  {
    id: "directions",
    title: "Vẽ tuyến (Directions)",
    keywords: ["directions", "vẽ tuyến", "tuyến đường"],
    summary:
      "Vẽ tuyến chi tiết trên bản đồ bằng Directions API. Cần key và Maps JS để hiển thị.",
    steps: [
      "Tạo tuyến trong Route Planner.",
      "Bấm 'Vẽ tuyến' để gọi Directions và hiển thị polyline trên bản đồ.",
    ],
    relatedModules: ["map", "route_planner"],
  },
  {
    id: "distance_matrix",
    title: "Tối ưu tuyến (Distance Matrix)",
    keywords: ["distance matrix", "tối ưu", "tối ưu tuyến", "độ dài"],
    summary:
      "Dùng Distance Matrix API để tối ưu thứ tự điểm theo khoảng cách nếu có API key; có fallback rule-based khi offline.",
    steps: [
      "Trong Route Planner, bấm 'Tối ưu'.",
      "Nếu có API key, app sẽ dùng Distance Matrix để tính chi phí/quãng đường giữa các điểm.",
      "Nếu không có key hoặc offline, app dùng thuật toán local đơn giản để sắp xếp.",
    ],
    relatedModules: ["route_planner", "map"],
  },
  {
    id: "backup",
    title: "Backup dữ liệu",
    keywords: ["backup", "sao lưu", "export", "import", "json", "csv"],
    summary:
      "Export/Import toàn bộ dữ liệu (JSON/CSV) để lưu trữ ngoài trình duyệt. Nên backup định kỳ.",
    steps: [
      "Mở Settings → Backup dữ liệu.",
      "Chọn 'Export JSON' để tải file backup.",
      "Để khôi phục, chọn 'Import JSON' và upload file backup đúng format.",
    ],
    relatedModules: ["settings", "reports"],
  },
  {
    id: "offline",
    title: "Ngoại tuyến / PWA",
    keywords: ["offline", "pwa", "service worker", "ngoại tuyến"],
    summary:
      "App hỗ trợ PWA và hoạt động khi mất mạng cho các chức năng local (orders, route planning, history, reports).",
    steps: [
      "Khi offline, một banner sẽ hiển thị trạng thái mạng.",
      "Các chức năng phụ thuộc Google API sẽ không hoạt động khi offline.",
    ],
    relatedModules: ["service worker", "backup"],
  },
  {
    id: "settings_api",
    title: "Cài đặt / API Center",
    keywords: ["api key", "cấu hình", "settings", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
    summary:
      "Trang Settings cho phép kiểm tra trạng thái API key, hướng dẫn cấu hình và khuyến nghị bảo mật.",
    steps: [
      "Mở Settings → API Center.",
      "Kiểm tra trạng thái 'Đã cấu hình' hoặc 'Chưa cấu hình'.",
      "Nếu chưa, thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY vào .env.local và restart (dev).",
    ],
    relatedModules: ["map", "README"],
  },
  {
    id: "history",
    title: "Lịch sử tuyến",
    keywords: ["lịch sử", "history", "tuyến đã giao", "route history"],
    summary: "Xem lại các tuyến đã lưu cùng thống kê quãng đường và chi phí (nếu có).",
    steps: ["Mở History → chọn tuyến muốn xem → xem chi tiết và chi phí snapshot nếu lưu."],
    relatedModules: ["route_planner", "reports"],
  },
  {
    id: "operating_cost",
    title: "Chi phí vận hành",
    keywords: ["chi phí", "xăng", "phí vận hành", "lợi nhuận"],
    summary: "Tính ước lượng chi phí xăng, bảo trì, chi phí khác và lợi nhuận ước tính theo tuyến.",
    steps: ["Mở Route Planner hoặc Route Cost Summary để xem ước tính chi phí dựa trên tổng km và cài đặt chi phí."],
    relatedModules: ["route_planner", "settings"],
  },
  {
    id: "customers",
    title: "Khách hàng thường xuyên",
    keywords: ["khách hàng", "customer", "thường xuyên"],
    summary: "Lưu danh sách khách hàng để tái sử dụng khi tạo đơn, giúp tiết kiệm thời gian nhập liệu.",
    steps: ["Mở Customers → Thêm khách thường xuyên → Sử dụng khi tạo đơn mới."],
    relatedModules: ["orders"],
  },
  {
    id: "reports",
    title: "Báo cáo nâng cao",
    keywords: ["báo cáo", "reports", "export", "in báo cáo"],
    summary: "Xem tổng hợp đơn/tuyến/chi phí theo khoảng thời gian, export JSON/CSV hoặc in báo cáo.",
    steps: ["Mở Reports → Chọn bộ lọc → Xem thống kê → Export hoặc In."],
    relatedModules: ["backup", "dashboard"],
  },
  {
    id: "api_key_security",
    title: "Bảo mật API key",
    keywords: ["bảo mật", "restriction", "referrer", "restrict"],
    summary:
      "Hướng dẫn cấu hình HTTP referrers và API restrictions trên Google Cloud để bảo vệ API key.",
    steps: [
      "Vào Google Cloud Console → APIs & Services → Credentials → Chọn API key.",
      "Chọn Application restrictions → HTTP referrers và thêm localhost + domain Vercel.",
      "Chọn API restrictions → chỉ cho phép Maps/Geocoding/Directions/Distance Matrix.",
    ],
    relatedModules: ["settings", "README"],
  },
  {
    id: "faq",
    title: "Lỗi thường gặp",
    keywords: ["lỗi", "sự cố", "không hiển thị", "error"],
    summary:
      "Các lỗi thường gặp gồm: thiếu API key, offline, RefererNotAllowedMapError, quota/billing, và data loss do xóa cache.",
    steps: [
      "Kiểm tra console DevTools để xem lỗi chi tiết.",
      "Kiểm tra .env.local và status API trong Settings.",
      "Sử dụng Export JSON trước khi làm thao tác can thiệp lớn.",
    ],
    relatedModules: ["settings", "backup"],
  },
];
