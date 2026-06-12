import { OrderStop } from "./types";

export function cleanOcrText(rawText: string): string {
  // Remove multiple empty lines and trim
  return rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

export function extractPhoneNumber(rawText: string): string {
  // Matches 10 digits starting with 03, 05, 07, 08, 09
  // Allow spaces, dots, dashes
  const phoneRegex = /(0[3|5|7|8|9])(?:[\s.-]*\d){8}/g;
  const matches = rawText.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    // Return first match, cleaned up
    return matches[0].replace(/[\s.-]/g, '');
  }
  return "";
}

export function extractCodAmount(rawText: string): number {
  // Match patterns like "COD: 150,000" or "thu hộ 150k" or "150.000 đ"
  // First, let's normalize text to lowercase
  const lower = rawText.toLowerCase();
  
  // Look for keywords
  const keywords = ['cod', 'thu hộ', 'tiền hàng'];
  const lines = lower.split('\n');
  
  for (const line of lines) {
    if (keywords.some(kw => line.includes(kw))) {
      // Try to find a number in this line
      const numMatch = line.match(/\d+([.,]\d{3})*/);
      if (numMatch) {
        const cleanNum = parseInt(numMatch[0].replace(/[.,]/g, ''), 10);
        if (!isNaN(cleanNum)) {
          // If it's less than 1000, it might be in 'k' unit (e.g. 150k)
          if (line.includes('k') && cleanNum < 10000) {
            return cleanNum * 1000;
          }
          return cleanNum;
        }
      }
    }
  }

  // Fallback: Just look for any number followed by 'đ', 'vnd', 'vnđ'
  const currencyMatch = lower.match(/(\d+([.,]\d{3})*)\s*(đ|vnd|vnđ)/);
  if (currencyMatch) {
    const cleanNum = parseInt(currencyMatch[1].replace(/[.,]/g, ''), 10);
    if (!isNaN(cleanNum)) {
      return cleanNum;
    }
  }

  return 0;
}

export function extractPossibleAddress(rawText: string): string {
  const lines = rawText.split('\n');
  const addressKeywords = ['đường', 'hẻm', 'ngõ', 'số', 'phường', 'xã', 'quận', 'huyện', 'thành phố', 'tỉnh', 'tp', 'q.', 'p.'];
  
  // Score lines by how many address keywords they have
  const scoredLines = lines.map(line => {
    const lower = line.toLowerCase();
    let score = 0;
    for (const kw of addressKeywords) {
      // Use word boundaries for short keywords
      if (kw === 'số' || kw === 'tp' || kw === 'q.' || kw === 'p.') {
        const regex = new RegExp(`(?:^|\\s)${kw.replace('.', '\\.')}(?:\\s|$)`, 'i');
        if (regex.test(lower)) score += 2;
      } else {
        if (lower.includes(kw)) score += 1;
      }
    }
    // Also reward lines that have numbers (house numbers) and commas
    if (/\d+/.test(lower)) score += 0.5;
    if (lower.includes(',')) score += 0.5;
    
    return { line, score };
  });

  // Pick lines with score >= 1.5, join them if they are adjacent
  const addressParts = [];
  for (const item of scoredLines) {
    if (item.score >= 1.5) {
      addressParts.push(item.line);
    }
  }

  if (addressParts.length > 0) {
    return addressParts.join(', ');
  }
  
  return "";
}

export function extractReceiverName(rawText: string): string {
  const lines = rawText.split('\n');
  // Usually name is at the top, or prefixed by "Người nhận" or "Khách"
  const nameKeywords = ['người nhận', 'khách', 'to:', 'tên:'];
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const kw of nameKeywords) {
      if (lower.includes(kw)) {
        // Strip keyword and punctuation
        const name = line.replace(new RegExp(kw, 'i'), '').replace(/^[\s:,-]+/, '').trim();
        if (name) return name;
      }
    }
  }
  
  // Fallback: If first line has no numbers and is short enough
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 3 && firstLine.length < 30 && !/\d{5,}/.test(firstLine)) {
      return firstLine;
    }
  }
  
  return "";
}

export function parseOcrOrderText(rawText: string): Partial<OrderStop> {
  const cleanedText = cleanOcrText(rawText);
  
  const phone = extractPhoneNumber(cleanedText);
  const codAmount = extractCodAmount(cleanedText);
  const address = extractPossibleAddress(cleanedText);
  const receiverName = extractReceiverName(cleanedText);
  
  return {
    phone,
    codAmount,
    address,
    receiverName,
    note: "" // Hard to extract reliably without specific format, leave empty
  };
}
