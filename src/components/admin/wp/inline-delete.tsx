"use client";

/**
 * Delete control rendered as a WordPress list-table row action.
 *
 * A form post (not a fetch) keeps the action working without JavaScript, and
 * the confirmation guard lives on the client so a stray click cannot remove a
 * record. `label` stays short because it sits in the row-actions line.
 */
export function InlineDelete({
  action,
  id,
  label = "حذف",
  confirmText = "این مورد حذف شود؟ این عمل بازگشت‌پذیر نیست.",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="wp-action wp-action-danger">
        {label}
      </button>
    </form>
  );
}
