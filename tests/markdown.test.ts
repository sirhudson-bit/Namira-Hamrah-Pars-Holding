import { describe, it, expect } from "vitest";
import { renderMarkdown, markdownToPlain } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("escapes raw HTML so content cannot inject markup", () => {
    const html = renderMarkdown('<script>alert("x")</script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders content headings starting at h2 (the page owns the h1)", () => {
    expect(renderMarkdown("## عنوان")).toContain("<h2>عنوان</h2>");
    expect(renderMarkdown("# عنوان")).toContain("<h2>عنوان</h2>");
    expect(renderMarkdown("### عنوان")).toContain("<h3>عنوان</h3>");
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- یک\n- دو");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>یک</li>");
    expect(html).toContain("</ul>");
  });

  it("renders bold and inline code", () => {
    const html = renderMarkdown("این **مهم** و `کد` است");
    expect(html).toContain("<strong>مهم</strong>");
    expect(html).toContain("<code>کد</code>");
  });

  it("renders links with rel=noopener", () => {
    const html = renderMarkdown("[سایت](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("wraps plain lines in paragraphs", () => {
    expect(renderMarkdown("یک پاراگراف ساده")).toContain("<p>یک پاراگراف ساده</p>");
  });
});

describe("markdownToPlain", () => {
  it("strips markup and truncates", () => {
    const plain = markdownToPlain("## عنوان\n\nمتن **پررنگ**.");
    expect(plain).not.toContain("#");
    expect(plain).not.toContain("**");
    expect(plain).toContain("عنوان");
  });

  it("adds an ellipsis past the limit", () => {
    const plain = markdownToPlain("a".repeat(200), 20);
    expect(plain.endsWith("…")).toBe(true);
    expect(plain.length).toBeLessThanOrEqual(21);
  });
});
