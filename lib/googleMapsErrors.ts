/**
 * Utility to map Google Maps errors to user-friendly Vietnamese messages,
 * explaining why the map or route calculations failed and how to resolve it.
 */

export interface GoogleMapsErrorDetail {
  title: string;
  message: string;
  fix: string;
  settingsPath?: string;
}

/**
 * Maps any Google Maps error code, exception message, or API status to a friendly Vietnamese message.
 */
export const mapGoogleMapsError = (errorInput: string | Error | unknown): GoogleMapsErrorDetail => {
  const errorStr =
    errorInput instanceof Error
      ? errorInput.message
      : typeof errorInput === "string"
      ? errorInput
      : String(errorInput || "");

  const normalized = errorStr.toUpperCase();

  // 1. Missing API Key
  if (
    normalized.includes("MISSING API KEY") ||
    normalized.includes("MISSING-API-KEY") ||
    normalized.includes("CHƯA CẤU HÌNH GOOGLE MAPS API KEY")
  ) {
    return {
      title: "Chưa cấu hình Google Maps API Key",
      message: "Ứng dụng chưa phát hiện khóa API Google Maps nào được cấu hình trong hệ thống.",
      fix: "Hãy tạo file .env.local ở thư mục gốc và cấu hình biến NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Vui lòng khởi động lại máy chủ phát triển (npm run dev) sau khi thêm.",
      settingsPath: "/settings",
    };
  }

  // 2. Referrer Not Allowed (very common during local dev / deployment restriction mismatch)
  if (
    normalized.includes("REFERERNOTALLOWEDMAPERROR") ||
    normalized.includes("REFERER_NOT_ALLOWED") ||
    normalized.includes("REFERER NOT ALLOWED")
  ) {
    return {
      title: "Tên miền (Referrer) không được phép",
      message: "Khóa Google Maps API của bạn đã bật giới hạn ứng dụng, nhưng địa chỉ website hiện tại không khớp với cấu hình được phép.",
      fix: "Hãy truy cập Google Cloud Console -> Credentials, chỉnh sửa API Key này và kiểm tra phần hạn chế HTTP Referrers. Bạn cần thêm domain hiện tại (ví dụ: http://localhost:3000/* hoặc địa chỉ deploy thật của bạn).",
      settingsPath: "/settings",
    };
  }

  // 3. Billing Not Enabled
  if (
    normalized.includes("BILLINGNOTENABLEDMAPERROR") ||
    normalized.includes("BILLING_NOT_ENABLED") ||
    normalized.includes("BILLING NOT ENABLED")
  ) {
    return {
      title: "Chưa kích hoạt thanh toán (Billing)",
      message: "Tài khoản Google Cloud chứa API Key của bạn chưa được liên kết với phương thức thanh toán (Billing Account).",
      fix: "Google Maps yêu cầu phải kích hoạt tài khoản thanh toán để sử dụng dịch vụ (ngay cả đối với hạn mức miễn phí). Hãy mở Google Cloud Console và kiểm tra trạng thái Billing.",
      settingsPath: "/settings",
    };
  }

  // 4. API not activated/enabled
  if (
    normalized.includes("APINOTACTIVATEDMAPERROR") ||
    normalized.includes("API NOT ACTIVATED") ||
    normalized.includes("API NOT ENABLED") ||
    normalized.includes("NOT ACTIVATED")
  ) {
    return {
      title: "API chưa được kích hoạt",
      message: "Các dịch vụ Google Maps API cần thiết chưa được kích hoạt cho dự án Google Cloud này.",
      fix: "Hãy bật đầy đủ 4 thư viện bắt buộc trong GCP Console Library: Maps JavaScript API, Geocoding API, Directions API, và Distance Matrix API.",
      settingsPath: "/settings",
    };
  }

  // 5. Invalid API Key
  if (
    normalized.includes("INVALIDKEYMAPERROR") ||
    normalized.includes("INVALID KEY") ||
    normalized.includes("INVALID_KEY")
  ) {
    return {
      title: "API Key không hợp lệ",
      message: "Khóa Google Maps API được cung cấp không hợp lệ hoặc đã bị vô hiệu hóa.",
      fix: "Hãy kiểm tra lại xem chuỗi API Key trong file .env.local đã chính xác chưa (không chứa dấu cách thừa, dấu nháy kép hoặc ký tự lạ).",
      settingsPath: "/settings",
    };
  }

  // 6. Network / Offline Error
  if (
    normalized.includes("OFFLINE") ||
    normalized.includes("NETWORK") ||
    normalized.includes("FAILED TO FETCH") ||
    normalized.includes("DNS_PROBE") ||
    normalized.includes("INTERNET")
  ) {
    return {
      title: "Lỗi kết nối mạng",
      message: "Không thể kết nối tới máy chủ Google Maps do thiết bị của bạn đang mất mạng hoặc kết nối chập chờn.",
      fix: "Hãy kiểm tra lại kết nối Wifi/3G/4G trên thiết bị của bạn. Ứng dụng sẽ tự động chuyển sang lập tuyến Local Fallback offline.",
    };
  }

  // 7. Request Denied (General API response)
  if (normalized.includes("REQUEST_DENIED") || normalized.includes("REQUEST DENIED")) {
    return {
      title: "Yêu cầu bị từ chối",
      message: "Google Maps từ chối xử lý yêu cầu này (có thể do API key sai hoặc chưa bật quyền truy cập cho API cụ thể này).",
      fix: "Hãy kiểm tra cấu hình API trong Google Cloud Console và đảm bảo API Key không bị chặn gọi tới Directions/Distance Matrix API.",
      settingsPath: "/settings",
    };
  }

  // 8. Over Query Limit
  if (
    normalized.includes("OVER_QUERY_LIMIT") ||
    normalized.includes("OVER QUERY LIMIT") ||
    normalized.includes("QUOTAEXCEEDED") ||
    normalized.includes("LIMIT")
  ) {
    return {
      title: "Vượt quá giới hạn lượt gọi (Quota)",
      message: "Tài khoản Google Maps của bạn đã hết hạn ngạch lượt gọi (quota) trong ngày hoặc đang bị giới hạn tốc độ gọi API.",
      fix: "Vui lòng đợi một lát rồi thử lại, hoặc kiểm tra giới hạn chi tiêu/quota trên trang quản trị Google Cloud Console.",
    };
  }

  // 9. Zero Results
  if (normalized.includes("ZERO_RESULTS") || normalized.includes("ZERO RESULTS")) {
    return {
      title: "Không tìm thấy kết quả",
      message: "Không thể tìm thấy tọa độ hoặc tuyến đường cho dữ liệu đã nhập.",
      fix: "Đối với tìm địa chỉ: Hãy kiểm tra địa chỉ chi tiết hơn. Đối với vẽ tuyến: Hãy đảm bảo các điểm không quá xa nhau hoặc có đường đi bộ/xe máy/ô tô khả dụng kết nối chúng.",
    };
  }

  // 10. Address not found / vague
  if (normalized.includes("ADDRESS CANNOT BE EMPTY") || normalized.includes("ĐỊA CHỈ TRỐNG")) {
    return {
      title: "Địa chỉ trống",
      message: "Đơn giao hàng hoặc điểm bắt đầu chưa điền địa chỉ để định vị.",
      fix: "Vui lòng nhập địa chỉ đầy đủ trước khi thực hiện lấy tọa độ hoặc tính toán.",
    };
  }

  if (normalized.includes("VAGUE") || normalized.includes("QUÁ MƠ HỒ") || normalized.includes("MƠ HỒ")) {
    return {
      title: "Địa chỉ quá mơ hồ",
      message: "Địa chỉ nhập vào quá ngắn hoặc thiếu các thông tin nhận diện cụ thể.",
      fix: "Hãy cung cấp thêm các chi tiết như số nhà, tên đường, phường/xã, quận/huyện, hoặc tỉnh/thành phố (ví dụ: '120 Trần Hưng Đạo, Quận 1, TP.HCM' thay vì chỉ gõ 'Trần Hưng Đạo').",
    };
  }

  // 11. Missing coordinates in route planner
  if (normalized.includes("MISSING COORDINATES") || normalized.includes("CHƯA CÓ TỌA ĐỘ")) {
    return {
      title: "Thiếu tọa độ GPS",
      message: "Có đơn hàng được chọn lập tuyến nhưng chưa được gắn tọa độ kinh độ/vĩ độ.",
      fix: "Hãy quay lại danh sách Đơn giao, bấm nút 'Lấy tọa độ' cho các đơn hàng báo lỗi đỏ, hoặc nhập tọa độ thủ công trước khi lập tuyến.",
    };
  }

  // 12. Directions / Distance Matrix failure
  if (normalized.includes("DIRECTIONS")) {
    return {
      title: "Lỗi tính tuyến đường",
      message: "Google Directions Service gặp sự cố khi tính lộ trình.",
      fix: "Hãy kiểm tra xem các điểm giao có kết nối đường bộ không, hoặc thử lại sau.",
    };
  }

  if (normalized.includes("DISTANCE MATRIX") || normalized.includes("MATRIX")) {
    return {
      title: "Lỗi ma trận khoảng cách",
      message: "Google Distance Matrix Service gặp sự cố khi tính toán khoảng cách tối ưu giữa các điểm.",
      fix: "Đảm bảo bạn không chọn quá nhiều điểm giao vượt quá giới hạn và tất cả các điểm đều có tọa độ hợp lệ.",
    };
  }

  // Default unknown Google Maps error
  return {
    title: "Lỗi bản đồ Google Maps",
    message: errorStr || "Có lỗi bất thường xảy ra trong quá trình tương tác với dịch vụ bản đồ.",
    fix: "Hãy kiểm tra kết nối internet, trạng thái API key trong mục Cài đặt và đảm bảo các dịch vụ Google Maps đã được bật.",
    settingsPath: "/settings",
  };
};
