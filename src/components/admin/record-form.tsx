"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions";
import { Field, Textarea, Select, Checkbox, FormFeedback, SubmitBar } from "@/components/admin/fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

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
    };

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function RecordForm({
  action,
  fields,
  hidden = {},
  submitLabel = "ذخیره",
  columns = 2,
}: {
  action: Action;
  fields: FieldSpec[];
  hidden?: Record<string, string>;
  submitLabel?: string;
  columns?: 1 | 2;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className={columns === 2 ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}>
        {fields.map((f) => {
          const err = errors[f.name];
          if (f.type === "markdown") {
            return (
              <div key={f.name} className={columns === 2 ? "sm:col-span-2" : undefined}>
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
              <div key={f.name} className={columns === 2 ? "sm:col-span-2" : undefined}>
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
              <div key={f.name} className={columns === 2 ? "flex items-end pb-2" : undefined}>
                <Checkbox
                  label={f.label}
                  name={f.name}
                  defaultChecked={f.defaultChecked}
                  hint={f.hint}
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
        })}
      </div>
      {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}
      <SubmitBar pending={pending} label={submitLabel} />
    </form>
  );
}
