"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import type { ActionResult } from "@/server/actions";
import { Field, Textarea, Select, Checkbox, FormFeedback, SubmitBar } from "@/components/admin/fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { ImageField } from "@/components/admin/image-field";

export type FieldSpec =
  | {
      type: "text" | "email" | "url" | "date" | "number" | "password";
      name: string;
      label: string;
      defaultValue?: string | number | null;
      required?: boolean;
      dir?: "rtl" | "ltr";
      placeholder?: string;
      hint?: string;
    }
  | {
      type: "textarea";
      name: string;
      label: string;
      defaultValue?: string | null;
      rows?: number;
      hint?: string;
      mono?: boolean;
      required?: boolean;
    }
  | {
      /** Rich-ish content editor: toolbar + media picker + live preview. */
      type: "markdown";
      name: string;
      label: string;
      defaultValue?: string | null;
      rows?: number;
      hint?: string;
      required?: boolean;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      defaultValue?: string | null;
      required?: boolean;
    }
  | {
      type: "checkbox";
      name: string;
      label: string;
      defaultChecked?: boolean;
      hint?: string;
    }
  | {
      /** File input used to replace an existing upload. */
      type: "file";
      name: string;
      label: string;
      accept?: string;
      hint?: string;
    }
  | {
      /** Image URL + media-library picker. */
      type: "image";
      name: string;
      label: string;
      defaultValue?: string | null;
      required?: boolean;
      hint?: string;
    };

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * Form generated from a field list.
 *
 * Two layouts:
 *  - `stack` (default): everything in one card.
 *  - `wp`: WordPress-style editor — content fields in the wide column, the
 *    publish/status fields plus the save button in a narrower meta box on the
 *    other side, so the primary action is always in the same place and a long
 *    body field never pushes it off-screen.
 */
export function RecordForm({
  action,
  fields,
  hidden = {},
  submitLabel = "ذخیره",
  columns = 2,
  layout = "stack",
  sideFields = [],
  sideExtra,
  sideTitle = "انتشار",
}: {
  action: Action;
  fields: FieldSpec[];
  hidden?: Record<string, string>;
  submitLabel?: string;
  columns?: 1 | 2;
  layout?: "stack" | "wp";
  /** Field names rendered inside the side meta box (wp layout only). */
  sideFields?: string[];
  /** Extra controls in the side box — delete, preview, timestamps. */
  sideExtra?: ReactNode;
  sideTitle?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );
  const errors = state?.errors ?? {};

  const renderField = (f: FieldSpec) => {
    const err = errors[f.name];
    if (f.type === "markdown") {
      return (
        <div key={f.name} className="sm:col-span-2">
          <MarkdownEditor
            name={f.name}
            label={f.label}
            defaultValue={f.defaultValue ?? ""}
            rows={f.rows}
            hint={f.hint}
            required={f.required}
          />
          {err ? (
            <p role="alert" className="mt-1.5 text-xs text-red-400">
              {err}
            </p>
          ) : null}
        </div>
      );
    }
    if (f.type === "textarea") {
      return (
        <div key={f.name} className="sm:col-span-2">
          <Textarea
            label={f.label}
            name={f.name}
            defaultValue={f.defaultValue}
            rows={f.rows}
            hint={f.hint}
            mono={f.mono}
            required={f.required}
            error={err}
          />
        </div>
      );
    }
    if (f.type === "select") {
      return (
        <Select
          key={f.name}
          label={f.label}
          name={f.name}
          options={f.options}
          defaultValue={f.defaultValue}
          required={f.required}
          error={err}
        />
      );
    }
    if (f.type === "checkbox") {
      return (
        <div key={f.name} className="flex items-end pb-2">
          <Checkbox
            label={f.label}
            name={f.name}
            defaultChecked={f.defaultChecked}
            hint={f.hint}
          />
        </div>
      );
    }
    if (f.type === "file") {
      return (
        <div key={f.name} className="sm:col-span-2">
          <label htmlFor={f.name} className="label">
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            type="file"
            accept={f.accept}
            className="input file:ml-3 file:rounded-btn file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
          />
          {f.hint ? <p className="mt-1 text-xs text-ink-500">{f.hint}</p> : null}
        </div>
      );
    }
    if (f.type === "image") {
      return (
        <div key={f.name} className="sm:col-span-2">
          <ImageField
            label={f.label}
            name={f.name}
            defaultValue={f.defaultValue}
            required={f.required}
            hint={f.hint}
            error={err}
          />
        </div>
      );
    }
    return (
      <Field
        key={f.name}
        label={f.label}
        name={f.name}
        type={f.type}
        defaultValue={f.defaultValue}
        required={f.required}
        dir={f.dir}
        placeholder={f.placeholder}
        hint={f.hint}
        error={err}
      />
    );
  };

  if (layout === "wp") {
    const side = fields.filter((f) => sideFields.includes(f.name));
    const main = fields.filter((f) => !sideFields.includes(f.name));
    return (
      <form action={formAction}>
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start">
          <div className="card min-w-0 p-5">
            <div className={columns === 2 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
              {main.map(renderField)}
            </div>
            {state ? (
              <div className="mt-4">
                <FormFeedback ok={state.ok} message={state.message} />
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card">
              <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
                {sideTitle}
              </h2>
              <div className="space-y-4 p-4">
                {side.map(renderField)}
                {sideExtra}
                <div className="border-t border-line-200 pt-3">
                  <SubmitBar pending={pending} label={submitLabel} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className={columns === 2 ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}>
        {fields.map(renderField)}
      </div>
      {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}
      <SubmitBar pending={pending} label={submitLabel} />
    </form>
  );
}
