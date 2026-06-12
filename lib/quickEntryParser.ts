import { OrderStop } from "./types";

/**
 * Basic heuristic-based parser for quick entry mode.
 * Example input: "Nguyễn Văn A - 0901234567 - 123 Nguyễn Trãi, P.2, Q.5, TP.HCM - gọi trước khi tới"
 */
export const parseQuickOrderEntry = (text: string): Partial<OrderStop> => {
  const result: Partial<OrderStop> = {
    address: "",
  };

  if (!text.trim()) return result;

  // Split by common separators: "-", "|", or just commas if it looks like a distinct segment,
  // but usually users copy-paste with hyphens or pipes.
  const parts = text.split(/[-|]/).map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    // Only one part, assume it's just the address
    result.address = parts[0];
    return result;
  }

  // Look for a phone number part (at least 9-11 digits, possibly with spaces)
  const phoneRegex = /(?:0|\+84)[0-9\s.]{8,11}/;
  
  parts.forEach((part) => {
    if (phoneRegex.test(part) && !result.phone) {
      // Extracted phone
      const match = part.match(phoneRegex);
      if (match) {
        result.phone = match[0].replace(/[\s.]/g, "");
        
        // If the part has more text than just the phone, it might be the name as well
        const remaining = part.replace(phoneRegex, "").trim();
        if (remaining && !result.receiverName) {
          result.receiverName = remaining;
        }
      }
    } else if (
      // Guessing address: usually contains keywords like Phường, P., Quận, Q., TP, Đường, Ngõ, Thôn
      /(Phường|P\.|Quận|Q\.|TP|Đường|Ngõ|Thôn|Xã|Huyện)/i.test(part) || 
      // Or it's a long part that is not just letters (contains numbers)
      (part.length > 15 && /\d/.test(part))
    ) {
      if (!result.address) {
        result.address = part;
      } else {
        // Append to existing address if multiple address-like parts
        result.address += ", " + part;
      }
    } else if (
      // Keywords for notes
      /(gọi|trước|lưu ý|nhớ|chú ý|giao|cho xem hàng|không xem)/i.test(part)
    ) {
      result.note = part;
    } else if (!result.receiverName && part.length < 30) {
      // If it's short and we don't have a name yet, assume it's the name
      result.receiverName = part;
    } else if (!result.note) {
      // Fallback: put it in note
      result.note = part;
    }
  });

  // If we couldn't parse out the address well, fallback to the longest part or the original text
  if (!result.address) {
    // If no address guessed, find the longest part and assume it's address
    const longestPart = [...parts].sort((a, b) => b.length - a.length)[0];
    result.address = longestPart;
  }

  return result;
};
