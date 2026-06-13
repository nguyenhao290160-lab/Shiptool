"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAiHelpReply } from "@/lib/aiHelpEngine";
import { askServerAiHelp } from "@/lib/aiHelpClient";

type Message = { id: string; sender: "user" | "assistant"; text: string };

const CHAT_KEY = "shiproute_ai_help_chat";
const OPEN_KEY = "shiproute_ai_help_open";
const MAX_MESSAGES = 30;

export default function AiHelpWidget() {
  const [open, setOpen] = useState(false);
  const idRef = useRef<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // load saved chat (async to avoid sync state-in-effect rule)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(CHAT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.slice(-MAX_MESSAGES));
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

  }, []);

  // save chat (trimmed)
  useEffect(() => {
    try {
      const toSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_KEY, JSON.stringify(toSave));
    } catch {}
  }, [messages]);

  // save open state
  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {}
  }, [open]);

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

  return (
    <div>
      {/* Panel */}
      <div
        aria-hidden={!open}
        className={`fixed bottom-20 right-5 z-50 transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
        }`}
      >
        <div className="w-[calc(100vw-2rem)] sm:w-[360px] md:w-[420px] max-h-[75vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="font-bold">Trợ lý ShipRoute AI</div>
              <div className="text-xs text-slate-500">Hỏi tôi cách dùng app, lỗi thường gặp, backup...</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Xóa hội thoại"
                className="text-xs text-red-500 hover:underline mr-2 focus:ring-2 focus:ring-red-400"
                onClick={clearChat}
                tabIndex={0}
              >
                Xóa chat
              </button>
              <button
                aria-label="Đóng trợ lý"
                className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 focus:ring-2 focus:ring-cyan-400"
                onClick={() => setOpen(false)}
                tabIndex={0}
              >
                Đóng
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="p-3 space-y-3 overflow-y-auto flex-1" tabIndex={0} aria-label="Lịch sử chat AI">
            {messages.map((m) => (
              <div key={m.id} className={m.sender === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm leading-snug ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                  }`}
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

          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2 mb-2 overflow-x-auto" aria-label="Câu hỏi gợi ý">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full whitespace-nowrap text-slate-700 hover:bg-slate-200 focus:ring-2 focus:ring-cyan-400"
                  onClick={() => sendQuestion(q)}
                  tabIndex={0}
                >
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                aria-label="Nhập câu hỏi về cách dùng app"
                placeholder="Nhập câu hỏi về cách dùng app..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
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
                className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                  input.trim()
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        aria-label="Mở trợ lý ShipRoute AI"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-full shadow-lg hover:shadow-2xl"
      >
        <span className="font-bold">AI</span>
        <span className="hidden sm:inline">Trợ lý</span>
      </button>
    </div>
  );
}
