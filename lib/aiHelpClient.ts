type ChatItem = { role: "user" | "assistant"; content: string };

export async function askServerAiHelp(params: {
  question: string;
  chatHistory?: ChatItem[];
  timeoutMs?: number;
}): Promise<{
  ok: boolean;
  answer?: string;
  fallbackToLocal?: boolean;
  error?: string;
}> {
  const { question, chatHistory, timeoutMs = 8000 } = params;

  if (typeof window !== "undefined" && !navigator.onLine) {
    return { ok: false, fallbackToLocal: true, error: "Offline" };
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("/api/ai-help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, chatHistory: (chatHistory || []).slice(-10) }),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      try {
        const j = await res.json();
        return { ok: false, fallbackToLocal: Boolean(j?.fallbackToLocal), error: j?.message || "Server error" };
      } catch {
        return { ok: false, fallbackToLocal: true, error: "Server error" };
      }
    }

    const j = await res.json();
    return { ok: Boolean(j?.ok), answer: j?.answer, fallbackToLocal: Boolean(j?.fallbackToLocal), error: j?.message };
  } catch (unknownErr) {
    // Avoid using `any` to satisfy lint rules
    const err = unknownErr as Error | { name?: string; message?: string } | undefined;
    if (err && (err as { name?: string }).name === "AbortError") return { ok: false, fallbackToLocal: true, error: "Timeout" };
    return { ok: false, fallbackToLocal: true, error: err?.message ?? "Network error" };
  } finally {
    clearTimeout(id);
  }
}
