"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAiHelpReply } from "@/lib/aiHelpEngine";
import { askServerAiHelp } from "@/lib/aiHelpClient";

type Message = { id: string; sender: "user" | "assistant"; text: string };

const CHAT_KEY = "shiproute_ai_help_chat";
const OPEN_KEY = "shiproute_ai_help_open";
const MAX_MESSAGES = 30;

/* ── Inline SVG Icons (no external deps required) ──────────────────── */

function BotIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <path d="M9 19h6" />
    </svg>
  );
}

function SendIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

function MessageCircleIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

export default function AiHelpWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const idRef = useRef<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Only render after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // load saved chat after mount
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(CHAT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.slice(-MAX_MESSAGES));
            // restore open state if saved
            try {
              const openSaved = localStorage.getItem(OPEN_KEY);
              if (openSaved === "1") setOpen(true);
            } catch {}
            return;
          }
        }
      } catch {
        // ignore
      }
      // no saved messages -> welcome
      setMessages([
        {
          id: `m-${idRef.current++}`,
          sender: "assistant",
          text:
            "Xin chào! Tôi là Trợ lý ShipRoute AI. Tôi có thể hướng dẫn bạn quản lý đơn giao, lập tuyến, dùng bản đồ, lấy tọa độ, backup dữ liệu, xem báo cáo và xử lý lỗi thường gặp.",
        },
      ]);

      // restore open state if saved
      try {
        const openSaved = localStorage.getItem(OPEN_KEY);
        if (openSaved === "1") setOpen(true);
      } catch {}
    }, 0);

    return () => clearTimeout(t);
  }, [mounted]);

  // save chat (trimmed)
  useEffect(() => {
    if (!mounted) return;
    try {
      const toSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_KEY, JSON.stringify(toSave));
    } catch {}
  }, [messages, mounted]);

  // save open state
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {}
  }, [open, mounted]);

  useEffect(() => {
    // auto-scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sendQuestion = async (q: string) => {
    if (!q.trim()) return;
    const uid = idRef.current++;
    const userMsg: Message = { id: `u-${uid}`, sender: "user", text: q };
    setMessages((m) => [...m, userMsg]);

    // If server-side AI enabled via env flag, try server first
    const aiEnabled = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_AI_HELP_ENABLED === 'true');

    if (aiEnabled && typeof navigator !== 'undefined' && navigator.onLine) {
      // show loading assistant message
      const loadingId = `a-${idRef.current++}`;
      const loadingMsg: Message = { id: loadingId, sender: 'assistant', text: 'Đang suy nghĩ...' };
      setMessages((m) => [...m, loadingMsg]);

      try {
        const history: { role: 'user' | 'assistant'; content: string }[] = messages.map((m) => ({ role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })).slice(-10);
        const res = await askServerAiHelp({ question: q, chatHistory: history });
        // remove loading message and append final
        setMessages((m) => m.filter((x) => x.id !== loadingId));

        if (res.ok && res.answer) {
          const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: res.answer };
          setMessages((m) => [...m, assistantMsg]);
          return;
        }

        // fallback to local rule-based
        const replyText = getAiHelpReply(q);
        const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: replyText };
        setMessages((m) => [...m, assistantMsg]);
      } catch {
        // On error, fallback to local
        setMessages((m) => m.filter((x) => x.id !== loadingId));
        const replyText = getAiHelpReply(q);
        const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: replyText };
        setMessages((m) => [...m, assistantMsg]);
      }

      return;
    }

    // Default: local rule-based reply
    const replyText = getAiHelpReply(q);
    const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: "assistant", text: replyText };
    // simulate small delay
    setTimeout(() => setMessages((m) => [...m, assistantMsg]), 200);
  };

  // Clear chat with confirmation
  const clearChat = () => {
    if (!confirm("Xóa lịch sử chat trợ lý? Hành động này không thể hoàn tác.")) return;
    const welcome: Message = {
      id: `m-${idRef.current++}`,
      sender: "assistant",
      text:
        "Xin chào! Tôi là Trợ lý ShipRoute AI. Tôi có thể hướng dẫn bạn quản lý đơn giao, lập tuyến, dùng bản đồ, lấy tọa độ, backup dữ liệu, xem báo cáo và xử lý lỗi thường gặp.",
    };
    setMessages([welcome]);
    try {
      localStorage.removeItem(CHAT_KEY);
    } catch {}
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendQuestion(input.trim());
    setInput("");
  };

  const quickQuestions = [
    "Cách thêm đơn giao?",
    "Cách lập tuyến giao hàng?",
    "Cách lấy tọa độ?",
    "Vì sao bản đồ không hiện?",
    "Cách tối ưu tuyến?",
    "Cách backup dữ liệu?",
    "Cách import backup?",
    "Cách xem báo cáo?",
    "Dữ liệu có bị mất không?",
    "Cách cấu hình API key?",
    "App có chạy offline không?",
    "Cách thêm khách hàng thường xuyên?",
    "Cách tính chi phí vận hành?",
    "Làm sao deploy Vercel?",
  ];

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <>
      {/* ── Chat Panel ──────────────────────────────────────────────── */}
      <div
        aria-hidden={!open}
        role="dialog"
        aria-label="Trợ lý ShipRoute AI"
        className={`fixed bottom-24 right-3 sm:right-5 z-[9990] transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 pointer-events-none translate-y-4 scale-95"
        }`}
        style={{ transformOrigin: "bottom right" }}
      >
        <div
          className="flex flex-col overflow-hidden shadow-2xl border"
          style={{
            width: "min(calc(100vw - 24px), 400px)",
            maxHeight: "min(75vh, 600px)",
            borderRadius: "20px",
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
            borderColor: "rgba(148, 163, 184, 0.15)",
          }}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm leading-tight">
                Trợ lý ShipRoute AI
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    background: "#4ade80",
                    boxShadow: "0 0 6px rgba(74,222,128,0.6)",
                  }}
                />
                <span className="text-white/70 text-xs">Sẵn sàng hỗ trợ</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                aria-label="Xóa hội thoại"
                onClick={clearChat}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Xóa hội thoại"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button
                aria-label="Đóng trợ lý"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Đóng"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ───────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3"
            tabIndex={0}
            aria-label="Lịch sử chat AI"
            style={{ minHeight: 200 }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div
                    className="shrink-0 flex items-center justify-center mr-2 mt-1"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    }}
                  >
                    <SparklesIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className="max-w-[80%] text-sm leading-relaxed"
                  style={{
                    padding: "10px 14px",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                        : "rgba(51, 65, 85, 0.6)",
                    color:
                      m.sender === "user"
                        ? "#ffffff"
                        : "#e2e8f0",
                    backdropFilter: m.sender === "assistant" ? "blur(8px)" : undefined,
                  }}
                  role="region"
                  aria-live="polite"
                >
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Suggestion Chips ────────────────────────────────────── */}
          <div
            className="px-4 pt-2 pb-1 shrink-0"
            style={{ borderTop: "1px solid rgba(148, 163, 184, 0.1)" }}
          >
            <div
              className="flex flex-wrap gap-1.5"
              aria-label="Câu hỏi gợi ý"
            >
              {quickQuestions.slice(0, 6).map((q) => (
                <button
                  key={q}
                  className="text-xs py-1.5 px-3 rounded-full transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: "rgba(51, 65, 85, 0.5)",
                    color: "#94a3b8",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                    e.currentTarget.style.color = "#38bdf8";
                    e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(51, 65, 85, 0.5)";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.15)";
                  }}
                  onClick={() => sendQuestion(q)}
                  tabIndex={0}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input Area ──────────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                aria-label="Nhập câu hỏi về cách dùng app"
                placeholder="Hỏi bất cứ điều gì..."
                className="flex-1 text-sm outline-none placeholder-slate-500"
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "rgba(51, 65, 85, 0.5)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  color: "#e2e8f0",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                aria-label="Gửi tin nhắn"
                className="shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: input.trim()
                    ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                    : "rgba(51, 65, 85, 0.5)",
                  color: input.trim() ? "#ffffff" : "#64748b",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  transform: "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Floating Button ─────────────────────────────────────────── */}
      <button
        aria-label={open ? "Đóng trợ lý ShipRoute AI" : "Mở trợ lý ShipRoute AI"}
        id="ai-help-toggle"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-5 right-5 z-[9990] flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          width: 60,
          height: 60,
          borderRadius: "9999px",
          background: open
            ? "linear-gradient(135deg, #475569, #334155)"
            : "linear-gradient(135deg, #0ea5e9, #6366f1)",
          boxShadow: open
            ? "0 4px 14px rgba(71, 85, 105, 0.3)"
            : "0 4px 20px rgba(14, 165, 233, 0.35), 0 0 40px rgba(99, 102, 241, 0.15)",
          transform: "scale(1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
      >
        {open ? (
          <XIcon className="w-6 h-6 text-white" />
        ) : (
          <MessageCircleIcon className="w-7 h-7 text-white" />
        )}

        {/* Pulse ring when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: "rgba(14, 165, 233, 0.2)",
              animationDuration: "2.5s",
            }}
          />
        )}
      </button>
    </>
  );
}
