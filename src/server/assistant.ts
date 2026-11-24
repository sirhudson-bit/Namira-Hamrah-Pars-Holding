import { prisma } from "@/server/db";
import { getSettings, type SiteSettings } from "@/server/settings";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatAnswer = { reply: string; source: "ai" | "site" };

/**
 * Everything the assistant is allowed to talk about, assembled from the same
 * rows the site renders. Keeping this in one place means the bot answers with
 * current contact details and the actual groups/stores — not a hard-coded blurb
 * that drifts after the first admin edit.
 */
export async function buildKnowledge(): Promise<string> {
  const [settings, groups, stores, services, jobs, pages, news] = await Promise.all([
    getSettings(),
    prisma.businessGroup.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.store.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.serviceItem.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.jobOpening.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.page.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.newsPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take: 4 }),
  ]);

  const lines: string[] = [
    "## معرفی",
    `نام مجموعه: ${settings.legal_name} (${settings.site_name})`,
    "## تماس",
    `تلفن: ${settings.phone} — همراه: ${settings.mobile} — ایمیل: ${settings.email}`,
    `نشانی: ${settings.address}`,
    `ساعات کاری: ${settings.hours}`,
    "## گروه‌های کسب‌وکار",
    ...groups.map((group) => `- ${group.name}: ${group.tagline}. ${group.description}`),
    "## کانال‌های فروش",
    ...stores.map((store) => `- ${store.name} (${store.kind}): ${store.description}`),
    "## خدمات",
    ...services.map((service) => `- ${service.title}: ${service.description}`),
    "## فرصت‌های شغلی",
    ...jobs.map((job) => `- ${job.title} در ${job.department} (${job.location})`),
    "## صفحات سایت",
    ...pages.map((page) => `- ${page.title}: /${page.slug}${page.subtitle ? ` — ${page.subtitle}` : ""}`),
    "## اخبار",
    ...news.map((item) => `- ${item.title}: ${item.excerpt}`),
  ];

  if (settings.chat_extra_knowledge.trim()) {
    lines.push("## دانش تکمیلی", settings.chat_extra_knowledge.trim());
  }

  // A prompt is paid for by the token; keep the block bounded.
  return lines.join("\n").slice(0, 7000);
}

const SYSTEM_PROMPT = `تو دستیار پاسخ‌گوی وب‌سایت هلدینگ «نامیرا همراه پارس» هستی.
فقط بر اساس «دانش سایت» که در پیام سیستمی بعدی می‌آید پاسخ بده؛ چیزی از خودت نساز.
اگر پاسخ در دانش نبود، صادقانه بگو اطلاعاتش را در سایت ندارم و کاربر را به تماس با
هلدینگ یا صفحه مربوطه راهنمایی کن. پاسخ‌ها کوتاه، محترمانه و فارسی باشند (حداکثر ۴ جمله).
نام، شماره تماس یا آدرسی را که در دانش نیست حدس نزن.`;

const STOPWORDS = new Set([
  "از", "به", "با", "برای", "در", "را", "که", "این", "آن", "است", "هست", "بود",
  "شما", "ما", "من", "می", "های", "ها", "یک", "و", "یا", "تا", "بر", "هم",
  "چه", "چی", "کجا", "چطور", "چگونه", "آیا", "لطفا", "میخواهم", "می‌خواهم",
  "کدام", "کدامند", "کدام‌اند", "چند", "چندتا", "هستند", "دارید", "دارد",
  "معرفی", "لیست", "اسامی", "نام", "بگویید", "بگو", "کنید", "می‌کنید",
]);

/**
 * Normalizes a word for matching. Persian text mixes Arabic yeh/kaf, Persian
 * digits and zero-width non-joiners, and the same word is written with and
 * without them across the site. Removing the joiner and folding the letters
 * makes "گروه‌های" and "گروههای" the same token.
 */
function normalizeWord(word: string): string {
  const folded = word
    .toLowerCase()
    .replace(/[\u200c\u200e\u200f]/g, "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
  return folded.length > 4 ? folded.replace(/(هایی|های|ها)$/u, "") : folded;
}

function tokens(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => normalizeWord(word.trim()))
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

type KnowledgeSection = { title: string; lines: string[] };

/** Splits the knowledge block into `##`-headed sections. */
function readSections(knowledge: string): KnowledgeSection[] {
  const sections: KnowledgeSection[] = [];
  for (const raw of knowledge.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      sections.push({ title: line.slice(3), lines: [] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].lines.push(line.replace(/^-\s*/, ""));
    }
  }
  return sections;
}

function rankLines(lines: string[], query: Set<string>, limit: number): string[] {
  return lines
    .map((line) => {
      const lineTokens = new Set(tokens(line));
      let score = 0;
      for (const token of query) {
        if (lineTokens.has(token)) score += 3;
        else if (line.includes(token)) score += 1;
      }
      return { line, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => (entry.line.length > 220 ? `${entry.line.slice(0, 217)}…` : entry.line));
}

/**
 * Answers without an LLM: matches the question against the `##` sections of the
 * knowledge block, then against individual lines inside the best section. It is
 * not a language model, but it is grounded, instant, free and never invents a
 * phone number — the right default until an API key is configured.
 */
export function siteAnswer(question: string, knowledge: string, settings: SiteSettings): string {
  const query = new Set(tokens(question));
  const sections = readSections(knowledge);

  const scored = sections
    .map((section) => {
      const titleTokens = new Set(tokens(section.title));
      let titleHits = 0;
      for (const token of query) if (titleTokens.has(token)) titleHits += 1;
      const bodyTokens = new Set(tokens(section.lines.join(" ")));
      let bodyHits = 0;
      for (const token of query) if (bodyTokens.has(token)) bodyHits += 1;
      return { section, titleHits, score: titleHits * 5 + bodyHits };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [
      "پاسخ این پرسش را در اطلاعات سایت پیدا نکردم.",
      `می‌توانید با شماره ${settings.phone} تماس بگیرید یا از صفحه «تماس با ما» پیام بفرستید تا همکاران ما راهنمایی کنند.`,
    ].join(" ");
  }

  const best = scored[0];
  // A section whose *title* matched is what the visitor asked about ("گروه‌ها",
  // "خدمات", "فرصت‌های شغلی"), so list its entries instead of one random line.
  const picks =
    best.titleHits > 0
      ? best.section.lines.slice(0, 5)
      : rankLines(best.section.lines, query, 3);

  if (picks.length === 0) {
    return `برای این مورد، اطلاعات بیشتری در سایت ثبت نشده است. با شماره ${settings.phone} تماس بگیرید تا همکاران ما راهنمایی کنند.`;
  }

  return [
    "بر اساس اطلاعات سایت:",
    ...picks.map((line) => `• ${line}`),
    "",
    `برای جزئیات بیشتر با ${settings.phone} تماس بگیرید یا در همین گفتگو بپرسید.`,
  ].join("\n");
}

type ProviderMessage = { role: "system" | "user" | "assistant"; content: string };

async function askProvider(
  turns: ChatTurn[],
  knowledge: string,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const messages: ProviderMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `دانش سایت:\n${knowledge}` },
    ...turns.slice(-8).map((turn) => ({ role: turn.role, content: turn.content.slice(0, 1200) })),
  ];

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 420,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    // A provider outage must not take the widget down; the grounded answer
    // below still replies.
    return null;
  }
}

export async function answerChat(turns: ChatTurn[]): Promise<ChatAnswer> {
  const settings = await getSettings();
  const knowledge = await buildKnowledge();
  const lastUser = [...turns].reverse().find((turn) => turn.role === "user");

  if (lastUser) {
    const ai = await askProvider(turns, knowledge);
    if (ai) return { reply: ai, source: "ai" };
  }

  return {
    reply: siteAnswer(lastUser?.content ?? "", knowledge, settings),
    source: "site",
  };
}
