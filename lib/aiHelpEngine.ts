import { HELP_TOPICS, HelpTopic } from "./appHelpKnowledge";
import { appFeatures, AppFeature } from "./appFeatureRegistry";

function normalize(text: string): string {
  // Remove diacritics, lowercase, remove punctuation, normalize spaces
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[.,!?/\\()\[\]{}"'`@:;–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function featureToTopic(f: AppFeature): HelpTopic {
  return {
    id: f.id,
    title: f.name,
    keywords: f.keywords,
    summary: f.shortDescription,
    steps: f.userGuide,
    relatedModules: f.relatedFeatures,
  } as HelpTopic;
}

export function getAllFeatureNames(): string[] {
  return appFeatures.map((f) => f.name);
}

export function getNewFeatures(): AppFeature[] {
  return appFeatures.filter((f) => f.status === "new" || f.status === "beta");
}

export function searchFeatures(question: string): AppFeature[] {
  const q = normalize(question);
  if (!q) return [];
  const qWords = q.split(" ");
  const results: Array<{ f: AppFeature; score: number }> = [];

  for (const f of appFeatures) {
    let s = 0;
    const allKeys = [...f.keywords, f.id, f.name];
    for (const kw of allKeys) {
      const nkw = normalize(kw);
      if (!nkw) continue;
      if (nkw.split(" ").every((w) => qWords.includes(w))) s += 4;
      else if (q.includes(nkw)) s += 3;
      else {
        for (const w of nkw.split(" ")) {
          if (w && qWords.includes(w)) s += 1.5;
          else if (w && q.includes(w)) s += 1;
        }
      }
    }
    if (q.includes(normalize(f.id))) s += 2;
    if (s > 0) results.push({ f, score: s });
  }

  results.sort((a, b) => b.score - a.score);
  return results.map((r) => r.f);
}

export function getFeatureReply(question: string): string {
  const found = searchFeatures(question);
  if (found.length === 0) return "Không tìm thấy tính năng phù hợp. Bạn có thể hỏi 'App có những tính năng gì?' hoặc xem danh sách tính năng.";
  const f = found[0];
  let reply = `🔎 ${f.name}\n${f.shortDescription}`;
  if (f.userGuide && f.userGuide.length > 0) {
    reply += "\n\nHướng dẫn (các bước):\n" + f.userGuide.map((s, i) => `${i + 1}. ${s}`).join("\n");
  }
  if (f.commonQuestions && f.commonQuestions.length > 0) {
    reply += "\n\nCâu hỏi thường gặp:\n" + f.commonQuestions.map((q) => `- ${q.question}: ${q.answer}`).join("\n");
  }
  if (f.troubleshooting && f.troubleshooting.length > 0) {
    reply += "\n\nKhắc phục sự cố:\n" + f.troubleshooting.map((t) => `- ${t.problem}: ${t.solution}`).join("\n");
  }
  return reply;
}

export function getFeatureHelpTopics(): HelpTopic[] {
  return appFeatures.map(featureToTopic);
}

export function getCombinedHelpTopics(): HelpTopic[] {
  const dynamic = getFeatureHelpTopics();
  return [...HELP_TOPICS, ...dynamic];
}

export function getAiHelpReply(question: string): string {
  const q = normalize(question);
  if (!q) {
    return "Vui lòng nhập câu hỏi hoặc chọn một câu hỏi gợi ý.";
  }

  // special queries
  if (q.includes("app có") || q.includes("có tính năng")) {
    const names = getAllFeatureNames();
    return `Các tính năng chính của app: ${names.slice(0, 12).join(", ")}.\nBạn có thể hỏi "Tính năng mới là gì?" hoặc "Hướng dẫn dùng [tên tính năng]".`;
  }

  if (q.includes("tính năng mới") || q.includes("có gì mới") || q.includes("mới")) {
    const newFs = getNewFeatures();
    if (newFs.length === 0) return "Hiện chưa có tính năng mới. Bạn có thể kiểm tra lại sau.";
    return (
      "Các tính năng mới / beta:\n" +
      newFs.map((f) => `- ${f.name}: ${f.shortDescription}`).join("\n") +
      "\n\nBạn có thể hỏi 'Hướng dẫn dùng <tên tính năng>' để xem chi tiết."
    );
  }

  // check if user asks guidance about specific feature
  if (q.startsWith("hướng dẫn") || q.startsWith("cách") || q.startsWith("làm sao") || q.includes("hướng dẫn dùng") || q.includes("cách sử dụng")) {
    const featureReply = getFeatureReply(question);
    if (!featureReply.includes("Không tìm thấy tính năng")) return featureReply;
  }

  // fallback to combined topics matching
  const topics = getCombinedHelpTopics();
  // simple scoring similar to previous implementation
  const qWords = q.split(" ");
  const scores: Array<{ topic: HelpTopic; score: number }> = [];

  for (const t of topics) {
    let s = 0;
    for (const kw of t.keywords || []) {
      const nkw = normalize(kw);
      if (nkw.split(" ").every((w) => qWords.includes(w))) s += 4;
      else if (q.includes(nkw)) s += 3;
      else {
        for (const w of nkw.split(" ")) {
          if (w && qWords.includes(w)) s += 1.5;
        }
      }
    }
    if (q.includes(normalize(t.id))) s += 2;
    if (s > 0) scores.push({ topic: t, score: s });
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    const suggestions = topics.slice(0, 8).map((t) => t.title).join(", ");
    return `Mình chưa hiểu rõ. Bạn có thể hỏi về: ${suggestions}.`;
  }

  const best = scores[0].topic;
  let reply = `🔎 ${best.title}\n${best.summary}`;
  if (best.steps && best.steps.length > 0) reply += "\n\nHướng dẫn (các bước):\n" + best.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return reply;
}
