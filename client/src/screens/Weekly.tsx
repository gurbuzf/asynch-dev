import { useState } from "react";
import { MEAL_LABELS, SHOPPING_LABELS } from "../../../shared/data/reference.ts";
import type { ShoppingGroup, WeeklyPlan } from "../../../shared/types.ts";
import { Badge, Button, Card, ErrorState, PageHeader, Skeleton, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { formatDate, useBaby } from "../lib/baby.ts";
import { usePlanUrl } from "../lib/plan.ts";
import { back, navigate } from "../lib/router.ts";
import { STANDALONE } from "../lib/env.ts";
import { actions, today, useStore } from "../lib/store.ts";
import { copyText, toast } from "../lib/toast.ts";

export function Weekly() {
  const baby = useBaby()!;
  const url = usePlanUrl(baby, "weekly");
  const { data, error, reload } = useApi<WeeklyPlan>(url);
  const [tab, setTab] = useState<"plan" | "liste">("plan");

  return (
    <div>
      <PageHeader onBack={() => back("/")} emoji="🗓️" title="Haftalık plan" subtitle="7 günlük menü, alerjen takvimi ve alışveriş listesi." />
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-card p-1" role="tablist">
        {(
          [
            ["plan", "🍽️ Menü"],
            ["liste", "🛒 Alışveriş listesi"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cx("rounded-xl py-2.5 text-sm font-extrabold", tab === id ? "bg-primary-soft text-primary-ink" : "text-muted")}>
            {label}
          </button>
        ))}
      </div>

      {error && !data && <div className="mt-4"><ErrorState message={error} onRetry={reload} /></div>}
      {!data && !error && <Skeleton className="mt-4 h-96" />}
      {data && !data.days[0].started && (
        <Card className="mt-4 text-center">
          <p className="text-4xl" aria-hidden>🍼</p>
          <p className="mt-2 font-extrabold">Menüler 6. ayda başlıyor.</p>
          <p className="text-sm font-semibold text-muted">Şimdilik Rehber'deki hazırlık yazılarına göz atın.</p>
        </Card>
      )}
      {data && data.days[0].started && (tab === "plan" ? <PlanView plan={data} /> : <ShoppingView plan={data} />)}
    </div>
  );
}

function PlanView({ plan }: { plan: WeeklyPlan }) {
  return (
    <div className="mt-4 space-y-3">
      {plan.days.map((d) => (
        <Card key={d.date} className={cx(d.date === today() && "border-2 !border-primary/50")}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-black capitalize">{d.date === today() ? "Bugün" : formatDate(d.date)}</p>
            {d.allergenSuggestion && (
              <Badge tone="sun">
                {d.allergenSuggestion.allergen.emoji} Yeni: {d.allergenSuggestion.allergen.name}
              </Badge>
            )}
          </div>
          <div className="mt-2 divide-y divide-line">
            {d.meals.map((m, i) => (
              <button key={i} onClick={() => navigate(`/tarif/${m.recipe.id}`)} className="flex w-full items-center gap-3 py-2 text-left">
                <span className="w-16 shrink-0 text-xs font-black uppercase text-muted">{MEAL_LABELS[m.slot]}</span>
                <span className="text-xl" aria-hidden>{m.recipe.emoji}</span>
                <span className="min-w-0 flex-1 truncate font-bold">{m.recipe.title}</span>
                {m.recipe.nutrients.includes("demir") && <span title="Demir zengini" aria-label="Demir zengini">🩸</span>}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <p className="px-1 text-xs font-semibold text-muted">Alerjen takvimi, önceki günün alerjenini sorunsuz tanıştırdığınız varsayımıyla planlanır. Gerçekte bir reaksiyon olursa Günlük'ten kaydedin; plan kendini günceller.</p>
    </div>
  );
}

function ShoppingView({ plan }: { plan: WeeklyPlan }) {
  const checked = useStore((s) => s.shopping);
  const groups = (Object.keys(SHOPPING_LABELS) as ShoppingGroup[])
    .map((g) => [g, plan.shopping.filter((i) => i.group === g)] as const)
    .filter(([, items]) => items.length);
  const done = plan.shopping.filter((i) => checked[i.name]).length;

  const text = groups
    .map(([g, items]) => `${SHOPPING_LABELS[g]}\n${items.map((i) => `${checked[i.name] ? "✓" : "•"} ${i.name}`).join("\n")}`)
    .join("\n\n");

  const share = async () => {
    const payload = `🛒 Minik Tabak alışveriş listesi\n\n${text}`;
    if (!STANDALONE && navigator.share) {
      try {
        await navigator.share({ text: payload });
        return;
      } catch {
        // paylaşım iptal edildi ya da desteklenmiyor → panoya kopyala
      }
    }
    toast((await copyText(payload)) ? "Liste panoya kopyalandı ✓" : "Kopyalanamadı — listeyi seçip kopyalayın");
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={done === plan.shopping.length ? "sage" : "neutral"}>
          {done}/{plan.shopping.length} alındı
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={actions.clearShopping}>Temizle</Button>
          <Button size="sm" onClick={share}>{STANDALONE ? "📋 Kopyala" : "📤 Paylaş"}</Button>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {groups.map(([g, items]) => (
          <Card key={g}>
            <p className="font-black">{SHOPPING_LABELS[g]}</p>
            <div className="mt-1 divide-y divide-line">
              {items.map((i) => {
                const on = Boolean(checked[i.name]);
                return (
                  <label key={i.name} className="flex cursor-pointer items-start gap-3 py-2.5">
                    <input type="checkbox" checked={on} onChange={() => actions.toggleShopping(i.name)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--sage)]" />
                    <span className="min-w-0">
                      <span className={cx("block font-bold", on && "text-muted line-through")}>{i.name}</span>
                      <span className="block text-xs font-semibold text-muted">
                        {i.amounts.length > 1 ? `${i.amounts.length} tarifte` : i.amounts[0]} · {i.recipes.slice(0, 2).join(", ")}
                        {i.recipes.length > 2 ? ` +${i.recipes.length - 2}` : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
