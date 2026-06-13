import { HELP_TOPICS, HelpTopic } from "./appHelpKnowledge";
import { appFeatures, AppFeature } from "./appFeatureRegistry";

export interface AiHelpResponse {
  text: string;
  suggestions: string[];
}

export function removeVietnameseAccents(text: string): string {
  let result = text.toLowerCase();
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  result = result.replace(/đ/g, "d");
  result = result.replace(/Đ/g, "d");
  result = result.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  result = result.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  result = result.replace(/[ìíịỉĩ]/g, "i");
  result = result.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  result = result.replace(/[ùúụủũưừứựửữ]/g, "u");
  result = result.replace(/[ỳýỵỷỹ]/g, "y");
  // Keep alphanumeric and spaces
  return result.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?/\\()\[\]{}"'`@:;–—\-+_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function featureToTopic(f: AppFeature): HelpTopic {
  return {
    id: f.id,
    title: f.name,
    keywords: f.keywords,
    synonyms: [],
    summary: f.shortDescription,
    steps: f.userGuide,
    relatedModules: f.relatedFeatures,
    suggestedFollowUps: f.commonQuestions?.map((q) => q.question) || [],
  };
}

export function getAllFeatureNames(): string[] {
  return appFeatures.map((f) => f.name);
}

export function getNewFeatures(): AppFeature[] {
  return appFeatures.filter((f) => f.status === "new" || f.status === "beta");
}

export function getFeatureHelpTopics(): HelpTopic[] {
  return appFeatures.map(featureToTopic);
}

export function getCombinedHelpTopics(): HelpTopic[] {
  const dynamic = getFeatureHelpTopics();
  return [...HELP_TOPICS, ...dynamic];
}

/**
 * Scores a topic based on how well it matches the user's question
 */
export function scoreTopic(question: string, topic: HelpTopic): number {
  let score = 0;
  
  const qNorm = normalizeText(question);
  const qAccentless = removeVietnameseAccents(qNorm);
  
  const qWords = qNorm.split(" ").filter(Boolean);
  const qAccentlessWords = qAccentless.split(" ").filter(Boolean);
  
  if (qWords.length === 0) return 0;

  // 1. Match title
  const titleNorm = normalizeText(topic.title);
  const titleAccentless = removeVietnameseAccents(titleNorm);
  
  if (qNorm === titleNorm || qAccentless === titleAccentless) {
    score += 15;
  } else if (qNorm.includes(titleNorm)) {
    score += 10;
  } else if (qAccentless.includes(titleAccentless)) {
    score += 8;
  }

  // 2. Match ID
  const idNorm = normalizeText(topic.id);
  if (qNorm === idNorm || qAccentless === idNorm) {
    score += 12;
  } else if (qNorm.includes(idNorm)) {
    score += 6;
  }

  // 3. Match keywords
  for (const kw of topic.keywords || []) {
    const kwNorm = normalizeText(kw);
    const kwAccentless = removeVietnameseAccents(kwNorm);
    
    if (qNorm === kwNorm || qAccentless === kwAccentless) {
      score += 10;
    } else if (qNorm.includes(kwNorm)) {
      score += 8;
    } else if (qAccentless.includes(kwAccentless)) {
      score += 7;
    } else {
      // Word overlap for multi-word keywords
      const kwWords = kwAccentless.split(" ").filter(Boolean);
      let matchCount = 0;
      for (const w of kwWords) {
        if (qAccentlessWords.includes(w)) {
          matchCount++;
        }
      }
      if (matchCount > 0 && kwWords.length > 0) {
        score += (matchCount / kwWords.length) * 4;
      }
    }
  }

  // 4. Match synonyms
  for (const syn of topic.synonyms || []) {
    const synNorm = normalizeText(syn);
    const synAccentless = removeVietnameseAccents(synNorm);
    
    if (qNorm === synNorm || qAccentless === synAccentless) {
      score += 9;
    } else if (qNorm.includes(synNorm)) {
      score += 7;
    } else if (qAccentless.includes(synAccentless)) {
      score += 6;
    } else {
      // Word overlap for multi-word synonyms
      const synWords = synAccentless.split(" ").filter(Boolean);
      let matchCount = 0;
      for (const w of synWords) {
        if (qAccentlessWords.includes(w)) {
          matchCount++;
        }
      }
      if (matchCount > 0 && synWords.length > 0) {
        score += (matchCount / synWords.length) * 3.5;
      }
    }
  }

  return score;
}

export function getAiHelpReply(question: string): AiHelpResponse {
  const qNorm = normalizeText(question);
  const qAccentless = removeVietnameseAccents(qNorm);

  const defaultSuggestions = [
    "Cách thêm đơn giao?",
    "Cách lập tuyến giao hàng?",
    "Vì sao bản đồ không hiện?",
    "Cách backup dữ liệu?",
    "Tối ưu tuyến là gì?",
  ];

  if (!qNorm) {
    return {
      text: "Vui lòng nhập câu hỏi hoặc chọn một câu hỏi gợi ý bên dưới nhé! 😊",
      suggestions: defaultSuggestions,
    };
  }

  // 1. Greeting detection
  const greetings = [
    "xin chao", "chao", "hello", "hi", "hey", "chao ban", "chao tro ly", 
    "chao ai", "tro ly oi", "ai oi", "chào bạn", "chào", "xin chào"
  ];
  if (greetings.some((g) => qNorm === g || qAccentless === removeVietnameseAccents(g) || qAccentless.startsWith(removeVietnameseAccents(g) + " "))) {
    return {
      text: "Xin chào! 👋 Tôi là Trợ lý ShipRoute AI.\n\nTôi có thể giúp bạn tìm hiểu về:\n• Bảng điều khiển (Dashboard)\n• Quản lý đơn giao hàng\n• Lập tuyến đường & tối ưu\n• Cài đặt Google Maps API\n• Backup & dữ liệu local\n• Xử lý sự cố/Lỗi thường gặp\n\nBạn muốn tìm hiểu chủ đề nào?",
      suggestions: defaultSuggestions,
    };
  }

  // 2. Thanks detection
  const thanks = ["cam on", "thank", "cảm ơn", "ok", "được rồi", "duoc roi", "cam on ban", "cám ơn"];
  if (thanks.some((t) => qNorm === t || qAccentless.includes(removeVietnameseAccents(t)))) {
    return {
      text: "Không có chi! 😊 Nếu bạn có thêm thắc mắc gì khác trong quá trình sử dụng ShipRoute AI, cứ hỏi tôi nhé. Tôi luôn sẵn sàng hỗ trợ!",
      suggestions: defaultSuggestions,
    };
  }

  // 3. System capabilities check
  if (
    qAccentless.includes("app co") || 
    qAccentless.includes("co tinh nang") || 
    qAccentless.includes("app co gi") || 
    qAccentless.includes("chuc nang")
  ) {
    const names = getAllFeatureNames();
    return {
      text: `📋 **Các tính năng chính của ShipRoute AI:**\n\n${names.slice(0, 12).map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nBạn có thể hỏi hướng dẫn chi tiết của từng tính năng bằng cách gõ: *"Hướng dẫn dùng [tên tính năng]"*.`,
      suggestions: [
        "Cách thêm đơn giao?",
        "Cách lập tuyến giao hàng?",
        "Tính năng mới có gì?",
        "Cách backup dữ liệu?",
      ],
    };
  }

  if (qAccentless.includes("tinh nang moi") || qAccentless.includes("co gi moi")) {
    const newFs = getNewFeatures();
    if (newFs.length === 0) {
      return {
        text: "Hiện tại hệ thống hoạt động ổn định và chưa có tính năng mới được triển khai thêm. Bạn có thể kiểm tra lại sau nhé!",
        suggestions: defaultSuggestions,
      };
    }
    return {
      text: `🆕 **Các tính năng mới / đang thử nghiệm:**\n\n${newFs.map((f) => `• **${f.name}**: ${f.shortDescription}`).join("\n")}\n\nBạn có thể gõ câu hỏi chi tiết về các tính năng này để biết thêm thông tin.`,
      suggestions: newFs.map((f) => `Cách dùng ${f.name}?`).slice(0, 4),
    };
  }

  // 4. Score all topics and find the best match
  const topics = getCombinedHelpTopics();
  const scoredTopics = topics
    .map((topic) => ({ topic, score: scoreTopic(question, topic) }))
    .filter((x) => x.score > 1.5) // Minimum score threshold to avoid garbage matches
    .sort((a, b) => b.score - a.score);

  if (scoredTopics.length === 0) {
    // Smart low-confidence fallback
    return {
      text: "Mình chưa hiểu rõ câu hỏi này. 🤔\n\nBạn có thể hỏi mình về: cách thêm đơn giao, lập tuyến giao hàng, cấu hình Google Maps API, backup dữ liệu, lỗi bản đồ không hiện, hoặc tối ưu tuyến.",
      suggestions: [
        "Cách thêm đơn giao?",
        "Cách lập tuyến giao hàng?",
        "Cấu hình Google Maps?",
        "Backup dữ liệu?",
        "Lỗi bản đồ không hiện?",
        "Tối ưu tuyến là gì?",
      ],
    };
  }

  // Best match details
  const bestMatch = scoredTopics[0].topic;
  let replyText = `🔎 **${bestMatch.title}**\n\n${bestMatch.summary}`;
  
  if (bestMatch.steps && bestMatch.steps.length > 0) {
    replyText += "\n\n📝 **Các bước thực hiện:**\n" + bestMatch.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  }

  // Related topics
  if (scoredTopics.length > 1) {
    const relatedTitles = scoredTopics
      .slice(1, 3)
      .map((x) => x.topic.title);
    replyText += `\n\n💡 *Chủ đề liên quan: ${relatedTitles.join(", ")}*`;
  }

  // Dynamic suggestions
  let suggestions = bestMatch.suggestedFollowUps || [];
  if (suggestions.length === 0) {
    // Fallback to related modules or default questions
    if (bestMatch.relatedModules && bestMatch.relatedModules.length > 0) {
      // Find related topics by ID to get their questions or names
      suggestions = bestMatch.relatedModules
        .map((mId) => {
          const found = topics.find((t) => t.id === mId);
          return found ? `Tìm hiểu ${found.title}?` : "";
        })
        .filter(Boolean)
        .slice(0, 4);
    }
  }

  // Make sure we have at least some suggestions
  if (suggestions.length === 0) {
    suggestions = defaultSuggestions;
  }

  return {
    text: replyText,
    suggestions: suggestions,
  };
}
