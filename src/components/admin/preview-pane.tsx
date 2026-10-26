"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Live iframe of the public page inside the layout editor.
 *
 * The iframe keeps its own document, so saving a widget does not reload it —
 * the refresh button bumps a key, which remounts the frame and shows the saved
 * result without leaving the editor.
 */
export function PreviewPane({ src, height = "60vh" }: { src: string; height?: string }) {
  const [nonce, setNonce] = useState(0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] text-ink-500">پیش‌نمایش همان چیزی است که بازدیدکننده می‌بیند.</p>
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          className="btn-secondary px-2 py-1 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          بازخوانی پیش‌نمایش
        </button>
      </div>
      <iframe
        key={nonce}
        src={src}
        title="پیش‌نمایش صفحه"
        className="w-full rounded-btn border border-line-200 bg-surface"
        style={{ height }}
      />
    </div>
  );
}
