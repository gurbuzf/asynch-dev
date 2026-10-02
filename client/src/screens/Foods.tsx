import { useMemo, useState } from "react";
import { FOOD_CATEGORY_LABELS } from "../../../shared/data/reference.ts";
import type { Food, FoodCategory } from "../../../shared/types.ts";
import { FoodSheet, REACTIONS } from "../components/FoodSheet.tsx";
import { Chip, EmptyState, ErrorState, PageHeader, ProgressRing, Skeleton, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { useBaby } from "../lib/baby.ts";
import { useStore } from "../lib/store.ts";

export function Foods() {
  const baby = useBaby()!;
  const tried = useStore((s) => s.tried);
  const { data, error, reload } = useApi<{ total: number; items: Food[] }>("/api/foods");
  const [category, setCategory] = useState<FoodCategory | "">("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Food | null>(null);
  const [view, setView] = useState<"hepsi" | "denenen" | "denenmeyen">("hepsi");

  const foods = data?.items ?? [];
  const available = foods.filter((f) => f.minAgeMonths <= baby.ageMonths);
  const triedCount = foods.filter((f) => tried[f.id]).length;

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return foods
      .filter((f) => !category || f.category === category)
      .filter((f) => !needle || f.name.toLocaleLowerCase("tr").includes(needle))
      .filter((f) => view === "hepsi" || (view === "denenen" ? tried[f.id] : !tried[f.id]))
      .sort((a, b) => Number(a.minAgeMonths > baby.ageMonths) - Number(b.minAgeMonths > baby.ageMonths) || a.minAgeMonths - b.minAgeMonths);
  }, [foods, category, q, view, tried, baby.ageMonths]);

  return (
    <div>
      <PageHeader emoji="🛂" title="Tadım Pasaportu" subtitle="Her yeni besin bir mühür. Çeşitlilik = sağlıklı damak." />

      <div className="mt-4 flex items-center gap-4 rounded-[2rem] bg-gradient-to-br from-sage-soft to-sky-soft p-4 shadow-soft">
        <ProgressRing value={foods.length ? triedCount / foods.length : 0}>
          <span>
            <span className="block text-2xl font-black leading-none">{triedCount}</span>
            <span className="text-[11px] font-bold text-muted">/ {foods.length}</span>
          </span>
        </ProgressRing>
        <div>
          <p className="text-lg font-black leading-tight">{triedCount === 0 ? "Pasaport boş, maceraya hazır!" : triedCount < 10 ? "Harika bir başlangıç!" : triedCount < 30 ? "Gerçek bir kaşif! 🧭" : "Minik gurme! 👑"}</p>
          <p className="mt-1 text-sm font-semibold text-muted">Şu an {available.length} besin yaşına uygun. 1 yaşına kadar olabildiğince çok tat ve doku deneyimi hedefleyin.</p>
        </div>
      </div>

      <div className="sticky top-[60px] z-20 -mx-4 mt-4 space-y-2.5 bg-bg/90 px-4 pb-3 pt-1 backdrop-blur-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Besin ara…"
          aria-label="Besin ara"
          className="w-full rounded-2xl border-2 border-line bg-card px-4 py-3 font-bold outline-none focus:border-primary"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {(
            [
              ["hepsi", "Hepsi"],
              ["denenmeyen", "Denenmeyenler"],
              ["denenen", "Denenenler"],
            ] as const
          ).map(([id, label]) => (
            <Chip key={id} active={view === id} onClick={() => setView(id)}>
              {label}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
          <Chip active={category === ""} onClick={() => setCategory("")}>Tümü</Chip>
          {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? "" : c)}>
              {FOOD_CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {!data && !error && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )}
      {data && list.length === 0 && <EmptyState emoji="🥕" title="Burada henüz besin yok" />}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {list.map((f) => {
          const entry = tried[f.id];
          const locked = f.minAgeMonths > baby.ageMonths;
          const reaction = entry && REACTIONS.find((r) => r.id === entry.reaction);
          return (
            <button
              key={f.id}
              onClick={() => setOpen(f)}
              className={cx(
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border-2 p-2 text-center transition active:scale-95",
                entry ? (entry.reaction === "reaksiyon" ? "border-danger bg-danger-soft" : "border-sage bg-sage-soft") : "border-dashed border-line bg-card",
                locked && "opacity-50",
              )}
            >
              <span className={cx("text-4xl", !entry && !locked && "grayscale-[35%]")} aria-hidden>{f.emoji}</span>
              <span className="text-xs font-extrabold leading-tight">{f.name}</span>
              {locked && <span className="absolute right-1.5 top-1.5 rounded-full bg-card px-1.5 text-[10px] font-black">🔒 {f.minAgeMonths}ay</span>}
              {reaction && (
                <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-card text-base shadow-soft animate-stamp" aria-label={reaction.label}>
                  {reaction.emoji}
                </span>
              )}
              {f.choking === "yuksek" && !entry && !locked && <span className="absolute left-1.5 top-1.5 text-xs" title="Yüksek boğulma riski">⚠️</span>}
            </button>
          );
        })}
      </div>

      <FoodSheet food={open} ageMonths={baby.ageMonths} onClose={() => setOpen(null)} />
    </div>
  );
}
