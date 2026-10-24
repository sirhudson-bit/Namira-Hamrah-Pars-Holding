import { describe, it, expect } from "vitest";
import {
  contactSchema,
  applicationSchema,
  newsletterSchema,
} from "@/lib/validation";

describe("contactSchema", () => {
  const base = {
    name: "علی رضایی",
    email: "ali@example.com",
    message: "این یک پیام آزمایشی معتبر است.",
    consent: true,
  };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = contactSchema.safeParse({ ...base, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects too-short messages", () => {
    const result = contactSchema.safeParse({ ...base, message: "کوتاه" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid Iranian mobile number", () => {
    const result = contactSchema.safeParse({ ...base, phone: "09124458800" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed phone number", () => {
    const result = contactSchema.safeParse({ ...base, phone: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("applicationSchema", () => {
  const base = {
    name: "سارا محمدی",
    email: "sara@example.com",
    phone: "09120000000",
    position: "توسعه‌دهنده فرانت‌اند",
    dataConsent: true,
    retentionConsent: true,
  };

  it("accepts a valid application", () => {
    expect(applicationSchema.safeParse(base).success).toBe(true);
  });

  it("requires the retention consent", () => {
    const result = applicationSchema.safeParse({ ...base, retentionConsent: false });
    expect(result.success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("requires consent", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.com", consent: false }).success).toBe(false);
  });

  it("accepts a valid opt-in", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.com", consent: true }).success).toBe(true);
  });
});
