import { HELP_TOPICS, HelpTopic } from "./appHelpKnowledge";
import { appFeatures, AppFeature } from "./appFeatureRegistry";

export interface AiHelpResponse {
  topicId?: string;
  title?: string;
  summary: string;
  steps?: string[];
  notes?: string[];
  problems?: string[];
  relatedRoute?: string;
  relatedRouteName?: string;
  suggestions: string[];
  secondaryTopic?: {
    topicId: string;
    title: string;
    summary: string;
    steps?: string[];
    notes?: string[];
    problems?: string[];
    relatedRoute?: string;
    relatedRouteName?: string;
  };
}

export function removeVietnameseAccents(text: string): string {
  if (!text) return "";
  let result = text.toLowerCase();
  
  // Normalize to decompose characters (NFD)
  result = result.normalize("NFD");
  // Remove accent mark characters in Unicode block
  result = result.replace(/[\u0300-\u036f]/g, "");
  
  // Manually handle extra Vietnamese characters not decomposed
  result = result.replace(/[đĐ]/g, "d");
  result = result.replace(/[\u0110\u0111]/g, "d");
  
  // Custom fallback replacements for accuracy
  result = result.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  result = result.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  result = result.replace(/[ìíịỉĩ]/g, "i");
  result = result.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  result = result.replace(/[ùúụủũưừứựửữ]/g, "u");
  result = result.replace(/[ỳýỵỷỹ]/g, "y");
  
  // Keep only letters, numbers, and spaces
  return result.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,!?/\\()\[\]{}"'`@:;–—\-+_#$%=^*&|<>~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRouteForModule(moduleName: string): { route?: string; name?: string } {
  const m = moduleName.toLowerCase();
  if (m === "home" || m === "dashboard") return { route: "/home", name: "Trang chủ" };
  if (m === "orders" || m === "order_management") return { route: "/orders", name: "Quản lý đơn giao" };
  if (
    m === "route-planner" || 
    m === "route_planner" || 
    m === "directions" || 
    m === "distance-matrix" || 
    m === "manual_reorder" ||
    m === "cost" ||
    m === "suggestions"
  ) {
    return { route: "/route-planner", name: "Lập tuyến đường" };
  }
  if (
    m === "settings" || 
    m === "api" || 
    m === "security" || 
    m === "backup" || 
    m === "pwa" ||
    m === "assist" ||
    m === "deploy"
  ) {
    return { route: "/settings", name: "Cài đặt hệ thống" };
  }
  if (m === "history" || m === "route_history") return { route: "/history", name: "Lịch sử tuyến" };
  if (m === "reports" || m === "export") return { route: "/reports", name: "Báo cáo hiệu suất" };
  if (m === "customers" || m === "customer") return { route: "/customers", name: "Quản lý khách hàng" };
  return {};
}

function featureToTopic(f: AppFeature): HelpTopic {
  const routeInfo = getRouteForModule(f.module);
  return {
    id: f.id,
    title: f.name,
    keywords: f.keywords,
    synonyms: [],
    summary: f.shortDescription,
    steps: f.userGuide,
    notes: f.troubleshooting?.map((t) => t.solution),
    problems: f.troubleshooting?.map((t) => `${t.problem}: ${t.solution}`),
    relatedModules: f.relatedFeatures,
    suggestedFollowUps: f.commonQuestions?.map((q) => q.question) || [],
    relatedRoute: routeInfo.route,
    relatedRouteName: routeInfo.name,
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
 * Scores a topic based on how well it matches the user's question.
 * Uses exact match, substring inclusion, and token-based overlap.
 */
export function scoreTopic(question: string, topic: HelpTopic): number {
  let score = 0;
  
  const qNorm = normalizeText(question);
  const qAccentless = removeVietnameseAccents(qNorm);
  
  const qWords = qNorm.split(" ").filter(Boolean);
  const qAccentlessWords = qAccentless.split(" ").filter(Boolean);
  
  if (qWords.length === 0) return 0;

  // 1. Title matching (strong signal)
  const titleNorm = normalizeText(topic.title);
  const titleAccentless = removeVietnameseAccents(titleNorm);
  
  if (qNorm === titleNorm || qAccentless === titleAccentless) {
    score += 20;
  } else if (qNorm.includes(titleNorm) || qAccentless.includes(titleAccentless)) {
    score += 12;
  }

  // 2. ID matching
  const idNorm = normalizeText(topic.id);
  if (qNorm === idNorm || qAccentless === idNorm) {
    score += 15;
  }

  // 3. Keyword matching (weighted)
  for (const kw of topic.keywords || []) {
    const kwNorm = normalizeText(kw);
    const kwAccentless = removeVietnameseAccents(kwNorm);
    
    if (qNorm === kwNorm || qAccentless === kwAccentless) {
      score += 12;
    } else if (qNorm.includes(kwNorm) || qAccentless.includes(kwAccentless)) {
      score += 8;
    } else {
      // Word overlap scoring
      const kwWords = kwAccentless.split(" ").filter(Boolean);
      if (kwWords.length > 0) {
        let matchCount = 0;
        for (const w of kwWords) {
          if (qAccentlessWords.includes(w)) {
            matchCount++;
          }
        }
        const matchRatio = matchCount / kwWords.length;
        if (matchRatio >= 0.5) {
          score += matchRatio * 5;
        }
      }
    }
  }

  // 4. Synonym matching
  for (const syn of topic.synonyms || []) {
    const synNorm = normalizeText(syn);
    const synAccentless = removeVietnameseAccents(synNorm);
    
    if (qNorm === synNorm || qAccentless === synAccentless) {
      score += 10;
    } else if (qNorm.includes(synNorm) || qAccentless.includes(synAccentless)) {
      score += 7;
    } else {
      // Word overlap scoring
      const synWords = synAccentless.split(" ").filter(Boolean);
      if (synWords.length > 0) {
        let matchCount = 0;
        for (const w of synWords) {
          if (qAccentlessWords.includes(w)) {
            matchCount++;
          }
        }
        const matchRatio = matchCount / synWords.length;
        if (matchRatio >= 0.5) {
          score += matchRatio * 4;
        }
      }
    }
  }

  return score;
}

export function getAiHelpReply(question: string): AiHelpResponse {
  const qNorm = normalizeText(question);
  const qAccentless = removeVietnameseAccents(qNorm);
  const qWords = qNorm.split(" ").filter(Boolean);

  const defaultSuggestions = [
    "Cách thêm đơn giao?",
    "Cách lập tuyến giao hàng?",
    "Vì sao bản đồ không hiện?",
    "Cách backup dữ liệu?",
    "Tối ưu tuyến là gì?",
  ];

  if (!qNorm) {
    return {
      summary: "Vui lòng nhập câu hỏi hoặc chọn một câu hỏi gợi ý bên dưới nhé! 😊",
      suggestions: defaultSuggestions,
    };
  }

  // 1. Greeting detection
  const greetings = [
    "xin chao", "chao", "hello", "hi", "hey", "chao ban", "chao tro ly", 
    "chao ai", "tro ly oi", "ai oi", "chào bạn", "chào", "xin chào"
  ];
  if (
    greetings.some(
      (g) => 
        qNorm === g || 
        qAccentless === removeVietnameseAccents(g) || 
        qAccentless.startsWith(removeVietnameseAccents(g) + " ")
    )
  ) {
    return {
      summary: "Xin chào! 👋 Tôi là Trợ lý ShipRoute AI.\n\nTôi là trợ lý cục bộ (local) sẵn sàng hướng dẫn bạn chi tiết về cách vận hành ứng dụng ShipRoute AI.\n\nBạn muốn tìm hiểu chủ đề nào?",
      suggestions: defaultSuggestions,
    };
  }

  // 2. Thanks detection
  const thanks = ["cam on", "thank", "cảm ơn", "ok", "được rồi", "duoc roi", "cam on ban", "cám ơn", "thank you"];
  if (thanks.some((t) => qNorm === t || qAccentless.includes(removeVietnameseAccents(t)))) {
    return {
      summary: "Không có chi! 😊 Chúc bạn có những tuyến đường di chuyển thuận lợi và an toàn. Nếu có bất cứ câu hỏi nào khác, cứ tự nhiên hỏi tôi nhé!",
      suggestions: defaultSuggestions,
    };
  }

  // 3. System capabilities check
  if (
    qAccentless.includes("app co") || 
    qAccentless.includes("co tinh nang") || 
    qAccentless.includes("app co gi") || 
    qAccentless.includes("chuc nang") ||
    qAccentless.includes("tinh nang")
  ) {
    const names = getAllFeatureNames();
    return {
      summary: `📋 **Các tính năng chính của ShipRoute AI:**\n\n${names.slice(0, 15).map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nBạn có thể hỏi hướng dẫn chi tiết của từng tính năng bằng cách chọn câu hỏi hoặc gõ tìm kiếm trực tiếp.`,
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
        summary: "Hiện tại hệ thống hoạt động ổn định và chưa có tính năng mới được triển khai thêm. Bạn có thể kiểm tra lại sau nhé!",
        suggestions: defaultSuggestions,
      };
    }
    return {
      summary: `🆕 **Các tính năng mới / đang thử nghiệm:**\n\n${newFs.map((f) => `• **${f.name}**: ${f.shortDescription}`).join("\n")}\n\nBạn có thể hỏi chi tiết để được hướng dẫn thêm.`,
      suggestions: newFs.map((f) => `Cách dùng ${f.name}?`).slice(0, 4),
    };
  }

  // 4. Score all topics and find the best match
  const topics = getCombinedHelpTopics();
  const scoredTopics = topics
    .map((topic) => ({ topic, score: scoreTopic(question, topic) }))
    .filter((x) => x.score > 2.0) // Minimum score threshold to avoid garbage matches
    .sort((a, b) => b.score - a.score);

  if (scoredTopics.length === 0) {
    // Smart low-confidence fallback
    return {
      summary: "Mình chưa hiểu rõ câu hỏi này. 🤔\n\nBạn có thể hỏi mình về cách thêm đơn giao, lập tuyến giao hàng, cấu hình Google Maps API, backup dữ liệu, lỗi bản đồ không hiện, hoặc tối ưu tuyến.",
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
  let secondaryTopic: AiHelpResponse["secondaryTopic"] = undefined;

  // Check for Multi-Intent: If second best match is also very strong
  if (scoredTopics.length > 1 && scoredTopics[1].score >= 5.5 && qWords.length >= 4) {
    const secondMatch = scoredTopics[1].topic;
    if (secondMatch.id !== bestMatch.id) {
      secondaryTopic = {
        topicId: secondMatch.id,
        title: secondMatch.title,
        summary: secondMatch.summary,
        steps: secondMatch.steps,
        notes: secondMatch.notes,
        problems: secondMatch.problems,
        relatedRoute: secondMatch.relatedRoute,
        relatedRouteName: secondMatch.relatedRouteName,
      };
    }
  }

  // Gather dynamic suggestions
  let suggestions = bestMatch.suggestedFollowUps || [];
  if (suggestions.length === 0) {
    if (bestMatch.relatedModules && bestMatch.relatedModules.length > 0) {
      suggestions = bestMatch.relatedModules
        .map((mId) => {
          const found = topics.find((t) => t.id === mId);
          return found ? `Tìm hiểu ${found.title}?` : "";
        })
        .filter(Boolean)
        .slice(0, 4);
    }
  }

  if (suggestions.length === 0) {
    suggestions = defaultSuggestions;
  }

  return {
    topicId: bestMatch.id,
    title: bestMatch.title,
    summary: bestMatch.summary,
    steps: bestMatch.steps,
    notes: bestMatch.notes,
    problems: bestMatch.problems,
    relatedRoute: bestMatch.relatedRoute,
    relatedRouteName: bestMatch.relatedRouteName,
    suggestions: suggestions,
    secondaryTopic: secondaryTopic,
  };
}
