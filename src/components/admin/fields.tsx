"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  defaultValue,
  error,
  type = "text",
  required,
  dir,
  placeholder,
  hint,
  autoComplete,
  min,
  max,
  step,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  error?: string;
  type?: string;
  required?: boolean;
  dir?: "rtl" | "ltr";
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        dir={dir}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        className={cn("input", error && "border-red-400")}
      />
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export function Textarea({
  label,
  name,
  defaultValue,
  error,
  rows = 5,
  required,
  hint,
  mono,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        className={cn("input resize-y", mono && "font-mono text-xs leading-6", error && "border-red-400")}
      />
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={cn("input", error && "border-red-400")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-ink-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-brand-700"
      />
      <span>
        {label}
        {hint ? <span className="block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FormFeedback({ ok, message }: { ok: boolean; message: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-btn px-4 py-2.5 text-sm",
        ok ? "bg-brand-700/20 text-accent-strong" : "bg-red-500/15 text-red-300",
      )}
    >
      {message}
    </p>
  );
}

export function SubmitBar({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "در حال ذخیره…" : label}
      </button>
    </div>
  );
}

export function AdminSection({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="heading-3">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
