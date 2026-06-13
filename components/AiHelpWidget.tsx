"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAiHelpReply } from "@/lib/aiHelpEngine";

type Message = { id: string; sender: "user" | "assistant"; text: string };

export default function AiHelpWidget() {
  const [open, setOpen] = useState(false);
  const idRef = useRef<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // set welcome asynchronously to avoid sync setState-in-effect lint rule
    const t = setTimeout(() => {
      if (messages.length === 0) {
        setMessages([
          {
            id: `m-${idRef.current++}`,
            sender: "assistant",
            text:
              "Xin chào! Tôi là Trợ lý ShipRoute AI. Tôi có thể hướng dẫn bạn quản lý đơn giao, lập tuyến, dùng bản đồ, lấy tọa độ, backup dữ liệu, xem báo cáo và xử lý lỗi thường gặp.",
          },
        ]);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // auto-scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendQuestion = (q: string) => {
    if (!q.trim()) return;
    const uid = idRef.current++;
    const userMsg: Message = { id: `u-${uid}`, sender: "user", text: q };
    setMessages((m) => [...m, userMsg]);

    // compute reply (local rule-based)
    const replyText = getAiHelpReply(q);
    const assistantMsg: Message = { id: `a-${idRef.current++}`, sender: "assistant", text: replyText };

    // simulate small delay
    setTimeout(() => setMessages((m) => [...m, assistantMsg]), 200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendQuestion(input.trim());
    setInput("");
  };

  const quickQuestions = [
    "Cách thêm đơn giao?",
    "Cách lập tuyến?",
    "Cách lấy tọa độ?",
    "Vì sao bản đồ không hiện?",
    "Cách backup dữ liệu?",
    "Dữ liệu có bị mất không?",
    "Cách cấu hình API key?",
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
        <div className="w-[360px] md:w-[420px] max-h-[70vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="font-bold">Trợ lý ShipRoute AI</div>
              <div className="text-xs text-slate-500">Hỏi tôi cách dùng app, lỗi thường gặp, backup...</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Đóng trợ lý"
                className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300"
                onClick={() => setOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="p-3 space-y-3 overflow-y-auto flex-1">
            {messages.map((m) => (
              <div key={m.id} className={m.sender === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm leading-snug ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                  }`}
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
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full whitespace-nowrap text-slate-700 hover:bg-slate-200"
                  onClick={() => sendQuestion(q)}
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
