import { IMAGE_POSITION_OPTIONS } from "./media";

/** Shared select options for "where should the cover image focus?". */
export const imagePositionOptions = IMAGE_POSITION_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

/**
 * Field spec for the shared admin `RecordForm`. Kept here so every entity with
 * a cover image uses exactly the same labels and values.
 */
export function imagePositionField(defaultValue?: string | null) {
  return {
    type: "select" as const,
    name: "imagePosition",
    label: "موقعیت نمایش تصویر",
    hint: "نقطه‌ای از تصویر که در کادر دیده می‌شود؛ برای تصاویر عمودی مهم است.",
    options: imagePositionOptions,
    defaultValue: defaultValue ?? "center",
  };
}
