export interface HelpTopic {
  id: string;
  title: string;
  keywords: string[];
  synonyms: string[];
  summary: string;
  steps?: string[];
  notes?: string[];
  problems?: string[];
  relatedModules?: string[];
  suggestedFollowUps?: string[];
  relatedRoute?: string;
  relatedRouteName?: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "dashboard",
    title: "Dashboard / Trang chủ",
    keywords: ["dashboard", "trang chủ", "thống kê", "tuyến hôm nay", "tổng quan", "hành động nhanh", "biểu đồ"],
    synonyms: ["màn hình chính", "màn hình tổng quan", "nút bấm", "tuyến đường hôm nay", "số liệu", "biểu đồ hiệu suất"],
    summary: "Trang Dashboard (Trang chủ) là trung tâm điều khiển của ShipRoute AI, cung cấp cái nhìn toàn diện về hoạt động giao hàng trong ngày bao gồm các thống kê đơn hàng, biểu đồ hiệu suất di chuyển và tóm tắt tuyến đường giao trong ngày.",
    steps: [
      "Truy cập vào trang chủ (Dashboard) từ menu điều hướng phía dưới cùng của ứng dụng.",
      "Theo dõi các chỉ số thống kê ở các thẻ (Stat Cards) phía trên để nắm được tiến độ giao hàng nhanh chóng (Đơn chờ, đã giao, thất bại).",
      "Xem biểu đồ hiệu suất phía dưới để đánh giá quãng đường di chuyển và chi phí tương ứng.",
      "Sử dụng các nút hành động nhanh để thêm đơn nhanh hoặc đi thẳng tới trang lập tuyến mới."
    ],
    notes: [
      "Biểu đồ hiệu suất và chi phí vận hành sẽ tự động đồng bộ khi bạn cập nhật cài đặt giá xăng xe và lưu các tuyến đường mới vào lịch sử."
    ],
    relatedModules: ["reports", "orders", "route_planner"],
    suggestedFollowUps: ["Cách lập tuyến mới?", "Tuyến hôm nay là gì?", "Cách xem biểu đồ hiệu suất?", "Cách thêm đơn nhanh bằng text?"],
    relatedRoute: "/home",
    relatedRouteName: "Trang chủ"
  },
  {
    id: "today_route",
    title: "Tuyến hôm nay",
    keywords: ["tuyến hôm nay", "hành trình hôm nay", "lịch trình", "điểm giao hôm nay", "tuyến đường hiện tại"],
    synonyms: ["xem tuyến đang đi", "lộ trình ngày", "danh sách điểm giao hôm nay", "tiến độ tuyến"],
    summary: "Tính năng này giúp bạn theo dõi chi tiết tuyến đường giao hàng được lên lịch cho ngày hôm nay trực tiếp trên Dashboard, giúp kiểm soát hành trình di chuyển và cập nhật trạng thái đơn một cách nhanh nhất.",
    steps: [
      "Tại trang chủ Dashboard, cuộn xuống phần thẻ 'Tuyến hôm nay'.",
      "Xem nhanh thông số tổng quãng đường (km), số điểm dừng chân và tiến độ phần trăm hoàn thành.",
      "Bạn có thể nhấp trực tiếp vào danh sách điểm giao hoặc bấm nút xem chi tiết bản đồ để mở lộ trình di chuyển."
    ],
    relatedModules: ["dashboard", "route_planner", "history"],
    suggestedFollowUps: ["Lập tuyến đường thế nào?", "Tối ưu tuyến là gì?", "Xem lịch sử tuyến ở đâu?"],
    relatedRoute: "/home",
    relatedRouteName: "Trang chủ"
  },
  {
    id: "orders",
    title: "Quản lý đơn giao",
    keywords: ["đơn giao", "thêm đơn", "nhập địa chỉ", "tọa độ", "sửa đơn", "xóa đơn", "trường thông tin", "cách thêm đơn giao", "cách sửa đơn giao", "cách xóa đơn giao", "cách tìm đơn giao", "cách lọc đơn chưa giao"],
    synonyms: ["tạo đơn hàng", "nhập đơn hàng", "xóa đơn hàng", "chỉnh sửa đơn", "sai sót", "nhập tọa độ", "tim don giao", "loc don chua giao", "them don giao", "sua don giao", "xoa don giao"],
    summary: "Mục Quản lý đơn giao giúp bạn quản lý toàn bộ danh sách các đơn hàng cần giao trên thiết bị của mình. Tại đây bạn có thể thêm đơn mới, chỉnh sửa thông tin hoặc xóa đơn hàng khi có thay đổi.",
    steps: [
      "Cách thêm đơn giao: Vào trang Đơn giao, bấm nút 'Thêm đơn' (hoặc icon +) ở góc trên bên phải để mở Form. Điền đầy đủ thông tin (Tên khách hàng, SĐT, Địa chỉ, Khung giờ giao, Ghi chú), tích chọn lưu vào danh sách khách hàng thường xuyên, bấm 'Thêm đơn'.",
      "Cách sửa đơn giao: Bấm nút 'Sửa' bên cạnh đơn hàng (hoặc trong bảng trên desktop) để mở Form chỉnh sửa, thay đổi thông tin cần thiết rồi nhấn 'Cập nhật'.",
      "Cách xóa đơn giao: Bấm nút 'Xóa' màu đỏ bên cạnh đơn hàng tương ứng và bấm xác nhận đồng ý.",
      "Cách tìm đơn giao: Sử dụng thanh tìm kiếm 'Tìm theo tên, địa chỉ, SĐT...' ở đầu trang Đơn giao.",
      "Cách lọc đơn chưa giao: Nhấp chọn các tab bộ lọc trạng thái phía trên danh sách đơn (như 'Chờ giao', 'Sẵn sàng', 'Đã xếp tuyến') hoặc lọc theo tọa độ bằng cách chọn 'Đơn thiếu tọa độ GPS'."
    ],
    notes: [
      "Hệ thống yêu cầu các thông tin như Địa chỉ, Tên khách hàng và SĐT phải chính xác để tài xế dễ dàng liên lạc khi đi giao hàng.",
      "Thông tin tọa độ Lat/Lng là bắt buộc để hệ thống có thể vẽ đường đi và tính toán tối ưu tuyến trên bản đồ."
    ],
    problems: [
      "Lỗi không lấy được tọa độ (báo đỏ hoặc trống): Hãy kiểm tra xem địa chỉ nhập vào đã đủ chi tiết chưa (nên nhập đủ số nhà, tên đường, phường, quận, thành phố). Đồng thời hãy kiểm tra lại kết nối mạng và cấu hình API Key Google Geocoding trong phần Cài đặt."
    ],
    relatedModules: ["route_planner", "customers", "geocoding"],
    suggestedFollowUps: ["Cách thêm đơn giao?", "Cách sửa đơn giao?", "Cách xóa đơn giao?", "Cách tìm đơn giao?", "Cách lọc đơn chưa giao?"],
    relatedRoute: "/orders",
    relatedRouteName: "Quản lý đơn giao"
  },
  {
    id: "new_route",
    title: "Tạo tuyến mới / Lập tuyến",
    keywords: ["lập tuyến", "route planner", "tạo tuyến", "sắp xếp đơn", "chọn đơn", "điểm xuất phát", "điểm kết thúc"],
    synonyms: ["tạo lộ trình mới", "thiết lập tuyến giao", "chọn điểm đi", "chọn điểm về", "xếp đơn giao"],
    summary: "Tính năng Lập tuyến đường (Route Planner) là công cụ cốt lõi giúp bạn chọn các đơn hàng chưa giao và xếp chúng thành một lộ trình di chuyển tối ưu nhất.",
    steps: [
      "Truy cập mục Lập tuyến từ menu chính ở phía dưới.",
      "Tích chọn các đơn hàng bạn muốn giao hôm nay từ danh sách các đơn hàng chưa lập tuyến.",
      "Nhập địa chỉ Điểm xuất phát (ví dụ: kho lấy hàng, cửa hàng hoặc nhà riêng) và Điểm kết thúc hành trình.",
      "Bấm nút 'Tối ưu hóa tuyến đường' để thuật toán tự động sắp xếp thứ tự giao ngắn nhất, hoặc kéo thả các thẻ đơn hàng để sắp xếp thứ tự hoàn toàn thủ công theo kinh nghiệm.",
      "Nhấp 'Lưu tuyến' để lưu lộ trình này vào lịch sử và bắt đầu hành trình đi giao."
    ],
    notes: [
      "Bạn có thể thay đổi điểm xuất phát/kết thúc tùy ý. Nếu để trống điểm kết thúc, hệ thống sẽ hiểu hành trình kết thúc tại điểm giao cuối cùng."
    ],
    problems: [
      "Vì sao không tính được tuyến: Đảm bảo toàn bộ các đơn hàng bạn đã tích chọn đều đã được lấy tọa độ Lat/Lng hợp lệ. Nếu có đơn hàng thiếu tọa độ, hệ thống sẽ không thể vẽ đường đi và báo lỗi."
    ],
    relatedModules: ["route_planner", "google_maps", "operating_cost"],
    suggestedFollowUps: ["Tối ưu tuyến là gì?", "Vì sao không tính được tuyến?", "Cách sắp xếp thủ công?", "Làm sao tính chi phí vận hành?"],
    relatedRoute: "/route-planner",
    relatedRouteName: "Lập tuyến đường"
  },
  {
    id: "route_optimization",
    title: "Tối ưu hóa tuyến đường",
    keywords: ["tối ưu tuyến", "distance matrix", "nearest neighbor", "đường đi ngắn nhất", "sắp xếp tự động"],
    synonyms: ["tối ưu khoảng cách", "xếp đơn tự động", "thuật toán xếp tuyến", "tiết kiệm xăng", "tuyến tối ưu"],
    summary: "ShipRoute AI hỗ trợ hai chế độ tối ưu hóa tuyến đường tùy thuộc vào trạng thái kết nối mạng và cấu hình API Key của bạn:",
    steps: [
      "Nếu đã cấu hình Google Maps API và có mạng: Ứng dụng sử dụng Google Distance Matrix API để lấy thời gian di chuyển và khoảng cách thực tế trên đường bộ giữa các điểm, từ đó tìm ra lộ trình ngắn nhất và nhanh nhất.",
      "Nếu đang offline hoặc chưa cấu hình API: Ứng dụng tự động chuyển sang chế độ Tối ưu local (thuật toán Nearest Neighbor - Láng giềng gần nhất). Thuật toán này tính khoảng cách đường chim bay dựa trên tọa độ Lat/Lng để sắp xếp tuyến nhanh chóng mà không cần kết nối internet."
    ],
    notes: [
      "Thuật toán tối ưu đường bộ thực tế (Distance Matrix) luôn chính xác hơn vì nó tính đến đường một chiều, ngõ cụt và khoảng cách đi xe thực tế thay vì đường chim bay thẳng."
    ],
    relatedModules: ["route_planner", "google_maps", "offline_pwa"],
    suggestedFollowUps: ["Cần bật API nào?", "Vì sao không tính được tuyến?", "Dùng offline được không?"],
    relatedRoute: "/route-planner",
    relatedRouteName: "Lập tuyến đường"
  },
  {
    id: "google_maps",
    title: "Cấu hình Google Maps API",
    keywords: ["google maps api key", "env local", "maps javascript api", "geocoding api", "directions api", "distance matrix api", "bảo mật api key", "bản đồ trắng"],
    synonyms: ["api key nằm ở đâu", "cấu hình bản đồ", "lấy khóa api", "không hiện bản đồ", "lộ api key", "gcp console"],
    summary: "Google Maps API cung cấp bản đồ và các thuật toán tính toán đường đi thực tế cho ứng dụng. Để sử dụng đầy đủ các tính năng bản đồ và tối ưu hóa đường bộ, bạn cần cấu hình API Key từ Google Cloud Console (GCP).",
    steps: [
      "Truy cập Google Cloud Console và tạo một dự án (Project) mới.",
      "Tạo một API Key mới trong phần Credentials.",
      "Vào mục Library và bật đủ 4 API bắt buộc: Maps JavaScript API (hiển thị bản đồ), Geocoding API (lấy tọa độ địa chỉ), Directions API (vẽ lộ trình), và Distance Matrix API (tính khoảng cách tối ưu).",
      "Tạo file `.env.local` ở thư mục gốc của dự án ShipRoute và điền khóa của bạn vào: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=khóa_của_bạn`.",
      "Khởi động lại máy chủ phát triển (npm run dev) để áp dụng cấu hình mới."
    ],
    notes: [
      "Để tránh bị người khác đánh cắp khóa API và phát sinh chi phí ngoài ý muốn, bạn BẮT BUỘC phải thiết lập giới hạn HTTP Referrer (chỉ cho phép localhost và domain deploy của bạn) trên Google Cloud Console.",
      "Tuyệt đối không commit file chứa API Key lên GitHub hoặc chia sẻ công khai."
    ],
    problems: [
      "Vì sao bản đồ không hiển thị / lỗi bản đồ trắng: Lỗi phổ biến nhất là 'RefererNotAllowedMapError'. Lỗi này xảy ra khi bạn bật giới hạn HTTP Referrer trên GCP nhưng cấu hình sai hoặc thiếu dấu sao (*) ở cuối đường dẫn (ví dụ: `http://localhost:3000/*`). Hãy kiểm tra F12 Console để xem chi tiết mã lỗi từ Google."
    ],
    relatedModules: ["settings", "troubleshooting"],
    suggestedFollowUps: ["Lỗi RefererNotAllowedMapError?", "Vì sao bản đồ không hiện?", "Cách bảo mật API key?", "Ứng dụng có dùng thử miễn phí không?"],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  },
  {
    id: "backup",
    title: "Sao lưu & Khôi phục dữ liệu (Backup & Restore)",
    keywords: [
      "localstorage", "indexeddb", "sao lưu", "export json", "import json", "mất dữ liệu", "khôi phục dữ liệu",
      "cách backup dữ liệu", "cách xuất dữ liệu", "cách nhập dữ liệu", "dữ liệu lưu ở đâu",
      "đổi máy có mất dữ liệu không", "xóa cache có mất đơn không", "cách khôi phục dữ liệu",
      "file backup có chứa api key không", "dữ liệu đơn giao lưu ở đâu"
    ],
    synonyms: [
      "dữ liệu lưu ở đâu", "chuyển thiết bị", "lưu trữ cục bộ", "xóa dữ liệu", "cách backup", "sao lưu dự phòng",
      "làm thế nào để backup", "lấy file sao lưu", "import file sao lưu", "mất đơn hàng", "khóa api", "bảo mật",
      "du lieu don giao luu o dau"
    ],
    summary: "ShipRoute AI lưu trữ toàn bộ dữ liệu đơn hàng, tuyến đường, khách hàng và cài đặt cục bộ (local-first) trên trình duyệt này. Tệp sao lưu JSON được tải về thiết bị của bạn hoàn toàn an toàn và KHÔNG chứa các API key hay bí mật hệ thống.",
    steps: [
      "Dữ liệu đơn giao lưu ở đâu: Tất cả dữ liệu của bạn được lưu cục bộ (local-first) trong bộ nhớ localStorage của trình duyệt trên thiết bị đang sử dụng. Ứng dụng không đẩy dữ liệu lên máy chủ để đảm bảo tính riêng tư.",
      "Cách backup dữ liệu: Vào Cài đặt -> Phân hệ Dữ liệu & sao lưu -> Bấm 'Xuất dữ liệu sao lưu' để tải file .json về máy. Bạn cũng có thể chọn 'Xuất đơn hàng (CSV)' để xuất ra file Excel.",
      "Cách khôi phục: Vào Cài đặt -> Nhập dữ liệu từ file -> Chọn file .json đã lưu và chọn chế độ Gộp hoặc Thay thế."
    ],
    notes: [
      "Vì dữ liệu chỉ nằm ở trình duyệt này, việc xóa lịch sử duyệt web/cache hoặc dùng tab ẩn danh SẼ làm mất sạch dữ liệu đơn hàng. Hãy luôn export dữ liệu định kỳ.",
      "File backup .json chỉ lưu dữ liệu hoạt động và thông tin khách hàng, hoàn toàn KHÔNG lưu Google Maps API key của bạn."
    ],
    problems: [
      "Đổi máy có mất dữ liệu không: Có mất nếu bạn không sao lưu. Bạn hãy xuất file backup JSON từ thiết bị cũ, gửi qua thiết bị mới và thực hiện Import file đó.",
      "Xóa cache có mất đơn không: Có mất. Hãy luôn xuất file backup trước khi xóa cache trình duyệt.",
      "Lỗi file sao lưu không hợp lệ: Hệ thống kiểm tra cấu trúc dữ liệu, tên ứng dụng 'ShipRoute AI' và định dạng mảng để tránh nạp dữ liệu lỗi gây crash app."
    ],
    relatedModules: ["settings", "localstorage_detail"],
    suggestedFollowUps: [
      "Dữ liệu đơn giao lưu ở đâu?",
      "Xóa cache có mất đơn không?",
      "File backup có chứa API key không?",
      "Đổi máy có mất dữ liệu không?"
    ],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  },
  {
    id: "history",
    title: "Lịch sử tuyến đường",
    keywords: ["lịch sử tuyến", "history", "xem lại tuyến", "lưu tuyến", "snapshot chi phí", "tuyến đường cũ"],
    synonyms: ["tuyến đường đã đi", "lịch sử giao hàng", "tìm tuyến cũ", "chi tiết tuyến đã lưu"],
    summary: "Trang Lịch sử tuyến giúp bạn lưu trữ, quản lý và xem lại hành trình của những ngày giao hàng trước đây.",
    steps: [
      "Bấm chọn mục Lịch sử (biểu tượng đồng hồ cát/lịch sử ở menu điều hướng dưới).",
      "Xem danh sách các tuyến đã đi được sắp xếp theo thời gian lưu gần nhất.",
      "Nhấp vào một tuyến đường bất kỳ để xem chi tiết lộ trình trên bản đồ, danh sách các điểm giao và snapshot chi phí tại thời điểm lưu tuyến đó."
    ],
    notes: [
      "Mỗi khi bạn hoàn thành một tuyến đường trong Route Planner và bấm 'Lưu tuyến', hệ thống sẽ tự động chụp lại (snapshot) toàn bộ thông số tuyến đường để báo cáo hiệu suất."
    ],
    relatedModules: ["route_planner", "reports"],
    suggestedFollowUps: ["Lập tuyến như thế nào?", "Xóa lịch sử tuyến làm sao?", "Dữ liệu lịch sử lưu ở đâu?"],
    relatedRoute: "/history",
    relatedRouteName: "Lịch sử tuyến"
  },
  {
    id: "reports",
    title: "Báo cáo hiệu suất & chi phí",
    keywords: ["báo cáo", "hiệu suất", "chi phí vận hành", "biểu đồ", "export csv", "lợi nhuận", "tiền xăng"],
    synonyms: ["xem thống kê", "xem doanh thu", "lợi nhuận xe", "chưa có dữ liệu", "in báo cáo", "xuất báo cáo"],
    summary: "Mục Báo cáo nâng cao cung cấp cái nhìn chi tiết về hiệu quả giao hàng và tài chính của tài xế thông qua các biểu đồ trực quan.",
    steps: [
      "Vào trang Báo cáo (icon Biểu đồ ở menu điều hướng dưới).",
      "Lựa chọn khoảng thời gian cần lọc dữ liệu (Hôm nay, Tuần này, Tháng này, hoặc tùy chỉnh).",
      "Xem các thống kê tổng quan về tỷ lệ đơn giao thành công, quãng đường đã đi, và lợi nhuận tạm tính.",
      "Nhấp nút 'Xuất CSV' để tải danh sách đơn hàng đã lọc hoặc nhấp 'In báo cáo' để in/lưu thành file PDF."
    ],
    notes: [
      "Chi phí xăng xe và khấu hao hao mòn được ước tính dựa trên các thông số cấu hình tiêu thụ nhiên liệu bạn đã nhập trong trang Cài đặt."
    ],
    problems: [
      "Báo cáo không có dữ liệu: Đảm bảo bạn đã lưu ít nhất một tuyến đường vào lịch sử trong khoảng thời gian đang lọc và các đơn hàng có cập nhật trạng thái giao thành công/thất bại."
    ],
    relatedModules: ["backup", "dashboard", "history"],
    suggestedFollowUps: ["Làm sao tính chi phí xăng xe?", "Xuất file CSV báo cáo ở đâu?", "Xem lịch sử tuyến thế nào?"],
    relatedRoute: "/reports",
    relatedRouteName: "Báo cáo hiệu suất"
  },
  {
    id: "settings",
    title: "Cài đặt & Trạng thái hệ thống",
    keywords: ["cài đặt", "trạng thái hệ thống", "api status", "service worker", "cài đặt pwa", "an toàn api key", "giá xăng"],
    synonyms: ["cấu hình app", "hệ thống khỏe không", "cài đặt ứng dụng", "pwa là gì", "kiểm tra sức khỏe app", "cài đặt xăng"],
    summary: "Trang Cài đặt (Settings) là nơi quản lý toàn bộ cấu hình tài chính xăng xe, kiểm tra tình trạng sức khỏe ứng dụng và hướng dẫn cài đặt chế độ PWA chạy ngoại tuyến.",
    steps: [
      "Truy cập trang Cài đặt (icon bánh răng ở góc dưới bên phải).",
      "Xem phần 'Sức khỏe hệ thống' (System Health Check) ở trên cùng để theo dõi tình trạng bộ nhớ localStorage, IndexedDB và kết nối GPS.",
      "Trong phần 'Cấu hình chi phí', nhập định mức tiêu hao xăng của xe (lít/100km) cùng giá xăng hiện hành để hệ thống tính toán chi phí vận hành.",
      "Xem trạng thái API key Google Maps và Service Worker đã được kích hoạt chưa."
    ],
    notes: [
      "Mức tiêu hao xăng mặc định là 2.5 lít/100km. Bạn nên cập nhật chính xác theo xe của mình để có báo cáo tài chính chuẩn xác nhất."
    ],
    relatedModules: ["google_maps", "backup", "offline_pwa"],
    suggestedFollowUps: ["Làm sao cài app PWA?", "Service worker là gì?", "Cách cấu hình API key?", "Backup dữ liệu ở đâu?"],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  },
  {
    id: "offline_pwa",
    title: "Service Worker & PWA",
    keywords: ["service worker", "pwa", "offline", "cài đặt màn hình", "ngoại tuyến", "không có mạng"],
    synonyms: ["cài app lên điện thoại", "dùng offline", "chạy không cần mạng", "biểu tượng màn hình chính", "app di động"],
    summary: "ShipRoute AI hỗ trợ Progressive Web App (PWA) và Service Worker, cho phép bạn cài đặt ứng dụng trực tiếp lên điện thoại hoặc máy tính và mở chạy mượt mà ngay cả khi không có kết nối internet.",
    steps: [
      "Trên iPhone/iPad: Mở Safari, truy cập link app, bấm nút 'Chia sẻ' (Share) và chọn 'Thêm vào MH chính' (Add to Home Screen).",
      "Trên thiết bị Android: Mở Chrome, bấm menu 3 chấm ở góc phải và chọn 'Cài đặt ứng dụng' (Install App).",
      "Sau khi cài đặt, bạn sẽ thấy biểu tượng ShipRoute AI trên màn hình điện thoại và có thể mở dùng bất cứ lúc nào."
    ],
    notes: [
      "Khi không có kết nối mạng (offline), ứng dụng sử dụng cơ chế offline fallback để bạn vẫn xem được đơn hàng, lịch sử và lập tuyến bằng thuật toán local. Dữ liệu bản đồ và lấy tọa độ từ địa chỉ chữ sẽ tạm dừng hoạt động cho đến khi có mạng trở lại."
    ],
    relatedModules: ["settings", "backup"],
    suggestedFollowUps: ["Dùng offline được không?", "Thuật toán tối ưu local hoạt động thế nào?", "Dữ liệu lưu ở đâu?"],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  },
  {
    id: "customers",
    title: "Khách hàng thường xuyên",
    keywords: ["khách hàng", "customer", "thường xuyên", "thêm khách", "lưu thông tin khách", "danh bạ khách", "khách hàng dùng để làm gì", "cách thêm khách hàng"],
    synonyms: ["khách ruột", "danh sách khách", "lưu sđt khách", "quản lý khách hàng", "gợi ý khách hàng", "khach hang de lam gi", "cach them khach hang"],
    summary: "Tính năng quản lý Khách hàng thường xuyên giúp bạn lưu trữ thông tin những người nhận quen thuộc để điền nhanh địa chỉ và số điện thoại khi tạo đơn hàng mới, giúp tối ưu hóa thời gian nhập liệu.",
    steps: [
      "Khách hàng dùng để làm gì: Tính năng này giúp bạn lưu trữ danh bạ khách hàng thân thiết/quen thuộc. Khi tạo đơn hàng mới, bạn chỉ cần nhập tên khách hàng, hệ thống sẽ gợi ý và điền nhanh toàn bộ SĐT, địa chỉ và tọa độ đã lưu.",
      "Cách thêm khách hàng: Cách 1: Vào trang 'Khách hàng' ở menu dưới, bấm 'Thêm khách hàng' để điền thông tin. Cách 2: Khi tạo đơn hàng mới trong mục 'Đơn giao', tích chọn ô 'Lưu khách này vào danh sách khách thường xuyên', hệ thống sẽ tự động lưu thông tin khách khi tạo đơn."
    ],
    notes: [
      "Dữ liệu khách hàng cũng được lưu hoàn toàn ở local thiết bị và sẽ được export/import đi kèm trong file JSON sao lưu."
    ],
    relatedModules: ["orders", "backup"],
    suggestedFollowUps: ["Khách hàng dùng để làm gì?", "Cách thêm khách hàng?", "Cách thêm đơn giao?", "Dữ liệu đơn giao lưu ở đâu?"],
    relatedRoute: "/customers",
    relatedRouteName: "Quản lý khách hàng"
  },
  {
    id: "troubleshooting",
    title: "Khắc phục sự cố & Lỗi thường gặp",
    keywords: ["lỗi", "màn hình trắng", "bản đồ không hiện", "api lỗi", "không tính được tuyến", "mất đơn hàng", "offline", "sự cố"],
    synonyms: ["sự cố thường gặp", "lỗi mất mạng", "lỗi tọa độ", "mất hết đơn", "app bị treo", "lỗi không hiện map", "mất đơn"],
    summary: "Dưới đây là tổng hợp các sự cố thường gặp nhất trong quá trình vận hành ShipRoute AI và hướng dẫn cách tự khắc phục nhanh chóng:",
    steps: [
      "Lỗi bản đồ không hiện (hoặc hiện bảng thông báo lỗi): Hãy kiểm tra kết nối mạng. Nếu có mạng mà vẫn lỗi, hãy mở Console trình duyệt xem lỗi là gì. Đa phần là lỗi 'RefererNotAllowedMapError' do bạn chưa cấu hình chính xác giới hạn tên miền (Referrer) trên Google Cloud Console.",
      "Lỗi không lấy được tọa độ (Geocoding thất bại): Hãy chắc chắn rằng bạn đã nhập địa chỉ rõ ràng và chi tiết (bao gồm số nhà, tên đường, tên phường/xã, quận/huyện, tỉnh/thành). Địa chỉ quá chung chung như 'Hà Nội' sẽ khiến API không xác định được vị trí cụ thể.",
      "Lỗi không tính được tuyến đường: Hãy kiểm tra kỹ xem có đơn hàng nào trong tuyến chưa có tọa độ GPS (bị trống vĩ độ Lat hoặc kinh độ Lng). Mọi đơn được chọn lập tuyến bắt buộc phải có tọa độ hợp lệ.",
      "Đơn hàng tự dưng biến mất: Dữ liệu lưu cục bộ trên trình duyệt nên sẽ bị xóa nếu bạn xóa lịch sử/cookies trình duyệt. Hãy sử dụng file JSON backup để khôi phục lại."
    ],
    notes: [
      "Trước khi thực hiện dọn dẹp bộ nhớ máy hoặc cập nhật trình duyệt, hãy luôn nhớ truy cập Settings -> Export JSON để sao lưu dữ liệu an toàn."
    ],
    relatedModules: ["settings", "google_maps", "backup"],
    suggestedFollowUps: ["Lỗi RefererNotAllowedMapError?", "Mất kết nối mạng có dùng được không?", "Cách backup dữ liệu?", "Vì sao không lấy được tọa độ?"],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  },
  {
    id: "google_maps_faq",
    title: "Hỏi đáp lỗi Google Maps & Định tuyến",
    keywords: [
      "vi sao ban do khong hien", "vi sao ban do trang", "api key de o dau", "loi referrer", 
      "referer-not-allowed", "can bat api nao", "tai sao khong lay duoc toa do", 
      "tai sao khong tinh duoc tuyen", "khong co mang co lap tuyen duoc khong", 
      "local fallback la gi", "lam sao sua dia chi thieu toa do", 
      "tai sao phai restart npm run dev", "tai sao phai khoi dong lai",
      "ban do trang", "khong hien ban do", "mat toa do", "thieu gps", "loi dinh tuyen"
    ],
    synonyms: [
      "loi ban do", "khong tim thay toa do", "chua kich hoat thanh toan", "billing account", 
      "http referrers", "chay offline", "loc dia chi", "restart dev server", "tai sao loi"
    ],
    summary: "ShipRoute AI tích hợp Google Maps API để cung cấp lộ trình thực tế và tọa độ chuẩn xác. Dưới đây là giải đáp cho các câu hỏi thường gặp về lỗi bản đồ và định tuyến:",
    steps: [
      "Q: Vì sao bản đồ không hiện hoặc báo lỗi bản đồ trắng?\n- A: Do chưa cấu hình API Key trong file .env.local, thiết bị mất mạng, hoặc lỗi giới hạn HTTP Referrer trên Google Cloud Console.",
      "Q: Lỗi RefererNotAllowedMapError là gì?\n- A: Google Maps phát hiện API Key của bạn bị giới hạn tên miền sử dụng nhưng domain hiện tại (như localhost:3000) chưa được thêm vào danh sách cho phép trên Google Cloud.",
      "Q: Cần bật các API nào trên Google Cloud?\n- A: Bạn phải bật đủ 4 API: Maps JavaScript API, Geocoding API, Directions API, và Distance Matrix API.",
      "Q: API Key để ở đâu?\n- A: Lưu tại file .env.local ở thư mục gốc của dự án với khóa NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key.",
      "Q: Tại sao không lấy được tọa độ (Geocoding)?\n- A: Do địa chỉ quá ngắn, quá mơ hồ hoặc API Key chưa được bật Geocoding API. Hãy thêm số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố chi tiết.",
      "Q: Tại sao không tính được tuyến đường?\n- A: Hãy chắc chắn mọi đơn được chọn đều có tọa độ GPS hợp lệ (không bị báo đỏ hoặc trống). Bạn cũng cần kết nối mạng để dùng Google Directions.",
      "Q: Không có mạng (offline) có lập tuyến được không?\n- A: Có. Hệ thống sẽ tự động chuyển sang chế độ Local Fallback sử dụng thuật toán Nearest Neighbour để sắp xếp các đơn hàng offline dựa trên khoảng cách đường chim bay.",
      "Q: Local Fallback là gì?\n- A: Chế độ chạy ngoại tuyến tự động của ShipRoute AI. Khi không gọi được Google API, ứng dụng sắp xếp đơn dựa trên thứ tự ưu tiên, trạng thái đơn và thuật toán lân cận để bạn vẫn có lộ trình di chuyển mà không cần mạng.",
      "Q: Làm sao sửa địa chỉ bị thiếu tọa độ?\n- A: Mở form chỉnh sửa đơn hàng, nhập địa chỉ chi tiết hơn và nhấn 'Lấy tọa độ', hoặc click vào 'Thông tin tọa độ nâng cao' để tự nhập vĩ độ/kinh độ GPS thủ công.",
      "Q: Tại sao phải restart npm run dev sau khi thêm API key?\n- A: Next.js chỉ tải các biến môi trường từ file .env.local vào tiến trình Node.js lúc khởi tạo máy chủ. Nếu thêm key mới, bạn phải tắt dev server (Ctrl + C) và chạy lại npm run dev để áp dụng."
    ],
    relatedModules: ["settings", "google_maps", "troubleshooting"],
    suggestedFollowUps: [
      "Cách cấu hình API key?",
      "Lỗi RefererNotAllowedMapError?",
      "Local fallback là gì?",
      "Không có mạng có lập tuyến được không?"
    ],
  },
  {
    id: "production_deployment",
    title: "Triển khai & Chạy ứng dụng (Deployment)",
    keywords: [
      "cach chay app", "cach build app", "trien khai ung dung", "deploy", "vercel", "production build",
      "chay production", "khoi dong lai", "moi truong", "bien moi truong", "local-first la gi",
      "cach chay ung dung", "huong dan deploy", "build loi", "khoi chay"
    ],
    synonyms: [
      "cach build", "npm run dev", "npm run build", "npm start", "trien khai len vercel", "deploy vercel",
      "bien moi truong vercel", "cau hinh hosting", "local first", "luu tren thiet bi"
    ],
    summary: "Hướng dẫn chi tiết cách khởi chạy, biên dịch (build), chạy bản production cục bộ và triển khai thực tế (deploy) ứng dụng ShipRoute AI.",
    steps: [
      "1. Cách khởi chạy ở môi trường phát triển (Development):\n- Chạy lệnh `npm run dev` trong thư mục gốc.\n- Mở trình duyệt truy cập `http://localhost:3000`.",
      "2. Cách biên dịch ứng dụng (Build):\n- Chạy lệnh `npm run build` để kiểm tra TypeScript/Linter và tạo ra bản build tối ưu hóa.",
      "3. Cách khởi chạy bản Production cục bộ:\n- Sau khi build thành công, chạy lệnh `npm start` để khởi động máy chủ production cục bộ trên cổng 3000.",
      "4. Cách triển khai lên hosting (Ví dụ Vercel):\n- Đẩy mã nguồn lên kho Git (GitHub, GitLab...).\n- Import dự án vào Vercel hoặc các nền tảng tương đương.\n- CẤU HÌNH BIẾN MÔI TRƯỜNG: Thiết lập biến `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` bằng API key thật của bạn trong cài đặt Environment Variables của Vercel trước khi Deploy.",
      "5. Dữ liệu local-first là gì:\n- Là mô hình ứng dụng lưu trữ và xử lý toàn bộ dữ liệu trực tiếp trong trình duyệt của người dùng (sử dụng localStorage). Ứng dụng hoạt động độc lập, không đồng bộ về database server trung tâm, giúp bảo vệ quyền riêng tư và hoạt động mượt mà khi ngoại tuyến (offline).",
      "6. Backup trước khi deploy hoặc đổi máy:\n- Truy cập Cài đặt -> mục Dữ liệu & sao lưu -> Bấm 'Xuất dữ liệu sao lưu' để tải về file .json. Việc này đảm bảo bạn không bị mất dữ liệu khi đổi thiết bị, dọn dẹp cache trình duyệt hoặc cập nhật bản build mới."
    ],
    notes: [
      "Lưu ý quan trọng khi deploy: Tuyệt đối không commit file chứa API key (.env.local) lên GitHub. Chỉ cấu hình key này thông qua giao diện cấu hình biến môi trường của nhà cung cấp hosting.",
      "Luôn khởi động lại dev server (chạy lại npm run dev) sau khi sửa đổi file .env.local để Next.js nạp lại biến môi trường mới."
    ],
    relatedModules: ["settings", "google_maps", "backup"],
    suggestedFollowUps: [
      "Dữ liệu local-first là gì?",
      "Cách backup trước khi deploy hoặc đổi máy?",
      "Làm thế nào để cấu hình API key trên Vercel?",
      "Cách chạy app ở localhost?"
    ],
    relatedRoute: "/settings",
    relatedRouteName: "Cài đặt hệ thống"
  }
];

/**
 * HƯỚNG DẪN CẬP NHẬT KHO TRI THỨC AI CHATBOT SAU NÀY:
 * 
 * Khi muốn thêm một chủ đề trợ giúp mới cho chatbot:
 * 1. Mở file `lib/appHelpKnowledge.ts`.
 * 2. Thêm một đối tượng cấu trúc `HelpTopic` mới vào mảng `HELP_TOPICS`.
 * 3. Điền đầy đủ các thông tin:
 *    - `id`: Định danh duy nhất (ví dụ: "custom_feature").
 *    - `title`: Tên hiển thị của chủ đề (tiếng Việt).
 *    - `keywords`: Danh sách từ khóa viết thường có dấu (dùng để khớp intent).
 *    - `synonyms`: Danh sách từ đồng nghĩa viết thường không dấu hoặc có dấu (giúp tìm kiếm linh hoạt).
 *    - `summary`: Tóm tắt ngắn gọn tính năng (không dùng markdown thô).
 *    - `steps`: (Tùy chọn) Mảng các bước thực hiện chi tiết dạng danh sách.
 *    - `notes`: (Tùy chọn) Mảng các lưu ý quan trọng.
 *    - `problems`: (Tùy chọn) Các sự cố thường gặp của chủ đề đó và cách sửa.
 *    - `relatedRoute`: (Tùy chọn) Đường dẫn tương ứng trong app để chuyển hướng nhanh (ví dụ: "/orders").
 *    - `relatedRouteName`: (Tùy chọn) Tên hiển thị trên nút bấm đi tới trang đó.
 *    - `suggestedFollowUps`: (Tùy chọn) Các câu hỏi liên quan để người dùng hỏi tiếp.
 * 4. Chạy lại dự án bằng lệnh `npm run dev` để kiểm tra.
 */
