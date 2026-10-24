const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts every ASCII digit in a string to its Persian counterpart.
 *
 * Written as a character loop rather than `String.replace` with a callback:
 * this runs inside animation frames and across every list on the site, and the
 * loop allocates nothing per digit.
 */
export function toPersianDigits(input: string | number): string {
  const text = String(input);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out += code >= 48 && code <= 57 ? PERSIAN_DIGITS[code - 48] : text[i];
  }
  return out;
}

/*
 * Intl formatters are expensive to construct (~0.1–1ms each) and are stateless,
 * so they are built once at module load instead of per call — these run in
 * lists, admin tables and the footer.
 */
const JALALI_DATE = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const JALALI_LONG = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const JALALI_YEAR = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });

/** Formats a date as a Jalali (Persian) date, e.g. ۱۴۰۳/۰۵/۱۲. */
export function formatJalaliDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return JALALI_DATE.format(d);
}

/** Persian, gregorian-agnostic long date, e.g. ۱۲ مرداد ۱۴۰۳. */
export function formatJalaliLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return JALALI_LONG.format(d);
}

/** Current Jalali year, for the footer's copyright line. */
export function currentJalaliYear(): string {
  return JALALI_YEAR.format(new Date());
}

/** Formats an Iranian phone number for display without altering the value. */
export function formatPhone(phone: string): string {
  return toPersianDigits(phone);
}
