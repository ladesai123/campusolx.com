import React from "react";
import clsx from "clsx";

/**
 * A simple, branded loading animation for CampusOlx.
 * Shows animated logo with a pulsing blue dot to indicate the app is live.
 */
export default function AppLoader({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-4 py-12", className)}>
      <div className="flex items-end gap-1 select-none">
        <span className="font-semibold text-slate-900 text-xl">Campus</span>
        <span className="font-bold text-brand text-xl" style={{ color: "var(--brand-color)" }}>Olx</span>
        <span className="ml-2 inline-block h-3 w-3 rounded-full bg-brand animate-pulse" title="Live" />
      </div>
      <div className="text-sm text-gray-500 mt-2">Loading CampusOlx…</div>
    </div>
  );
}
