import { useState, type ReactNode } from "react";
import { genitive } from "../../../shared/logic/text.ts";
import { useBaby } from "../lib/baby.ts";
import { navigate } from "../lib/router.ts";
import { SosSheet } from "./Sos.tsx";
import { useToast } from "../lib/toast.ts";
import { Toast, cx } from "./ui.tsx";

const NAV = [
  { path: "/", label: "Bugün", icon: "☀️", match: (p: string) => p === "/" || p.startsWith("/hafta") },
  { path: "/tarifler", label: "Tarifler", icon: "🍲", match: (p: string) => p.startsWith("/tarif") },
  { path: "/besinler", label: "Besinler", icon: "🥕", match: (p: string) => p.startsWith("/besin") },
  { path: "/gunluk", label: "Günlük", icon: "📒", match: (p: string) => p.startsWith("/gunluk") || p.startsWith("/rapor") },
  { path: "/rehber", label: "Rehber", icon: "📚", match: (p: string) => p.startsWith("/rehber") || p.startsWith("/kaynak") },
];

export function Layout({ path, children }: { path: string; children: ReactNode }) {
  const baby = useBaby();
  const [sos, setSos] = useState(false);
  const toastMessage = useToast();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-line/60 no-print">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
          <button onClick={() => navigate("/profil")} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="Profil">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-xl" aria-hidden>
              👶
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-black leading-tight">{baby ? `${genitive(baby.profile.name)} tabağı` : "Minik Tabak"}</span>
              <span className="block truncate text-xs font-bold text-muted">{baby ? baby.ageLabel : "Ek gıda rehberi"}</span>
            </span>
          </button>
          <button
            onClick={() => setSos(true)}
            className="shrink-0 rounded-full bg-danger-soft px-3.5 py-2 text-sm font-black text-danger-ink transition active:scale-95"
          >
            🆘 Acil
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-3">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-card/92 backdrop-blur-md no-print" aria-label="Ana menü">
        <div className="mx-auto grid max-w-2xl grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
          {NAV.map((item) => {
            const active = item.match(path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={active ? "page" : undefined}
                className={cx("flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-extrabold transition", active ? "text-primary-ink" : "text-muted")}
              >
                <span className={cx("grid h-8 w-12 place-items-center rounded-full text-xl transition", active && "bg-primary-soft scale-105")} aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <SosSheet open={sos} onClose={() => setSos(false)} />
      <Toast message={toastMessage} />
    </div>
  );
}
