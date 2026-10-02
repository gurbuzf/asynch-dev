import { useEffect, useState, type ReactNode } from "react";
import { ALLERGENS, NUTRIENT_LABELS } from "../../../shared/data/reference.ts";
import type { AllergenId, CalloutTone, Nutrient } from "../../../shared/types.ts";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ children, className, onClick, as = "div" }: { children: ReactNode; className?: string; onClick?: () => void; as?: "div" | "button" | "section" }) {
  const Tag = as;
  return (
    <Tag
      onClick={onClick}
      className={cx(
        "rounded-3xl bg-card shadow-soft border border-line/70 p-4 text-left",
        onClick && "w-full transition active:scale-[0.99] hover:border-primary/40",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, action, emoji }: { children: ReactNode; action?: ReactNode; emoji?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-7 mb-3 px-1">
      <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
        {emoji && <span aria-hidden>{emoji}</span>}
        {children}
      </h2>
      {action}
    </div>
  );
}

type ButtonVariant = "primary" | "soft" | "ghost" | "outline" | "danger" | "sage";

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
  size = "md",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white shadow-soft hover:brightness-105",
    soft: "bg-primary-soft text-primary-ink hover:brightness-95",
    sage: "bg-sage-soft text-sage-ink hover:brightness-95",
    ghost: "text-primary-ink hover:bg-primary-soft",
    outline: "border-2 border-line text-ink hover:border-primary/50",
    danger: "bg-danger-soft text-danger-ink hover:brightness-95",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-[15px]", lg: "px-5 py-3.5 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({ children, active, onClick, className }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold border transition whitespace-nowrap",
        active ? "bg-ink text-bg border-ink" : "bg-card text-ink border-line hover:border-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

type BadgeTone = "primary" | "sage" | "sun" | "sky" | "lilac" | "danger" | "neutral";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  const tones: Record<BadgeTone, string> = {
    primary: "bg-primary-soft text-primary-ink",
    sage: "bg-sage-soft text-sage-ink",
    sun: "bg-sun-soft text-sun-ink",
    sky: "bg-sky-soft text-sky-ink",
    lilac: "bg-lilac-soft text-lilac-ink",
    danger: "bg-danger-soft text-danger-ink",
    neutral: "bg-line/60 text-muted",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

export function NutrientChips({ nutrients, limit }: { nutrients: Nutrient[]; limit?: number }) {
  const list = limit ? nutrients.slice(0, limit) : nutrients;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((n) => (
        <Badge key={n} tone={n === "demir" ? "danger" : n === "omega3" ? "sky" : n === "kalsiyum" ? "lilac" : "sage"}>
          <span aria-hidden>{NUTRIENT_LABELS[n].emoji}</span> {NUTRIENT_LABELS[n].label}
        </Badge>
      ))}
    </div>
  );
}

export function AllergenBadges({ allergens, introduced, allergies = [] }: { allergens: AllergenId[]; introduced: AllergenId[]; allergies?: AllergenId[] }) {
  if (!allergens.length) return <Badge tone="sage">✓ Temel alerjen içermez</Badge>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {allergens.map((id) => {
        const info = ALLERGENS.find((a) => a.id === id)!;
        const allergic = allergies.includes(id);
        const ok = introduced.includes(id);
        return (
          <Badge key={id} tone={allergic ? "danger" : ok ? "neutral" : "sun"}>
            <span aria-hidden>{info.emoji}</span> {info.name}
            {allergic ? " · alerji!" : ok ? "" : " · yeni"}
          </Badge>
        );
      })}
    </div>
  );
}

const CALLOUT: Record<CalloutTone, { cls: string; icon: string }> = {
  info: { cls: "bg-sky-soft text-sky-ink", icon: "💡" },
  warn: { cls: "bg-sun-soft text-sun-ink", icon: "⚠️" },
  danger: { cls: "bg-danger-soft text-danger-ink", icon: "🚨" },
  ok: { cls: "bg-sage-soft text-sage-ink", icon: "✅" },
};

export function Callout({ tone, children, icon, className }: { tone: CalloutTone; children: ReactNode; icon?: string; className?: string }) {
  return (
    <div className={cx("flex gap-3 rounded-2xl p-3.5 text-[15px] leading-relaxed font-semibold", CALLOUT[tone].cls, className)}>
      <span aria-hidden className="text-lg leading-6">{icon ?? CALLOUT[tone].icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Kapat" className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-bg p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-sheet">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden" aria-hidden />
        <button onClick={onClose} aria-label="Kapat" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-card text-muted border border-line">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-3xl bg-line/60", className)} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="text-center py-8">
      <div className="text-4xl mb-2" aria-hidden>🥄💥</div>
      <p className="font-bold">Bir şeyler ters gitti</p>
      <p className="text-muted text-sm mt-1">{message}</p>
      {onRetry && (
        <Button className="mt-4" variant="soft" onClick={onRetry}>
          Tekrar dene
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="text-5xl mb-3" aria-hidden>{emoji}</div>
      <p className="font-extrabold text-lg">{title}</p>
      {children && <div className="text-muted mt-1.5">{children}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary", label }: { value: number; tone?: "primary" | "sage" | "sun"; label?: string }) {
  const color = { primary: "bg-primary", sage: "bg-sage", sun: "bg-sun" }[tone];
  return (
    <div className="h-2.5 w-full rounded-full bg-line/70 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
      <div className={cx("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.max(3, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 88, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--sage)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, emoji, onBack }: { title: string; subtitle?: ReactNode; emoji?: string; onBack?: () => void }) {
  return (
    <div className="pt-2 pb-1">
      {onBack && (
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-card border border-line px-3 py-1.5 text-sm font-bold text-muted no-print">
          ← Geri
        </button>
      )}
      <h1 className="text-[1.7rem] leading-tight font-black tracking-tight flex items-center gap-2">
        {emoji && <span aria-hidden>{emoji}</span>}
        {title}
      </h1>
      {subtitle && <p className="text-muted mt-1 font-semibold">{subtitle}</p>}
    </div>
  );
}

/** İki adımlı onay: tarayıcı confirm() diyalogları her ortamda çalışmadığı için sayfa içinde sorar. */
export function ConfirmButton({ children, confirmText, onConfirm, variant = "danger", size = "md", className }: { children: ReactNode; confirmText: string; onConfirm: () => void; variant?: ButtonVariant; size?: "sm" | "md" | "lg"; className?: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <Button variant={variant} size={size} className={className} onClick={() => setAsking(true)}>
        {children}
      </Button>
    );
  }
  return (
    <div className={cx("rounded-2xl border-2 border-danger/40 bg-danger-soft p-3 text-danger-ink", className)} role="alertdialog" aria-label={confirmText}>
      <p className="font-bold">{confirmText}</p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setAsking(false)}>Vazgeç</Button>
        <Button
          size="sm"
          className="!bg-danger !text-white"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          Evet, devam et
        </Button>
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-bg shadow-soft animate-pop">{message}</div>
    </div>
  );
}
