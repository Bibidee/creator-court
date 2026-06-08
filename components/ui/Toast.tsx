"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Tone = "success" | "danger" | "info";
type Toast = { id: number; tone: Tone; text: string };

const Ctx = createContext<{ push: (text: string, tone?: Tone) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: Tone = "info") => {
    const id = Date.now() + Math.random();
    setItems((it) => [...it, { id, text, tone }]);
    setTimeout(() => setItems((it) => it.filter((x) => x.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.text) push(d.text, d.tone || "info");
    };
    window.addEventListener("creator_court.toast", h as EventListener);
    return () => window.removeEventListener("creator_court.toast", h as EventListener);
  }, [push]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border px-3 py-2 text-xs shadow-panel backdrop-blur ${
              t.tone === "success"
                ? "border-success/40 bg-success/10 text-success"
                : t.tone === "danger"
                  ? "border-danger/40 bg-danger/10 text-danger"
                  : "border-white/10 bg-elevated text-ink"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  return ctx?.push ?? (() => {});
}

export function toast(text: string, tone: Tone = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("creator_court.toast", { detail: { text, tone } }));
}
