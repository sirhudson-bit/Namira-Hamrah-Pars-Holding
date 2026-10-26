import { describe, it, expect } from "vitest";
import { parseBlockData, parsePairs, parseImageLines } from "@/lib/blocks";
import { isSafeImageSrc, imageSrc } from "@/lib/media";
import { renderMarkdown } from "@/lib/markdown";

describe("parseBlockData", () => {
  it("reads string values from the stored JSON", () => {
    expect(parseBlockData('{"title":"عنوان","image":"/uploads/media/a.webp"}')).toEqual({
      title: "عنوان",
      image: "/uploads/media/a.webp",
    });
  });

  it("returns an empty object for invalid or non-object JSON", () => {
    expect(parseBlockData("")).toEqual({});
    expect(parseBlockData("not json")).toEqual({});
    expect(parseBlockData("[]")).toEqual({});
    expect(parseBlockData("null")).toEqual({});
  });
});

describe("widget list parsing", () => {
  it("splits value|label lines and keeps a pipe inside the description", () => {
    expect(parsePairs("۱۴|سال تجربه\n۳۰۰+|همکار سازمانی|فعال")).toEqual([
      { title: "۱۴", description: "سال تجربه" },
      { title: "۳۰۰+", description: "همکار سازمانی|فعال" },
    ]);
  });

  it("drops blank lines", () => {
    expect(parsePairs("\n\n a | b \n\n")).toEqual([{ title: "a", description: "b" }]);
  });

  it("parses image lines with an optional caption", () => {
    expect(parseImageLines("/uploads/media/a.webp|تصویر الف\n/uploads/media/b.webp")).toEqual([
      { src: "/uploads/media/a.webp", alt: "تصویر الف" },
      { src: "/uploads/media/b.webp", alt: "" },
    ]);
  });
});

describe("image source validation", () => {
  it("accepts root-relative and absolute http(s) sources", () => {
    expect(isSafeImageSrc("/uploads/media/a.webp")).toBe(true);
    expect(isSafeImageSrc("https://cdn.example.com/a.jpg")).toBe(true);
    expect(imageSrc("http://example.com/a.jpg")).toBe("http://example.com/a.jpg");
  });

  it("rejects protocol-relative, javascript and empty values", () => {
    expect(isSafeImageSrc("//evil.example/a.jpg")).toBe(false);
    expect(isSafeImageSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeImageSrc("")).toBe(false);
    expect(imageSrc(null)).toBe("");
  });
});

describe("markdown images", () => {
  it("renders a safe upload path as an image", () => {
    expect(renderMarkdown("![توضیح](/uploads/media/a.webp)")).toContain(
      '<img src="/uploads/media/a.webp" alt="توضیح"',
    );
  });

  it("does not turn a javascript source into an image", () => {
    expect(renderMarkdown("![x](javascript:alert(1))")).not.toContain("<img");
  });
});
