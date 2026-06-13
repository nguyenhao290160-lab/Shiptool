import { mapGoogleMapsError } from "./googleMapsErrors";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

/**
 * Geocode an address to get latitude, longitude, formatted address, and place ID.
 * Uses Google Geocoding API.
 *
 * @param address - The address string to geocode
 * @param apiKey - Google Maps API key
 * @returns GeocodeResult with coordinates and metadata
 * @throws Error if geocoding fails or no results found
 */
export const geocodeAddress = async (
  address: string,
  apiKey: string
): Promise<GeocodeResult> => {
  if (!address?.trim()) {
    throw new Error("Địa chỉ không được để trống");
  }

  const trimmed = address.trim();
  if (trimmed.length < 5) {
    throw new Error("Địa chỉ quá ngắn (tối thiểu 5 ký tự). Vui lòng nhập chi tiết hơn (số nhà, tên đường, v.v.).");
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2) {
    throw new Error("Địa chỉ quá mơ hồ (thiếu khoảng trắng). Vui lòng bổ sung thêm chi tiết số nhà, tên đường, hoặc phường/xã.");
  }

  // Address validation: Check if too vague
  const keywords = ["đường", "phố", "ngõ", "hẻm", "số", "kiệt", "p.", "q.", "tp.", "quận", "huyện", "phường", "tỉnh", "thành phố", "xã", "thị trấn", "thị xã", "ấp", "thôn", "bản", "tổ"];
  const lowerAddr = trimmed.toLowerCase();
  const hasKeyword = keywords.some(k => lowerAddr.includes(k));
  const hasDigit = /\d/.test(trimmed);

  if (trimmed.length < 15 && !hasKeyword && !hasDigit) {
    throw new Error("Địa chỉ quá mơ hồ. Vui lòng ghi rõ hơn, bao gồm các thông tin như số nhà, tên đường, phường/xã, quận/huyện, hoặc tỉnh/thành phố để đảm bảo định vị chính xác.");
  }

  if (!apiKey) {
    throw new Error("Google Maps API key chưa được cấu hình. Vui lòng kiểm tra file .env.local.");
  }

  try {
    const encodedAddress = encodeURIComponent(trimmed);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    if (data.status === "ZERO_RESULTS") {
      throw new Error(`Không tìm thấy tọa độ cho địa chỉ: "${address}". Vui lòng thử lại với địa chỉ chi tiết hơn.`);
    }

    if (data.status !== "OK") {
      throw new Error(`Geocoding failed: ${data.status}. ${data.error_message || ""}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("Không có kết quả tọa độ nào trả về từ máy chủ.");
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const formattedAddress = result.formatted_address;
    const placeId = result.place_id;

    // Validate coordinates range
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Tọa độ trả về từ Google Maps không hợp lệ.");
    }

    return {
      lat,
      lng,
      formattedAddress,
      placeId,
    };
  } catch (error) {
    const mapped = mapGoogleMapsError(error);
    throw new Error(`${mapped.title}: ${mapped.message} (${mapped.fix})`);
  }
};
