export interface HelpTopic {
  id: string;
  title: string;
  keywords: string[];
  synonyms: string[];
  summary: string;
  steps?: string[];
  relatedModules?: string[];
  suggestedFollowUps?: string[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "dashboard",
    title: "Dashboard / Trang chủ",
    keywords: ["dashboard", "trang chủ", "thống kê", "tuyến hôm nay", "tổng quan", "hành động nhanh"],
    synonyms: ["màn hình chính", "màn hình tổng quan", "nút bấm", "tuyến đường hôm nay", "số liệu", "biểu đồ"],
    summary: "Trang Dashboard (Trang chủ) là trung tâm điều khiển của ShipRoute AI, cung cấp cái nhìn toàn diện về hoạt động giao hàng trong ngày:\n\n• **Số liệu tổng quan**: Hiển thị tổng số đơn giao, số đơn chờ giao, đang giao, hoàn thành và thất bại.\n• **Biểu đồ hiệu suất**: Trực quan hóa quãng đường di chuyển, thời gian giao hàng và chi phí vận hành (nếu được thiết lập).\n• **Tuyến hôm nay**: Tóm tắt thông tin tuyến đường được lên kế hoạch cho ngày hiện tại (khoảng cách, số điểm dừng, tiến độ giao).\n• **Các nút hành động nhanh**:\n  - *Thêm đơn nhanh*: Nhập nhanh địa chỉ và thông tin đơn hàng bằng văn bản tự do.\n  - *Quản lý đơn*: Chuyển nhanh tới màn hình danh sách đơn hàng.\n  - *Lập tuyến mới*: Đi tới công cụ Route Planner để bắt đầu xếp tuyến.\n  - *Xem báo cáo*: Đi tới trang thống kê hiệu suất chi tiết.",
    steps: [
      "Truy cập vào trang chủ (Dashboard) từ menu điều hướng phía dưới.",
      "Theo dõi các chỉ số thống kê ở các thẻ (Stat Cards) phía trên để nắm được tiến độ giao hàng.",
      "Sử dụng các nút hành động nhanh để thực hiện các thao tác lập tuyến hoặc quản lý đơn hàng ngay lập tức."
    ],
    relatedModules: ["reports", "orders", "route_planner"],
    suggestedFollowUps: ["Cách thêm đơn nhanh?", "Cách lập tuyến mới?", "Tuyến hôm nay là gì?", "Biểu đồ hiệu suất xem thế nào?"]
  },
  {
    id: "orders",
    title: "Quản lý đơn giao",
    keywords: ["đơn giao", "thêm đơn", "nhập địa chỉ", "tọa độ", "sửa đơn", "xóa đơn", "trường thông tin"],
    synonyms: ["tạo đơn hàng", "nhập đơn hàng", "xóa đơn hàng", "chỉnh sửa đơn", "sai sót", "nhập tọa độ"],
    summary: "Mục Quản lý đơn giao giúp bạn quản lý toàn bộ danh sách các đơn hàng cần giao trên thiết bị local:\n\n• **Cách thêm đơn**: Vào trang Quản lý đơn hàng -> nhấn nút 'Thêm đơn' (hoặc icon +).\n• **Các trường thông tin bắt buộc**:\n  - *Địa chỉ*: Bắt buộc để hệ thống định vị tọa độ GPS và vẽ tuyến.\n  - *Tên khách hàng*: Bắt buộc để xác định người nhận.\n  - *Số điện thoại*: Bắt buộc để tài xế liên hệ khi giao hàng.\n• **Các trường thông tin tùy chọn**: Mức độ ưu tiên (Bình thường/Cao), Khung giờ hẹn giao, Ghi chú giao hàng, Tọa độ Lat/Lng (nếu muốn nhập thủ công).\n• **Cơ chế hoạt động của địa chỉ & tọa độ**: Khi nhập địa chỉ và lưu, hệ thống sẽ tự động gọi Google Geocoding API để chuyển địa chỉ dạng chữ thành tọa độ vĩ độ (Lat) và kinh độ (Lng) phục vụ việc vẽ bản đồ và tối ưu tuyến.\n• **Cách sửa/xóa đơn**: Nhấp vào nút sửa (icon bút chì) hoặc xóa (icon thùng rác) trên thẻ của từng đơn hàng.\n• **Sai sót thường gặp**: Nhập địa chỉ không cụ thể (như chỉ nhập 'Hà Nội' hoặc 'Quận 1') khiến Google không tìm được tọa độ chính xác; Quên lưu sau khi sửa.",
    steps: [
      "Vào trang Quản lý đơn (icon hộp đơn ở menu dưới).",
      "Bấm 'Thêm đơn', điền Địa chỉ, Tên khách, SĐT.",
      "Bấm 'Lấy tọa độ' để kiểm tra xem địa chỉ có định vị được trên bản đồ không.",
      "Bấm 'Lưu lại' để lưu đơn vào localStorage."
    ],
    relatedModules: ["route_planner", "customers", "geocoding"],
    suggestedFollowUps: ["Tọa độ GPS hoạt động thế nào?", "Lỗi không lấy được tọa độ?", "Cách thêm đơn nhanh bằng text?", "Sửa hoặc xóa đơn ở đâu?"]
  },
  {
    id: "route_planner",
    title: "Lập tuyến đường",
    keywords: ["lập tuyến", "route planner", "tối ưu tuyến", "google maps api", "offline fallback", "kết quả tuyến"],
    synonyms: ["tạo tuyến đường", "sắp xếp đơn", "tối ưu hóa", "chế độ ngoại tuyến", "đọc kết quả", "sắp thủ công"],
    summary: "Tính năng Lập tuyến đường (Route Planner) là công cụ cốt lõi giúp bạn sắp xếp thứ tự giao hàng tối ưu nhất:\n\n• **Cách tạo tuyến**: Vào Route Planner -> Chọn các đơn hàng cần giao bằng cách tích vào checkbox -> Chọn điểm xuất phát/kết thúc -> Bấm 'Tối ưu'.\n• **Cách tối ưu hoạt động**:\n  - *Khi có Google Maps API*: Hệ thống gửi yêu cầu tới Distance Matrix API để lấy thời gian/quãng đường thực tế đi qua các tuyến đường giao thông, từ đó sắp xếp thứ tự các điểm dừng sao cho tổng quãng đường/thời gian ngắn nhất.\n  - *Khi offline/fallback*: Hệ thống dùng thuật toán local (Nearest Neighbor - Láng giềng gần nhất) tính theo đường chi bay giữa các tọa độ đơn hàng. Vẫn lập được tuyến nhưng không có khoảng cách thực tế trên đường bộ.\n• **Đọc kết quả tuyến**: Tuyến đường sau khi lập hiển thị:\n  - Thứ tự giao chi tiết (Điểm 1 -> Điểm 2 -> ...).\n  - Tổng quãng đường (km), Tổng thời gian dự kiến.\n  - Chi phí vận hành ước tính (xăng xe, hao mòn) và lợi nhuận tạm tính.\n  - Bản đồ vẽ polyline đường đi thực tế (Directions API).",
    steps: [
      "Truy cập mục Lập tuyến từ menu chính.",
      "Tích chọn các đơn muốn giao hôm nay từ danh sách đơn chưa lập tuyến.",
      "Nhập điểm xuất phát (ví dụ: kho hàng hoặc nhà riêng) và điểm kết thúc.",
      "Bấm nút 'Tối ưu hóa tuyến đường' để hệ thống tự động sắp xếp hoặc tự kéo thả để sắp xếp thủ công.",
      "Bấm 'Lưu tuyến' để ghi nhận vào lịch sử và bắt đầu đi giao."
    ],
    relatedModules: ["google_maps", "history", "operating_cost"],
    suggestedFollowUps: ["Tối ưu tuyến local là gì?", "Vì sao không tính được tuyến?", "Cách sắp xếp thủ công?", "Cách tính chi phí vận hành?"]
  },
  {
    id: "google_maps",
    title: "Cấu hình Google Maps",
    keywords: ["google maps api key", "env local", "maps javascript api", "geocoding api", "directions api", "distance matrix api", "bảo mật api key", "chưa cấu hình"],
    synonyms: ["api key nằm ở đâu", "cấu hình bản đồ", "lấy khóa api", "không hiện bản đồ", "lộ api key", "gcp console"],
    summary: "Google Maps API cung cấp bản đồ và các thuật toán tính toán đường đi thực tế cho ứng dụng:\n\n• **Cách cấu hình**: Tạo file `.env.local` tại thư mục gốc dự án và khai báo biến:\n  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=khóa_api_của_bạn`\n  Sau đó khởi động lại máy chủ phát triển (dev server) để áp dụng.\n• **4 API bắt buộc phải bật trên Google Cloud Console (GCP)**:\n  1. *Maps JavaScript API*: Hiển thị bản đồ tương tác.\n  2. *Geocoding API*: Chuyển địa chỉ chữ thành tọa độ GPS.\n  3. *Directions API*: Tìm đường và vẽ tuyến đường (polyline) trên bản đồ.\n  4. *Distance Matrix API*: Tính toán bảng khoảng cách/thời gian phục vụ thuật toán tối ưu.\n• **Bảo mật API Key**: Google Maps API Key chạy ở client nên rất dễ bị lộ nếu không bảo mật. Bạn BẮT BUỘC phải vào GCP để:\n  - Thiết lập *Application Restrictions*: Chỉ cho phép các HTTP Referrer từ `http://localhost:3000/*` và domain Vercel của bạn.\n  - Thiết lập *API Restrictions*: Chỉ cho phép Key này gọi đúng 4 API nêu trên.\n  - Tuyệt đối không commit file `.env.local` lên GitHub.",
    steps: [
      "Truy cập Google Cloud Console và tạo một dự án (Project).",
      "Vào mục Credentials tạo một API Key mới.",
      "Vào Library và bật đủ 4 API: Maps JS, Geocoding, Directions, Distance Matrix.",
      "Thêm API Key vào file `.env.local` của dự án.",
      "Vào mục Credentials thiết lập giới hạn HTTP Referrer để bảo mật key."
    ],
    relatedModules: ["settings", "troubleshooting"],
    suggestedFollowUps: ["Tại sao bản đồ không hiển thị?", "Lỗi RefererNotAllowedMapError?", "Ứng dụng có dùng thử miễn phí không?", "Lỗi Geocoding thất bại?"]
  },
  {
    id: "backup",
    title: "Backup & Dữ liệu Local",
    keywords: ["localstorage", "indexeddb", "sao lưu", "export json", "import json", "mất dữ liệu", "xóa cache"],
    synonyms: ["dữ liệu lưu ở đâu", "chuyển thiết bị", "lưu trữ cục bộ", "xóa dữ liệu", "khôi phục dữ liệu", "cách backup"],
    summary: "ShipRoute AI được thiết kế theo mô hình local-first, tức là dữ liệu của bạn được bảo mật tuyệt đối trên thiết bị của bạn:\n\n• **localStorage & IndexedDB**: Đây là các công nghệ lưu trữ dữ liệu trực tiếp trong trình duyệt web của bạn. Ứng dụng không sử dụng bất kỳ máy chủ nào để lưu đơn hàng, lịch sử hay API key của bạn.\n• **Rủi ro mất dữ liệu**: Vì dữ liệu nằm hoàn toàn ở trình duyệt, dữ liệu sẽ bị XÓA SẠCH nếu bạn xóa lịch sử duyệt web (Clear browsing data/cache/cookies), cài đặt lại trình duyệt, dùng chế độ ẩn danh, hoặc thay đổi thiết bị.\n• **Giải pháp sao lưu (Backup)**: Bạn nên backup dữ liệu định kỳ bằng cách vào **Cài đặt (Settings) -> Backup dữ liệu -> Export JSON** để tải file backup về máy.\n• **Khi đổi thiết bị/trình duyệt**: Thực hiện Export JSON trên máy cũ, gửi file đó sang máy mới, sau đó vào trang Cài đặt của máy mới chọn **Import JSON** để khôi phục toàn bộ đơn hàng, lịch sử và cấu hình.",
    steps: [
      "Mở mục Cài đặt (Settings) từ menu dưới.",
      "Chọn mục 'Backup dữ liệu'.",
      "Bấm 'Export JSON' để tải file dự phòng về bộ nhớ máy.",
      "Để khôi phục, bấm 'Import JSON', chọn file `.json` đã lưu trước đó và xác nhận."
    ],
    relatedModules: ["settings", "reports", "localstorage"],
    suggestedFollowUps: ["Dữ liệu lưu ở đâu?", "Mất dữ liệu thì sao?", "Cách khôi phục dữ liệu?", "Có tự động đồng bộ Cloud không?"]
  },
  {
    id: "reports",
    title: "Báo cáo & Hiệu suất",
    keywords: ["báo cáo", "hiệu suất", "chi phí vận hành", "biểu đồ", "trạng thái trống", "export csv"],
    synonyms: ["xem thống kê", "xem doanh thu", "lợi nhuận xe", "chưa có dữ liệu", "in báo cáo", "xuất báo cáo"],
    summary: "Mục Báo cáo nâng cao cung cấp cái nhìn chi tiết về hiệu quả giao hàng và tài chính của tài xế:\n\n• **Báo cáo hiệu suất giao hàng**: Theo dõi tỷ lệ đơn giao thành công, đang giao, thất bại theo từng khoảng thời gian (hôm nay, tuần này, tháng này).\n• **Thống kê quãng đường & chi phí**: Tính tổng số km đã đi, tổng thời gian di chuyển, chi phí xăng xe và chi phí khấu hao dựa trên cấu hình giá xăng/km trong cài đặt. Từ đó ước tính được thực tế lợi nhuận thu về.\n• **Trạng thái trống (Empty State)**: Nếu bạn chưa có dữ liệu đơn hàng hoặc chưa lưu tuyến đường nào trong khoảng thời gian lọc, trang báo cáo sẽ hiển thị thông báo trống kèm nút 'Thêm đơn giao ngay' để bạn bắt đầu.\n• **Xuất báo cáo & In**: Bạn có thể xuất thống kê ra file CSV, JSON hoặc nhấn nút 'In báo cáo' để mở giao diện in ấn chuyên nghiệp (hoặc lưu file PDF).",
    steps: [
      "Vào trang Báo cáo (icon Biểu đồ ở menu dưới).",
      "Lựa chọn khoảng thời gian lọc dữ liệu ở bộ lọc phía trên.",
      "Xem các số liệu tổng hợp và biểu đồ trực quan.",
      "Nhấp nút 'Xuất CSV' hoặc 'In báo cáo' để lưu trữ hoặc chia sẻ."
    ],
    relatedModules: ["backup", "dashboard", "history"],
    suggestedFollowUps: ["Làm sao tính chi phí xăng xe?", "Xuất file CSV báo cáo ở đâu?", "Lỗi báo cáo không có dữ liệu?", "Xem lịch sử tuyến thế nào?"]
  },
  {
    id: "history",
    title: "Lịch sử tuyến đường",
    keywords: ["lịch sử tuyến", "history", "xem lại tuyến", "lưu tuyến", "snapshot chi phí"],
    synonyms: ["tuyến đường đã đi", "lịch sử giao hàng", "tìm tuyến cũ", "chi tiết tuyến đã lưu"],
    summary: "Trang Lịch sử tuyến giúp bạn lưu trữ và xem lại hành trình của những ngày giao hàng trước:\n\n• **Lịch sử tuyến là gì**: Sau khi lập tuyến trong Route Planner và bấm 'Lưu tuyến' hoặc hoàn thành giao hàng, hệ thống sẽ chụp lại (snapshot) toàn bộ thông tin tuyến đường tại thời điểm đó.\n• **Xem lại tuyến cũ**: Bạn có thể vào mục Lịch sử để xem danh sách tuyến đã đi, click vào từng tuyến để xem bản đồ hành trình, thứ tự giao và chi tiết các đơn hàng đi kèm.\n• **Thống kê snapshot**: Lưu lại tổng quãng đường thực tế, thời gian di chuyển dự kiến, và cấu hình chi phí xăng xe tại thời điểm lập tuyến đó để báo cáo tài chính cuối tháng luôn chính xác.",
    steps: [
      "Chọn mục Lịch sử (icon đồng hồ cát / lịch sử ở menu dưới).",
      "Cuộn xem danh sách các tuyến đường được lưu sắp xếp theo thời gian gần nhất.",
      "Nhấp vào một tuyến đường bất kỳ để xem chi tiết danh sách điểm giao và bản đồ tương ứng."
    ],
    relatedModules: ["route_planner", "reports"],
    suggestedFollowUps: ["Lập tuyến như thế nào?", "Lịch sử lưu được bao nhiêu tuyến?", "Xóa lịch sử tuyến làm sao?", "Dữ liệu lịch sử lưu ở đâu?"]
  },
  {
    id: "settings",
    title: "Cài đặt & Trạng thái hệ thống",
    keywords: ["cài đặt", "trạng thái hệ thống", "api status", "service worker", "cài đặt pwa", "an toàn api key"],
    synonyms: ["cấu hình app", "hệ thống khỏe không", "cài đặt ứng dụng", "pwa là gì", "kiểm tra sức khỏe app"],
    summary: "Trang Cài đặt (Settings) là nơi quản lý cấu hình và kiểm tra sức khỏe hoạt động của toàn bộ ứng dụng ShipRoute AI:\n\n• **Trạng thái hệ thống (System Status)**: Hiển thị tình trạng của bộ nhớ localStorage, IndexedDB, trình duyệt hỗ trợ Geolocation không.\n• **Trạng thái API (API Status)**: Kiểm tra xem API Key Google Maps đã được cấu hình hay chưa.\n• **Trạng thái Service Worker**: Cho biết Service Worker đã kích hoạt chưa (quan trọng để chạy offline và cài PWA).\n• **Cài đặt PWA (Progressive Web App)**: Ứng dụng hỗ trợ cài đặt thẳng lên màn hình chính điện thoại/máy tính của bạn mà không cần qua App Store hay CH Play. Bạn có thể sử dụng mượt mà như app gốc.\n• **Thiết lập chi phí vận hành**: Điền định mức xăng (lít/100km), giá xăng hiện tại, và chi phí khấu hao cố định trên km để hệ thống tự động tính toán tài chính.",
    steps: [
      "Truy cập trang Cài đặt (icon bánh răng ở góc dưới phải).",
      "Xem bảng điều khiển 'Sức khỏe hệ thống' (System Health Check) ở trên cùng.",
      "Nhập giá trị cấu hình chi phí xăng xe nếu muốn hệ thống tính toán chi phí vận hành.",
      "Kiểm tra hướng dẫn cài đặt PWA nếu muốn cài app lên điện thoại."
    ],
    relatedModules: ["google_maps", "backup", "troubleshooting"],
    suggestedFollowUps: ["Làm sao cài app PWA?", "Service worker là gì?", "Cách cấu hình API key?", "Backup dữ liệu ở đâu?"]
  },
  {
    id: "troubleshooting",
    title: "Khắc phục sự cố",
    keywords: ["lỗi", "màn hình trắng", "bản đồ không hiện", "api lỗi", "không tính được tuyến", "mất đơn hàng", "offline", "lỗi dev"],
    synonyms: ["sự cố", "lỗi mất mạng", "lỗi tọa độ", "mất hết đơn", "app bị treo", "lỗi không hiện map"],
    summary: "Dưới đây là các sự cố thường gặp khi sử dụng ShipRoute AI và cách tự khắc phục nhanh chóng:\n\n• **Ứng dụng hiển thị màn hình trắng**: Do xung đột cache hoặc lỗi JavaScript. Hãy nhấn `Ctrl + F5` để reload cứng, hoặc vào cài đặt trình duyệt xóa cache của trang web.\n• **Bản đồ không hiển thị**: Hãy kiểm tra kết nối Internet. Nếu có mạng mà vẫn không hiện, mở F12 Console kiểm tra lỗi. Nguyên nhân phổ biến nhất là lỗi `RefererNotAllowedMapError` do bạn giới hạn HTTP Referrer sai trên Google Cloud Console.\n• **Không lấy được tọa độ (Coordinates missing)**: Do địa chỉ quá chung chung hoặc chưa cấu hình Geocoding API. Hãy chỉnh sửa đơn hàng, nhập địa chỉ chi tiết hơn (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành) rồi bấm lại 'Lấy tọa độ'.\n• **Lỗi không tính được tuyến đường**: Đảm bảo tất cả đơn hàng đã chọn đều có tọa độ GPS hợp lệ (vĩ độ/kinh độ không bị trống). Nếu có đơn chưa có tọa độ, hệ thống sẽ báo lỗi không lập được tuyến.\n• **Đơn hàng tự dưng biến mất**: Do trình duyệt bị xóa cache local hoặc bạn đang sử dụng trình duyệt/thiết bị khác. Hãy Import file JSON backup gần nhất để khôi phục.",
    steps: [
      "Nhấn nút F12 trên máy tính, chọn tab 'Console' để xem thông điệp lỗi màu đỏ từ trình duyệt.",
      "Truy cập Settings -> API Center để xem trạng thái cấu hình API key.",
      "Hãy luôn xuất file Backup JSON định kỳ trước khi thực hiện xóa cache hoặc cập nhật hệ điều hành thiết bị."
    ],
    relatedModules: ["settings", "google_maps", "backup"],
    suggestedFollowUps: ["Lỗi RefererNotAllowedMapError?", "Mất kết nối mạng có dùng được không?", "Cách backup dữ liệu?", "Vì sao không lấy được tọa độ?"]
  },

  // Keep other specific guidelines to enrich search matching
  {
    id: "user_guide",
    title: "Hướng dẫn sử dụng",
    keywords: ["hướng dẫn", "user guide", "bắt đầu", "cách dùng", "giới thiệu"],
    synonyms: ["tai lieu", "cac buoc", "lam the nao", "bat dau su dung"],
    summary: "Tổng quan các bước sử dụng app ShipRoute từ tạo đơn, lập tuyến, backup, xem báo cáo.",
    steps: [
      "Đăng nhập hoặc mở app.",
      "Tạo đơn giao mới.",
      "Lập tuyến đường giao hàng.",
      "Theo dõi trạng thái và backup dữ liệu định kỳ."
    ],
    relatedModules: ["dashboard", "orders", "route_planner", "backup"],
    suggestedFollowUps: ["Cách thêm đơn giao?", "Lập tuyến như thế nào?"]
  },
  {
    id: "privacy",
    title: "Bảo mật & Quyền riêng tư",
    keywords: ["bảo mật", "quyền riêng tư", "privacy", "dữ liệu cá nhân"],
    synonyms: ["mat khau", "lo thong tin", "bao ve du lieu", "safety"],
    summary: "App chỉ lưu dữ liệu trên trình duyệt của bạn, không gửi lên server. Có thể backup/restore thủ công.",
    steps: [
      "Dữ liệu đơn, tuyến, khách hàng chỉ lưu localStorage.",
      "Có thể export/import dữ liệu qua JSON/CSV.",
      "Không chia sẻ dữ liệu nếu không backup/export."
    ],
    relatedModules: ["backup", "settings"],
    suggestedFollowUps: ["Dữ liệu lưu ở đâu?", "Lộ API key thì sao?"]
  },
  {
    id: "accessibility",
    title: "Trợ năng & Phản hồi",
    keywords: ["trợ năng", "accessibility", "phản hồi", "a11y", "hỗ trợ"],
    synonyms: ["phim tat", "doc man hinh", "responsive"],
    summary: "App hỗ trợ phím tắt, tab navigation, màu sắc tương phản và có thể dùng trên thiết bị di động.",
    steps: [
      "Dùng phím Tab để di chuyển giữa các trường.",
      "Các nút có aria-label, hỗ trợ đọc màn hình.",
      "Giao diện responsive cho mobile/tablet."
    ],
    relatedModules: ["settings"],
    suggestedFollowUps: ["Cách dùng phím tắt?"]
  },
  {
    id: "geocoding_detail",
    title: "Lấy tọa độ (Geocoding)",
    keywords: ["geocoding", "tọa độ", "địa chỉ", "lat", "lng"],
    synonyms: ["lay toa do", "chuyen dia chi", "gps latitude longitude"],
    summary: "Chuyển địa chỉ thành toạ độ (lat/lng) để hiển thị marker và tối ưu tuyến. Cần bật Geocoding API và key.",
    steps: [
      "Trên form tạo/sửa đơn, nhập địa chỉ đầy đủ.",
      "Sử dụng chức năng 'Lấy tọa độ' để gọi Geocoding (cần API key và mạng)."
    ],
    relatedModules: ["google_maps", "orders"],
    suggestedFollowUps: ["Lỗi Geocoding thất bại?", "Vì sao cần tọa độ?"]
  },
  {
    id: "directions_detail",
    title: "Vẽ tuyến (Directions)",
    keywords: ["directions", "vẽ tuyến", "tuyến đường", "polyline"],
    synonyms: ["duong di tren ban do", "ve line"],
    summary: "Vẽ tuyến chi tiết trên bản đồ bằng Directions API. Cần key và Maps JS để hiển thị.",
    steps: [
      "Tạo tuyến trong Route Planner.",
      "Bấm 'Vẽ tuyến' để gọi Directions và hiển thị polyline trên bản đồ."
    ],
    relatedModules: ["google_maps", "route_planner"],
    suggestedFollowUps: ["Tại sao không vẽ được tuyến?", "Bản đồ không hiển thị?"]
  },
  {
    id: "distance_matrix_detail",
    title: "Tối ưu tuyến (Distance Matrix)",
    keywords: ["distance matrix", "tối ưu", "tối ưu tuyến", "độ dài"],
    synonyms: ["ma tran khoang cach", "tinh khoang cach thuc te"],
    summary: "Dùng Distance Matrix API để tối ưu thứ tự điểm theo khoảng cách nếu có API key; có fallback rule-based khi offline.",
    steps: [
      "Trong Route Planner, bấm 'Tối ưu'.",
      "Nếu có API key, app sẽ dùng Distance Matrix để tính chi phí/quãng đường giữa các điểm.",
      "Nếu không có key hoặc offline, app dùng thuật toán local đơn giản để sắp xếp."
    ],
    relatedModules: ["route_planner", "google_maps"],
    suggestedFollowUps: ["Tối ưu tuyến local là gì?", "Cấu hình Distance Matrix thế nào?"]
  },
  {
    id: "operating_cost",
    title: "Chi phí vận hành",
    keywords: ["chi phí", "xăng", "phí vận hành", "lợi nhuận"],
    synonyms: ["tinh tien xang", "tieu hao", "doanh thu tinh lam sao"],
    summary: "Tính ước lượng chi phí xăng, bảo trì, chi phí khác và lợi nhuận ước tính theo tuyến.",
    steps: [
      "Mở Route Planner hoặc Route Cost Summary để xem ước tính chi phí dựa trên tổng km và cài đặt chi phí."
    ],
    relatedModules: ["route_planner", "settings"],
    suggestedFollowUps: ["Cài đặt giá xăng ở đâu?", "Xem chi tiết chi phí?"]
  },
  {
    id: "customers",
    title: "Khách hàng thường xuyên",
    keywords: ["khách hàng", "customer", "thường xuyên"],
    synonyms: ["khach ruot", "danh sach khach", "luu sdt khach"],
    summary: "Lưu danh sách khách hàng để tái sử dụng khi tạo đơn, giúp tiết kiệm thời gian nhập liệu.",
    steps: [
      "Mở Customers -> Thêm khách thường xuyên -> Sử dụng khi tạo đơn mới."
    ],
    relatedModules: ["orders"],
    suggestedFollowUps: ["Thêm khách hàng như thế nào?", "Tự điền sdt khách?"]
  },
  {
    id: "api_key_security",
    title: "Bảo mật API key",
    keywords: ["bảo mật", "restriction", "referrer", "restrict"],
    synonyms: ["lo khoa api", "gioi han khoa", "bao ve api"],
    summary: "Hướng dẫn cấu hình HTTP referrers và API restrictions trên Google Cloud để bảo vệ API key.",
    steps: [
      "Vào Google Cloud Console -> APIs & Services -> Credentials -> Chọn API key.",
      "Chọn Application restrictions -> HTTP referrers và thêm localhost + domain Vercel.",
      "Chọn API restrictions -> chỉ cho phép Maps/Geocoding/Directions/Distance Matrix."
    ],
    relatedModules: ["settings", "google_maps"],
    suggestedFollowUps: ["Tại sao cần bảo mật API key?", "Lỗi RefererNotAllowedMapError?"]
  },
  {
    id: "vercel_deploy",
    title: "Deploy lên Vercel",
    keywords: ["vercel", "deploy", "push", "github"],
    synonyms: ["dua web len mang", "publish online", "dua len vercel"],
    summary: "Hướng dẫn nhanh deploy project lên Vercel và cấu hình Environment Variable cho API key.",
    steps: [
      "Push mã nguồn sạch lên GitHub (không include .env.local).",
      "Import repository vào Vercel -> Chọn Next.js -> Thêm biến NEXT_PUBLIC_GOOGLE_MAPS_API_KEY vào Environment Variables.",
      "Deploy và kiểm tra trang. Nếu cần, cấu hình domain và API key restrictions."
    ],
    relatedModules: ["settings", "google_maps"],
    suggestedFollowUps: ["Cấu hình biến môi trường trên Vercel?", "Referrer cho domain Vercel?"]
  },
  {
    id: "localstorage_detail",
    title: "localStorage & mất dữ liệu",
    keywords: ["localstorage", "mất dữ liệu", "backup", "khôi phục"],
    synonyms: ["xoa lich su", "luu tren trinh duyet", "incognito"],
    summary: "Giải thích về rủi ro khi dùng localStorage: dữ liệu chỉ trên trình duyệt hiện tại, nên backup định kỳ.",
    steps: [
      "Luôn export JSON trước khi chuyển máy hoặc xóa cache.",
      "Sử dụng tính năng Backup để lưu bản sao ngoài trình duyệt."
    ],
    relatedModules: ["backup", "settings"],
    suggestedFollowUps: ["Cách backup dữ liệu?", "Có mất đơn khi đóng tab không?"]
  },
  {
    id: "ai_widget",
    title: "Trợ lý ShipRoute AI (local)",
    keywords: ["trợ lý", "ai", "help", "hướng dẫn"],
    synonyms: ["chat bot", "tro ly local", "hoi dap"],
    summary: "Trợ lý hiện là rule-based chạy local, trả lời các câu hỏi hướng dẫn sử dụng app, không gọi API AI bên ngoài.",
    steps: [
      "Mở nút Trợ lý góc phải dưới để xem các câu hỏi gợi ý.",
      "Chọn câu hỏi gợi ý hoặc nhập câu hỏi vào ô và nhấn Gửi.",
      "Sử dụng Xóa chat để reset lịch sử chat trợ lý."
    ],
    relatedModules: ["settings"],
    suggestedFollowUps: ["Cách xóa chat?", "Trợ lý có dùng internet không?"]
  }
];
