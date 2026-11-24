import { NextResponse } from "next/server";
import { answerChat, type ChatTurn } from "@/server/assistant";
import { getSettings } from "@/server/settings";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Public chat endpoint for the site assistant.
 *
 * Guards: the feature can be switched off in settings, each IP gets a small
 * fixed window, the transcript is capped, and the answer is always grounded in
 * site content (or an LLM configured by environment). No message is stored.
 */
export async function POST(request: Request) {
  const settings = await getSettings();
  if (settings.chat_enabled === "false") {
    return NextResponse.json({ error: "chat_disabled" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`chat:${ip}`, 24, 5 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: limited.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: "messages_required" }, { status: 400 });
  }

  const messages: ChatTurn[] = raw
    .slice(-12)
    .map((entry) => {
      const item = entry as { role?: unknown; content?: unknown };
      const role: ChatTurn["role"] = item.role === "assistant" ? "assistant" : "user";
      return { role, content: String(item.content ?? "").trim().slice(0, 1200) };
    })
    .filter((turn) => turn.content.length > 0);

  if (!messages.some((turn) => turn.role === "user")) {
    return NextResponse.json({ error: "empty_question" }, { status: 400 });
  }

  const answer = await answerChat(messages);
  return NextResponse.json(answer, {
    headers: { "Cache-Control": "no-store" },
  });
}
