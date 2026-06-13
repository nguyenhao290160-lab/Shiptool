export type FeatureStatus = "stable" | "new" | "beta" | "planned";

export interface AppFeature {
  id: string;
  name: string;
  module: string;
  status: FeatureStatus;
  version?: string;
  updatedAt?: string; // ISO string
  shortDescription: string;
  userGuide: string[];
  keywords: string[];
  relatedFeatures?: string[];
  commonQuestions?: {
    question: string;
    answer: string;
  }[];
  troubleshooting?: {
    problem: string;
    solution: string;
  }[];
}

export const appFeatures: AppFeature[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    module: "home",
    status: "stable",
    shortDescription: "Trang tổng quan hiển thị thống kê đơn giao và hiệu suất.",
    userGuide: [
      "Mở Dashboard từ menu chính.",
      "Xem số đơn chờ, đang giao, đã giao và các biểu đồ hiệu suất.",
    ],
    keywords: ["dashboard", "thống kê", "bảng", "tổng quan"],
  },
  {
    id: "order_management",
    name: "Quản lý đơn giao",
    module: "orders",
    status: "stable",
    shortDescription: "Thêm, sửa, xóa và quản lý trạng thái đơn giao.",
    userGuide: [
      "Vào Orders → Nhấn 'Thêm đơn' để tạo đơn mới.",
      "Chỉnh sửa hoặc xóa đơn từ danh sách.",
      "Thay đổi trạng thái để theo dõi tiến độ giao.",
    ],
    keywords: ["đơn", "order", "thêm đơn", "quản lý đơn", "trạng thái"],
  },
  {
    id: "route_planner",
    name: "Lập tuyến đường",
    module: "route-planner",
    status: "stable",
    shortDescription: "Tạo tuyến giao hàng từ danh sách đơn với khả năng tối ưu và sắp thủ công.",
    userGuide: [
      "Mở Route Planner → Chọn các đơn muốn đưa vào tuyến.",
      "Chọn điểm xuất phát nếu cần và bấm 'Tối ưu' để sắp tự động.",
    ],
    keywords: ["lập tuyến", "route", "tối ưu", "sắp tuyến"],
  },
  {
    id: "manual_reorder",
    name: "Sắp xếp thủ công",
    module: "route-planner",
    status: "stable",
    shortDescription: "Sắp xếp thứ tự giao bằng thao tác kéo thả hoặc nút lên/xuống.",
    userGuide: ["Kéo thả các điểm trong Route Planner để thay đổi thứ tự giao."],
    keywords: ["kéo thả", "sắp xếp", "thứ tự"],
    relatedFeatures: ["route_planner"],
  },
  {
    id: "local_optimization",
    name: "Tối ưu tuyến local",
    module: "route-planner",
    status: "stable",
    shortDescription: "Thuật toán local để sắp xếp tuyến khi không có Distance Matrix API.",
    userGuide: ["Trong Route Planner, bấm 'Tối ưu' để sử dụng fallback local nếu không có API key."],
    keywords: ["tối ưu local", "fallback", "heuristic"],
    relatedFeatures: ["route_planner"],
  },
  {
    id: "map_view",
    name: "Bản đồ Google Maps",
    module: "map",
    status: "stable",
    shortDescription: "Hiển thị bản đồ và marker đơn giao (cần NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).",
    userGuide: [
      "Cấu hình NEXT_PUBLIC_GOOGLE_MAPS_API_KEY trong .env.local hoặc Environment Variables.",
      "Mở Map View để xem marker và vùng bản đồ của các đơn.",
    ],
    keywords: ["map", "google maps", "marker", "bản đồ"],
  },
  {
    id: "geocoding",
    name: "Geocoding (lấy tọa độ)",
    module: "geocoding",
    status: "stable",
    shortDescription: "Chuyển địa chỉ thành toạ độ lat/lng để hiển thị marker và tối ưu tuyến.",
    userGuide: ["Trong form đơn, dùng chức năng 'Lấy tọa độ' để chuyển địa chỉ thành lat/lng."],
    keywords: ["geocoding", "tọa độ", "lat", "lng"],
  },
  {
    id: "directions",
    name: "Directions (vẽ tuyến)",
    module: "directions",
    status: "stable",
    shortDescription: "Vẽ tuyến chi tiết trên bản đồ bằng Directions API (nếu có key).",
    userGuide: ["Tạo tuyến → Bấm 'Vẽ tuyến' để hiển thị đường đi trên bản đồ."],
    keywords: ["directions", "tuyến đường", "polyline"],
  },
  {
    id: "distance_matrix",
    name: "Distance Matrix (tối ưu khoảng cách)",
    module: "distance-matrix",
    status: "stable",
    shortDescription: "Sử dụng Distance Matrix API để tối ưu thứ tự điểm theo khoảng cách (nếu có key).",
    userGuide: ["Trong Route Planner, bấm 'Tối ưu' để sử dụng Distance Matrix khi có API key."],
    keywords: ["distance matrix", "tối ưu", "chiều dài"],
  },
  {
    id: "backup_json",
    name: "Backup JSON",
    module: "backup",
    status: "stable",
    shortDescription: "Export toàn bộ dữ liệu ra file JSON để sao lưu ngoài trình duyệt.",
    userGuide: ["Settings → Backup → Export JSON để tải file backup."],
    keywords: ["backup", "export json", "sao lưu"],
  },
  {
    id: "import_json",
    name: "Import Backup JSON",
    module: "backup",
    status: "stable",
    shortDescription: "Import file JSON đã export để khôi phục dữ liệu local.",
    userGuide: ["Settings → Backup → Import JSON → Chọn file backup và upload."],
    keywords: ["import", "khôi phục", "import json"],
  },
  {
    id: "export_csv",
    name: "Export CSV đơn giao",
    module: "export",
    status: "stable",
    shortDescription: "Xuất danh sách đơn giao ra file CSV.",
    userGuide: ["Reports hoặc Backup → Export CSV để tải danh sách đơn."],
    keywords: ["export csv", "csv", "xuất csv"],
  },
  {
    id: "pwa_offline",
    name: "Offline / PWA",
    module: "pwa",
    status: "stable",
    shortDescription: "Hỗ trợ PWA và hoạt động khi mất mạng cho các tính năng local.",
    userGuide: ["Cài app như PWA để dùng offline; khi offline, các API Google sẽ không hoạt động."],
    keywords: ["offline", "pwa", "service worker"],
  },
  {
    id: "settings_api_center",
    name: "Settings / API Center",
    module: "settings",
    status: "stable",
    shortDescription: "Quản lý API key, kiểm tra trạng thái và khuyến nghị bảo mật key.",
    userGuide: ["Mở Settings → API Center để xem trạng thái API key và hướng dẫn cấu hình."],
    keywords: ["settings", "api key", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
  },
  {
    id: "route_history",
    name: "Lịch sử tuyến",
    module: "history",
    status: "stable",
    shortDescription: "Xem lại các tuyến đã lưu cùng thống kê quãng đường và chi phí nếu có.",
    userGuide: ["Mở History → Chọn tuyến để xem chi tiết và snapshot chi phí."],
    keywords: ["lịch sử", "history", "tuyến"],
  },
  {
    id: "operating_cost",
    name: "Chi phí vận hành",
    module: "cost",
    status: "stable",
    shortDescription: "Tính ước lượng chi phí xăng, bảo trì và lợi nhuận tạm tính cho từng tuyến.",
    userGuide: ["Trong Route Planner, xem mục Chi phí ước tính để kiểm tra chi phí và lợi nhuận."],
    keywords: ["chi phí", "xăng", "lợi nhuận"],
  },
  {
    id: "frequent_customers",
    name: "Khách hàng thường xuyên",
    module: "customers",
    status: "stable",
    shortDescription: "Lưu và tái sử dụng thông tin khách hàng thường xuyên khi tạo đơn.",
    userGuide: ["Mở Customers → Thêm khách → Sử dụng khi tạo đơn mới."],
    keywords: ["khách hàng", "customer", "thường xuyên"],
  },
  {
    id: "smart_suggestions",
    name: "Gợi ý thông minh (local)",
    module: "suggestions",
    status: "beta",
    shortDescription: "Gợi ý local/rule-based giúp phát hiện đơn ưu tiên, thiếu tọa độ hoặc vấn đề chi phí.",
    userGuide: ["Xem panel Gợi ý để nhận cảnh báo và mẹo xử lý đơn."],
    keywords: ["gợi ý", "suggestions", "smart"],
  },
  {
    id: "reports_advanced",
    name: "Báo cáo nâng cao",
    module: "reports",
    status: "stable",
    shortDescription: "Tổng hợp đơn, tuyến và chi phí theo khoảng thời gian, hỗ trợ export và in báo cáo.",
    userGuide: ["Mở Reports → Chọn bộ lọc → Export JSON/CSV hoặc in báo cáo."],
    keywords: ["báo cáo", "reports", "export", "in báo cáo"],
  },
  {
    id: "vercel_deploy",
    name: "Deploy Vercel",
    module: "deploy",
    status: "planned",
    shortDescription: "Hướng dẫn deploy project lên Vercel và cấu hình Environment Variable cho API key.",
    userGuide: ["Push repo lên GitHub → Import vào Vercel → Thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY trong Environment Variables → Deploy."],
    keywords: ["vercel", "deploy"],
  },
  {
    id: "api_key_security",
    name: "Bảo mật Google Maps API key",
    module: "security",
    status: "stable",
    shortDescription: "Hướng dẫn cấu hình HTTP referrers và API restrictions để bảo vệ API key.",
    userGuide: ["Vào Google Cloud Console → Credentials → Chọn API key → Thiết lập HTTP referrers và API restrictions."],
    keywords: ["bảo mật", "referrer", "restriction"],
  },
  {
    id: "ai_widget",
    name: "AI Help Widget",
    module: "assist",
    status: "beta",
    shortDescription: "Trợ lý local/rule-based hiển thị ở góc phải dưới, trả lời câu hỏi hướng dẫn sử dụng app.",
    userGuide: ["Click nút AI → Chọn câu hỏi gợi ý hoặc nhập câu hỏi → Xóa chat để reset history."],
    keywords: ["trợ lý", "ai", "help", "hướng dẫn"],
  },
  {
    id: "feature_registry",
    name: "Feature Registry / Help Registry",
    module: "assist",
    status: "new",
    shortDescription: "Registry trung tâm mô tả các tính năng để trợ lý và docs tự cập nhật nhanh khi thêm tính năng mới.",
    userGuide: ["Khi thêm tính năng mới, cập nhật file lib/appFeatureRegistry.ts để trợ lý biết về tính năng đó."],
    keywords: ["feature", "registry", "help", "feature registry"],
  },
  {
    id: "feature-development-workflow",
    name: "Quy trình thêm tính năng mới",
    module: "developer-workflow",
    status: "new",
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    shortDescription: "Quy trình chuẩn giúp thêm tính năng mới mà không quên cập nhật AI Help, backup, docs, navigation và kiểm tra build.",
    userGuide: [
      "Mở docs/FEATURE_DEVELOPMENT_WORKFLOW.md để xem quy trình tổng quát.",
      "Dùng docs/NEW_FEATURE_TEMPLATE.md để lên kế hoạch tính năng.",
      "Dùng docs/NEW_FEATURE_PROMPT_TEMPLATE.md khi muốn nhờ AI code editor build tính năng mới.",
      "Sau khi thêm tính năng, cập nhật lib/appFeatureRegistry.ts để AI Help Widget biết tính năng đó.",
      "Chạy npm.cmd run lint và npm.cmd run build trước khi kết thúc."
    ],
    keywords: [
      "thêm tính năng",
      "feature mới",
      "workflow",
      "quy trình",
      "cập nhật AI Help",
      "feature registry",
      "template"
    ],
    relatedFeatures: ["ai_widget", "feature_registry"],
    commonQuestions: [
      {
        question: "Khi thêm tính năng mới cần cập nhật gì?",
        answer: "Cần cập nhật code, localStorage nếu có, backup/import nếu có dữ liệu, navigation nếu có trang mới, docs nếu tính năng lớn và bắt buộc cập nhật lib/appFeatureRegistry.ts để AI Help biết tính năng mới."
      }
    ],
    troubleshooting: [
      {
        problem: "AI Help không biết tính năng mới",
        solution: "Kiểm tra đã thêm tính năng vào lib/appFeatureRegistry.ts chưa, đã thêm keywords phù hợp chưa và đã chạy lại app chưa."
      }
    ]
  },
];
