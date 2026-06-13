"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAiHelpReply, AiHelpResponse } from "@/lib/aiHelpEngine";
import { askServerAiHelp } from "@/lib/aiHelpClient";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  structured?: AiHelpResponse;
};

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

function MaximizeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function MinimizeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M10 14l-7 7" />
    </svg>
  );
}

const WELCOME_MESSAGE =
  "Xin chào! 👋 Tôi là Trợ lý ShipRoute AI.\n\nTôi có thể hướng dẫn bạn về:\n• Dashboard & tổng quan\n• Quản lý đơn giao\n• Lập tuyến đường\n• Google Maps API\n• Backup dữ liệu\n• Lỗi thường gặp\n\nHãy chọn câu hỏi gợi ý hoặc nhập câu hỏi bên dưới!";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Bắt đầu / Dashboard" },
  { id: "orders", label: "Quản lý đơn giao" },
  { id: "new_route", label: "Lập tuyến & tối ưu" },
  { id: "google_maps", label: "Cấu hình Google Maps" },
  { id: "backup", label: "Sao lưu & Backup" },
  { id: "customers", label: "Khách hàng thường xuyên" },
  { id: "troubleshooting", label: "Khắc phục sự cố" },
  { id: "settings", label: "Cấu hình xăng xe" }
];

/* ── Inline Safe Formatting Parser ────────────────────────────────── */

function formatText(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");
  let inList = false;
  let listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];

  const parseBold = (str: string) => {
    // Splits by **bold** tags and maps odd indices as strong nodes
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-sky-400">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
    
    if (isBullet) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      const bulletContent = trimmed.replace(/^[•\-*]\s*/, "");
      listItems.push(
        <li key={i} className="list-disc ml-5 mb-1 text-slate-300">
          {parseBold(bulletContent)}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`list-${i}`} className="space-y-1 my-2">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      if (trimmed === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="mb-1.5 text-slate-300">
            {parseBold(line)}
          </p>
        );
      }
    }
  });

  if (inList && listItems.length > 0) {
    elements.push(
      <ul key={`list-end`} className="space-y-1 my-2">
        {listItems}
      </ul>
    );
  }

  return elements;
}

const DEFAULT_QUESTIONS = [
  "Cách thêm đơn giao?",
  "Cách lập tuyến giao hàng?",
  "Cách lấy tọa độ?",
  "Vì sao bản đồ không hiện?",
  "Cách backup dữ liệu?",
  "Tối ưu tuyến là gì?",
];

export default function AiHelpWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const idRef = useRef<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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
        { 
          id: `m-${idRef.current++}`, 
          sender: "assistant", 
          text: WELCOME_MESSAGE,
          structured: {
            summary: WELCOME_MESSAGE,
            suggestions: DEFAULT_QUESTIONS
          }
        },
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
  }, [messages, open, isExpanded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
        setOpen(false);
      }
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
        const history = messages.map((m) => ({ 
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', 
          content: m.text 
        })).slice(-10);
        
        const res = await askServerAiHelp({ question: q, chatHistory: history });
        setMessages((m) => m.filter((x) => x.id !== loadingId));

        if (res.ok && res.answer) {
          const assistantMsg: Message = { 
            id: `a-${idRef.current++}`, 
            sender: 'assistant', 
            text: res.answer,
            structured: {
              summary: res.answer,
              suggestions: DEFAULT_QUESTIONS
            }
          };
          setMessages((m) => [...m, assistantMsg]);
          setQuickQuestions(DEFAULT_QUESTIONS);
          return;
        }

        const reply = getAiHelpReply(q);
        const assistantMsg: Message = { 
          id: `a-${idRef.current++}`, 
          sender: 'assistant', 
          text: reply.summary,
          structured: reply
        };
        setMessages((m) => [...m, assistantMsg]);
        setQuickQuestions(reply.suggestions);
      } catch {
        setMessages((m) => m.filter((x) => x.id !== loadingId));
        const reply = getAiHelpReply(q);
        const assistantMsg: Message = { 
          id: `a-${idRef.current++}`, 
          sender: 'assistant', 
          text: reply.summary,
          structured: reply
        };
        setMessages((m) => [...m, assistantMsg]);
        setQuickQuestions(reply.suggestions);
      }
      return;
    }

    const reply = getAiHelpReply(q);
    const assistantMsg: Message = { 
      id: `a-${idRef.current++}`, 
      sender: "assistant", 
      text: reply.summary,
      structured: reply
    };
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
      structured: {
        summary: WELCOME_MESSAGE,
        suggestions: DEFAULT_QUESTIONS
      }
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

  const handleSidebarClick = (topicId: string) => {
    const reply = getAiHelpReply(topicId);
    if (reply && reply.title) {
      sendQuestion(reply.title);
    }
  };

  /* ── Structured Content Renderer ────────────────────────────────── */

  const renderStructuredTopic = (topic: {
    title?: string;
    summary: string;
    steps?: string[];
    notes?: string[];
    problems?: string[];
    relatedRoute?: string;
    relatedRouteName?: string;
  }) => {
    return (
      <div className="space-y-3">
        {topic.title && (
          <h4 className="font-bold text-sky-400 text-base border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 shrink-0 text-sky-400" />
            {topic.title}
          </h4>
        )}
        
        {/* Summary (Tóm tắt) */}
        <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {formatText(topic.summary)}
        </div>

        {/* Steps (Cách làm) */}
        {topic.steps && topic.steps.length > 0 && (
          <div className="mt-3.5">
            <div className="text-xs font-bold text-sky-300/80 uppercase tracking-wider mb-2">Cách thực hiện:</div>
            <ol className="space-y-2">
              {topic.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-sky-950 border border-sky-500/30 text-sky-400 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{formatText(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Notes (Lưu ý) */}
        {topic.notes && topic.notes.length > 0 && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-slate-300">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Lưu ý quan trọng:</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
              {topic.notes.map((note, idx) => (
                <li key={idx}>{formatText(note)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Problems (Sự cố thường gặp) */}
        {topic.problems && topic.problems.length > 0 && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-slate-300">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Khắc phục sự cố:</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
              {topic.problems.map((prob, idx) => (
                <li key={idx}>{formatText(prob)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* App-aware action redirect button */}
        {topic.relatedRoute && topic.relatedRouteName && (
          <div className="mt-4 pt-1">
            <button
              onClick={() => {
                router.push(topic.relatedRoute!);
                setOpen(false);
                setIsExpanded(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-xl bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Đi tới {topic.relatedRouteName}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <>
      {/* ── Chat Widget Dialog ────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Trợ lý ShipRoute AI"
          aria-modal="true"
          className={
            isExpanded
              ? "fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in"
              : `fixed z-[9990] transition-all duration-300 ease-out ${
                  open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 pointer-events-none translate-y-4 scale-95"
                }`
          }
          style={
            isExpanded
              ? {}
              : {
                  transformOrigin: "bottom right",
                  bottom: "96px",
                  right: "12px",
                }
          }
        >
          <div
            className="flex flex-col overflow-hidden transition-all duration-300"
            style={
              isExpanded
                ? {
                    width: "100%",
                    maxWidth: "1150px",
                    height: "100%",
                    maxHeight: "85vh",
                    borderRadius: "24px",
                    background: "linear-gradient(180deg, #090d16 0%, #111827 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                    boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 50px rgba(14, 165, 233, 0.15)",
                  }
                : {
                    width: "min(calc(100vw - 24px), 430px)",
                    height: "min(80vh, 620px)",
                    borderRadius: "20px",
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.12)",
                    boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(14, 165, 233, 0.08)",
                  }
            }
          >
            {/* ── Header ─────────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 animate-float"
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
                <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                  Trợ lý ShipRoute AI
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">Local v1.2</span>
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
                  <span className="text-white/70 text-xs">Sẵn sàng hỗ trợ offline</span>
                </div>
              </div>
              
              {/* Header Action Controls */}
              <div className="flex items-center gap-0.5 shrink-0">
                {isExpanded ? (
                  <button
                    aria-label="Thu nhỏ trợ lý AI"
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="Thu nhỏ"
                  >
                    <MinimizeIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    aria-label="Phóng to trợ lý AI"
                    onClick={() => setIsExpanded(true)}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="Mở rộng"
                  >
                    <MaximizeIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  aria-label="Xóa cuộc trò chuyện"
                  onClick={clearChat}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  title="Xóa hội thoại"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <button
                  aria-label="Đóng trợ lý AI"
                  onClick={() => {
                    setOpen(false);
                    setIsExpanded(false);
                  }}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  title="Đóng"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Content Layout ─────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar Left: ONLY in Fullscreen/Expanded Mode */}
              {isExpanded && (
                <div className="hidden md:block w-64 shrink-0 border-r border-slate-800 bg-slate-950/40 p-4 space-y-1.5 overflow-y-auto premium-scrollbar">
                  <div className="text-[11px] font-bold text-sky-400/80 uppercase tracking-wider px-3.5 mb-3">
                    Chủ đề hướng dẫn nhanh
                  </div>
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarClick(item.id)}
                      className="w-full text-left text-xs py-2.5 px-3.5 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/15 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Panel Content (Messages, Suggestions, Input) */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/10">
                
                {/* Message list */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 premium-scrollbar"
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
                            width: 30,
                            height: 30,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                          }}
                        >
                          <SparklesIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`${isExpanded ? "max-w-[70%]" : "max-w-[85%]"} text-sm leading-relaxed`}
                        style={{
                          padding: "12px 16px",
                          borderRadius:
                            m.sender === "user"
                              ? "20px 20px 4px 20px"
                              : "20px 20px 20px 4px",
                          background:
                            m.sender === "user"
                              ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                              : "rgba(30, 41, 59, 0.8)",
                          color:
                            m.sender === "user"
                              ? "#ffffff"
                              : "#f1f5f9",
                          backdropFilter: m.sender === "assistant" ? "blur(12px)" : undefined,
                          border: m.sender === "assistant" ? "1px solid rgba(148, 163, 184, 0.1)" : undefined,
                          boxShadow: m.sender === "assistant" ? "0 4px 15px -3px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(14, 165, 233, 0.15)"
                        }}
                      >
                        {m.sender === "user" ? (
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        ) : m.structured ? (
                          <>
                            {renderStructuredTopic(m.structured)}
                            
                            {/* Secondary multi-intent topic display */}
                            {m.structured.secondaryTopic && (
                              <div className="mt-5 pt-5 border-t border-slate-700/50 space-y-3">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Chủ đề liên quan bổ sung: {m.structured.secondaryTopic.title}
                                </div>
                                {renderStructuredTopic(m.structured.secondaryTopic)}
                              </div>
                            )}
                          </>
                        ) : (
                          formatText(m.text)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic suggestion chips */}
                <div
                  className="px-4 py-2 shrink-0 border-t border-slate-800/40"
                  style={{ background: "rgba(15, 23, 42, 0.15)" }}
                >
                  <div
                    className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto premium-scrollbar"
                    aria-label="Câu hỏi gợi ý"
                  >
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        className="text-xs py-1.5 px-3 rounded-full transition-all duration-200 border text-slate-400 border-slate-800 bg-slate-900/50 hover:bg-sky-500/15 hover:text-sky-300 hover:border-sky-500/30 focus-visible:ring-2 focus-visible:ring-sky-500"
                        onClick={() => sendQuestion(q)}
                        tabIndex={0}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input and Send button */}
                <div className="px-4 pb-4 pt-2 shrink-0 border-t border-slate-800/20">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                      aria-label="Nhập câu hỏi về cách dùng ShipRoute AI"
                      placeholder="Hỏi trợ lý về cách thêm đơn, lập tuyến, google maps..."
                      className="flex-1 text-sm outline-none bg-slate-900/70 border border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200"
                      style={{
                        padding: "12px 18px",
                        borderRadius: "16px",
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
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Gửi tin nhắn"
                      className="shrink-0 flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-500"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "16px",
                        background: input.trim()
                          ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                          : "rgba(51, 65, 85, 0.4)",
                        color: input.trim() ? "#ffffff" : "#64748b",
                        cursor: input.trim() ? "pointer" : "not-allowed",
                        boxShadow: input.trim() ? "0 4px 12px rgba(14, 165, 233, 0.25)" : "none",
                      }}
                    >
                      <SendIcon className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ─────────────────────────────── */}
      <button
        aria-label={open ? "Đóng trợ lý ShipRoute AI" : "Mở trợ lý ShipRoute AI"}
        id="ai-help-toggle"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-5 right-3 sm:right-5 z-[9990] flex items-center justify-center transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-sky-500"
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
            className="absolute inset-0 rounded-full animate-ping animate-pulse-glow"
            style={{
              background: "rgba(14, 165, 233, 0.15)",
              animationDuration: "2.5s",
            }}
          />
        )}

        {/* Online status indicator dot */}
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
