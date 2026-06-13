import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";


    if (!question) {
      return NextResponse.json(
        { ok: false, fallbackToLocal: true, message: "Câu hỏi rỗng." },
        { status: 400 }
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { ok: false, fallbackToLocal: true, message: "Câu hỏi quá dài (hạn chế 2000 ký tự)." },
        { status: 400 }
      );
    }

    // Server-side AI key must be set as OPENAI_API_KEY (or other provider key)
    const aiKey = process.env.OPENAI_API_KEY;
    if (!aiKey) {
      return NextResponse.json({ ok: false, fallbackToLocal: true, message: "Chưa cấu hình AI API key server-side." });
    }

    // Placeholder / adapter: do NOT call external AI providers from this environment.
    // If you'd like to enable real AI calls, implement provider adapter here
    // and call the provider using server-side key (process.env.OPENAI_API_KEY).

    return NextResponse.json({
      ok: false,
      fallbackToLocal: true,
      message:
        "AI provider đã được cấu hình trên server nhưng các cuộc gọi ra ngoài bị tắt trong môi trường này. Cấu hình provider server-side để bật AI thật.",
    });
  } catch {
    // Don't leak sensitive details
    return NextResponse.json({ ok: false, fallbackToLocal: true, message: "Lỗi server khi xử lý yêu cầu AI." }, { status: 500 });
  }
}
