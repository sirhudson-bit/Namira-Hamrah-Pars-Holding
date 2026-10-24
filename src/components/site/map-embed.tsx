"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Google Maps is loaded only after an explicit click, because the embed drops
 * third-party cookies. Until then a lightweight placeholder is shown.
 */
export function MapEmbed({ src, label }: { src: string; label: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="card flex h-72 flex-col items-center justify-center gap-2 p-8 text-center">
        <MapPin className="h-8 w-8 text-accent" aria-hidden />
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">
          برای مشاهده موقعیت مکانی، به صفحه تماس مراجعه یا با ما تماس بگیرید.
        </p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="card flex h-72 w-full flex-col items-center justify-center gap-3 p-8 text-center transition-colors hover:bg-brand-700/20"
      >
        <MapPin className="h-8 w-8 text-accent" aria-hidden />
        <span className="text-sm font-medium text-ink-900">نمایش نقشه</span>
        <span className="text-xs text-ink-500">
          با کلیک، نقشه Google بارگذاری می‌شود که ممکن است کوکی شخص ثالث ایجاد کند.
        </span>
      </button>
    );
  }

  return (
    <div className="card h-72 overflow-hidden">
      <iframe
        title={label}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
