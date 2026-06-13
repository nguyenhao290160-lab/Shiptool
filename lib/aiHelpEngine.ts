import { HELP_TOPICS, HelpTopic } from "./appHelpKnowledge";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?/\\()\[\]{}"'`@:;–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAiHelpReply(question: string): string {
  const q = normalize(question);
  if (!q) {
    return "Vui lòng nhập câu hỏi hoặc chọn một câu hỏi gợi ý.";
  }

  // simple keyword scoring
  const qWords = q.split(" ");
  const scores: Array<{ topic: HelpTopic; score: number }> = [];

  for (const t of HELP_TOPICS) {
    let s = 0;
    for (const kw of t.keywords) {
      const nkw = normalize(kw);
      if (nkw.split(" ").every((w) => qWords.includes(w))) {
        s += 3;
      } else if (q.includes(nkw)) {
        s += 2;
      } else {
        // partial match by words
        for (const w of nkw.split(" ")) {
          if (w && qWords.includes(w)) s += 1;
        }
      }
    }
    if (s > 0) scores.push({ topic: t, score: s });
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    // fallback suggestions
    const suggestions = HELP_TOPICS.slice(0, 6).map((t) => t.title).join(", ");
    return `Mình chưa chắc hiểu câu hỏi. Bạn có thể hỏi về: ${suggestions}.\n\nHoặc thử các câu gợi ý ở bên dưới.`;
  }

  // pick best
  const best = scores[0].topic;
  const related = HELP_TOPICS.filter((t) =>
    (best.relatedModules || []).some((r) => t.id.toLowerCase().includes(r.toLowerCase()))
  )
    .slice(0, 3)
    .map((t) => t.title);

  let reply = `🔎 ${best.title}\n${best.summary}`;
  if (best.steps && best.steps.length > 0) {
    reply += "\n\nHướng dẫn (các bước):\n";
    reply += best.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  }

  if (related.length > 0) {
    reply += `\n\nGợi ý liên quan: ${related.join(", ")}`;
  }

  return reply;
}
