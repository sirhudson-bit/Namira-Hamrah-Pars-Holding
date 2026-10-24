"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  id,
  confirmText = "آیا از حذف این مورد مطمئن هستید؟ این عمل بازگشت‌پذیر نیست.",
  label = "حذف",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-danger">
        <Trash2 className="h-4 w-4" aria-hidden />
        {label}
      </button>
    </form>
  );
}
