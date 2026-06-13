"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAiHelpReply } from "@/lib/aiHelpEngine";
import { askServerAiHelp } from "@/lib/aiHelpClient";

type Message = { id: string; sender: "user" | "assistant"; text: string };

const CHAT_KEY = "shiproute_ai_help_chat";
const OPEN_KEY = "shiproute_ai_help_open";
const MAX_MESSAGES = 30;

/* ── Inline SVG Icons ──────────────────────────────────────────────── */

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

const WELCOME_MESSAGE =
  "Xin chào! 👋 Tôi là Trợ lý ShipRoute AI.\n\nTôi có thể hướng dẫn bạn về:\n• Dashboard & tổng quan\n• Quản lý đơn giao\n• Lập tuyến đường\n• Google Maps API\n• Backup dữ liệu\n• Lỗi thường gặp\n\nHãy chọn câu hỏi gợi ý hoặc nhập câu hỏi bên dưới!";

export default function AiHelpWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const idRef = useRef<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const DEFAULT_QUESTIONS = [
    "Cách thêm đơn giao?",
    "Cách lập tuyến giao hàng?",
    "Cách lấy tọa độ?",
    "Vì sao bản đồ không hiện?",
    "Cách backup dữ liệu?",
    "Tối ưu tuyến là gì?",
  ];
  const [quickQuestions, setQuickQuestions] = useState<string[]>(DEFAULT_QUESTIONS);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(CHAT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.slice(-MAX_MESSAGES));
            try {
              const openSaved = localStorage.getItem(OPEN_KEY);
              if (openSaved === "1") setOpen(true);
            } catch { /* ignore */ }
            return;
          }
        }
      } catch { /* ignore */ }
      setMessages([
        { id: `m-${idRef.current++}`, sender: "assistant", text: WELCOME_MESSAGE },
      ]);
      try {
        const openSaved = localStorage.getItem(OPEN_KEY);
        if (openSaved === "1") setOpen(true);
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      const toSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [messages, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch { /* ignore */ }
  }, [open, mounted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

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

    const aiEnabled = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_AI_HELP_ENABLED === 'true');

    if (aiEnabled && typeof navigator !== 'undefined' && navigator.onLine) {
      const loadingId = `a-${idRef.current++}`;
      const loadingMsg: Message = { id: loadingId, sender: 'assistant', text: 'Đang suy nghĩ...' };
      setMessages((m) => [...m, loadingMsg]);

      try {
        const history: { role: 'user' | 'assistant'; content: string }[] = messages.map((m) => ({ role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })).slice(-10);
        const res = await askServerAiHelp({ question: q, chatHistory: history });
        setMessages((m) => m.filter((x) => x.id !== loadingId));

        if (res.ok && res.answer) {
          const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: res.answer };
          setMessages((m) => [...m, assistantMsg]);
          setQuickQuestions(DEFAULT_QUESTIONS);
          return;
        }

        const reply = getAiHelpReply(q);
        const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: reply.text };
        setMessages((m) => [...m, assistantMsg]);
        setQuickQuestions(reply.suggestions);
      } catch {
        setMessages((m) => m.filter((x) => x.id !== loadingId));
        const reply = getAiHelpReply(q);
        const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: 'assistant', text: reply.text };
        setMessages((m) => [...m, assistantMsg]);
        setQuickQuestions(reply.suggestions);
      }
      return;
    }

    const reply = getAiHelpReply(q);
    const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: "assistant", text: reply.text };
    setTimeout(() => {
      setMessages((m) => [...m, assistantMsg]);
      setQuickQuestions(reply.suggestions);
    }, 200);
  };

  const clearChat = () => {
    if (!confirm("Xóa lịch sử chat trợ lý? Hành động này không thể hoàn tác.")) return;
    const welcome: Message = {
      id: `m-${idRef.current++}`,
      sender: "assistant",
      text: WELCOME_MESSAGE,
    };
    setMessages([welcome]);
    setQuickQuestions(DEFAULT_QUESTIONS);
    try { localStorage.removeItem(CHAT_KEY); } catch { /* ignore */ }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendQuestion(input.trim());
    setInput("");
  };



  if (!mounted) return null;

  return (
    <>
      {/* ── Chat Panel ────────────────────────────────────────────── */}
      <div
        aria-hidden={!open}
        role="dialog"
        aria-label="Trợ lý ShipRoute AI"
        className={`fixed z-[9990] transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 pointer-events-none translate-y-4 scale-95"
        }`}
        style={{
          transformOrigin: "bottom right",
          bottom: "96px",
          right: "12px",
        }}
      >
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: "min(calc(100vw - 24px), 420px)",
            maxHeight: "min(80vh, 620px)",
            borderRadius: "20px",
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid rgba(148, 163, 184, 0.12)",
            boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(14, 165, 233, 0.08)",
          }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: "14px",
                background: "rgba(255,255,255,0.18)",
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
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                aria-label="Xóa hội thoại"
                onClick={clearChat}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Xóa hội thoại"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button
                aria-label="Đóng trợ lý"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Đóng"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ───────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3 premium-scrollbar"
            tabIndex={0}
            aria-label="Lịch sử chat AI"
            style={{ minHeight: 220 }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              >
                {m.sender === "assistant" && (
                  <div
                    className="shrink-0 flex items-center justify-center mr-2.5 mt-1"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    }}
                  >
                    <SparklesIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className="max-w-[82%] text-sm leading-relaxed"
                  style={{
                    padding: "10px 14px",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                        : "rgba(51, 65, 85, 0.5)",
                    color:
                      m.sender === "user"
                        ? "#ffffff"
                        : "#e2e8f0",
                    backdropFilter: m.sender === "assistant" ? "blur(8px)" : undefined,
                    border: m.sender === "assistant" ? "1px solid rgba(148, 163, 184, 0.08)" : undefined,
                  }}
                  role="region"
                  aria-live="polite"
                >
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} className={`whitespace-pre-wrap ${i > 0 ? "mt-1" : ""}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Suggestion Chips ──────────────────────────────── */}
          <div
            className="px-4 pt-2 pb-1 shrink-0"
            style={{ borderTop: "1px solid rgba(148, 163, 184, 0.08)" }}
          >
            <div
              className="flex flex-wrap gap-1.5"
              aria-label="Câu hỏi gợi ý"
            >
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="text-xs py-1.5 px-3 rounded-full transition-all duration-200 whitespace-nowrap border"
                  style={{
                    background: "rgba(51, 65, 85, 0.4)",
                    color: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.12)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.15)";
                    e.currentTarget.style.color = "#38bdf8";
                    e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(51, 65, 85, 0.4)";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.12)";
                  }}
                  onClick={() => sendQuestion(q)}
                  tabIndex={0}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input Area ────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                aria-label="Nhập câu hỏi về cách dùng app"
                placeholder="Hỏi bất cứ điều gì..."
                className="flex-1 text-sm outline-none placeholder-slate-500"
                style={{
                  padding: "11px 16px",
                  borderRadius: "14px",
                  background: "rgba(51, 65, 85, 0.4)",
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  color: "#e2e8f0",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.4)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.12)";
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
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  background: input.trim()
                    ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                    : "rgba(51, 65, 85, 0.4)",
                  color: input.trim() ? "#ffffff" : "#64748b",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  transform: "scale(1)",
                  boxShadow: input.trim() ? "0 4px 12px rgba(14, 165, 233, 0.2)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = input.trim() ? "0 4px 12px rgba(14, 165, 233, 0.2)" : "none";
                }}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Floating Button ─────────────────────────────────────── */}
      <button
        aria-label={open ? "Đóng trợ lý ShipRoute AI" : "Mở trợ lý ShipRoute AI"}
        id="ai-help-toggle"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-5 right-3 sm:right-5 z-[9990] flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          width: 60,
          height: 60,
          borderRadius: "9999px",
          background: open
            ? "linear-gradient(135deg, #475569, #334155)"
            : "linear-gradient(135deg, #0ea5e9, #6366f1)",
          boxShadow: open
            ? "0 4px 14px rgba(71, 85, 105, 0.3)"
            : "0 4px 24px rgba(14, 165, 233, 0.3), 0 0 40px rgba(99, 102, 241, 0.12)",
          transform: "scale(1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.93)";
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
              background: "rgba(14, 165, 233, 0.15)",
              animationDuration: "2.5s",
            }}
          />
        )}

        {/* Online indicator dot */}
        {!open && (
          <span
            className="absolute"
            style={{
              top: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: "9999px",
              background: "#4ade80",
              border: "2.5px solid #1e293b",
              boxShadow: "0 0 6px rgba(74,222,128,0.5)",
            }}
          />
        )}
      </button>
    </>
  );
}
