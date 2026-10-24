/**
 * A deliberately small, dependency-free Markdown renderer for CMS content.
 *
 * The input is escaped first, so stored content can never inject markup, and
 * only a known allow-list of constructs is converted (headings, lists, bold,
 * italics, links, inline code, blockquotes, horizontal rules, paragraphs).
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    // Images before links, so `![alt](src)` is not eaten by the link rule.
    // Only root-relative or http(s) sources are allowed — never `javascript:`.
    .replace(
      /!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy" decoding="async" class="my-4 w-full rounded-card border border-line-200" />',
    )
    .replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g,
      '<a href="$2" rel="noopener noreferrer">$1</a>',
    );
}

export function renderMarkdown(markdown: string): string {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, "\n"));
  const lines = escaped.split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      // The page already renders its own <h1>, so content headings start at
      // <h2> and never skip a level — skipping breaks heading order for
      // assistive technology.
      const level = Math.min(Math.max(heading[1].length, 2), 6);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    const quote = /^&gt;\s?(.*)$/.exec(line);
    if (quote) {
      closeList();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

/** Strips Markdown syntax for use in meta descriptions and excerpts. */
export function markdownToPlain(markdown: string, maxLength = 160): string {
  const text = markdown
    .replace(/[#>*_`\-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
