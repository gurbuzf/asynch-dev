import { useMemo, useState } from "react";
import { MEAL_LABELS } from "../../../shared/data/reference.ts";
import type { MealSlot, RecipeSummary } from "../../../shared/types.ts";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { Chip, EmptyState, ErrorState, PageHeader, Skeleton } from "../components/ui.tsx";
import { buildUrl, useApi } from "../lib/api.ts";
import { useBaby } from "../lib/baby.ts";
import { useIntroduced } from "../lib/plan.ts";
import { useStore } from "../lib/store.ts";

type Quick = "demir" | "blw" | "dondurulabilir" | "favori" | "alerjen" | "geleneksel";

const QUICK: { id: Quick; label: string }[] = [
  { id: "favori", label: "❤️ Favoriler" },
  { id: "demir", label: "🩸 Demir zengini" },
  { id: "blw", label: "✋ BLW" },
  { id: "dondurulabilir", label: "❄️ Dondurulabilir" },
  { id: "geleneksel", label: "🇹🇷 Türk mutfağı" },
  { id: "alerjen", label: "🥜 Alerjen tanıştırma" },
];

export function Recipes() {
  const baby = useBaby()!;
  const introduced = useIntroduced();
  const favorites = useStore((s) => s.favorites);
  const [q, setQ] = useState("");
  const [meal, setMeal] = useState<MealSlot | "">("");
  const [ageOnly, setAgeOnly] = useState(baby.ageMonths >= 6);
  const [quick, setQuick] = useState<Quick[]>([]);

  const url = buildUrl("/api/recipes", {
    ageMonths: ageOnly ? Math.max(6, baby.ageMonths) : undefined,
    meal,
    exclude: baby.profile.allergies,
    iron: quick.includes("demir"),
    freezable: quick.includes("dondurulabilir"),
    method: quick.includes("blw") ? "blw" : undefined,
  });
  const { data, error, loading, reload } = useApi<{ total: number; items: RecipeSummary[] }>(url);

  const items = useMemo(() => {
    let list = data?.items ?? [];
    if (quick.includes("favori")) list = list.filter((r) => favorites.includes(r.id));
    if (quick.includes("geleneksel")) list = list.filter((r) => r.tags.includes("geleneksel"));
    if (quick.includes("alerjen")) list = list.filter((r) => r.introducesAllergen);
    const needle = q.trim().toLocaleLowerCase("tr");
    if (needle) list = list.filter((r) => `${r.title} ${r.summary} ${r.tags.join(" ")}`.toLocaleLowerCase("tr").includes(needle));
    return list;
  }, [data, quick, favorites, q]);

  const toggle = (id: Quick) => setQuick((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div>
      <PageHeader emoji="🍲" title="Tarifler" subtitle={`Tuzsuz, şekersiz, ballı değil — ${data ? `${items.length} tarif` : "yükleniyor"}`} />

      <div className="sticky top-[60px] z-20 -mx-4 mt-3 space-y-2.5 bg-bg/90 px-4 pb-3 pt-1 backdrop-blur-md">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" aria-hidden>🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tarif, malzeme ara… (ör. mercimek)"
            aria-label="Tarif ara"
            className="w-full rounded-2xl border-2 border-line bg-card py-3 pl-11 pr-4 font-bold outline-none focus:border-primary"
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          <Chip active={ageOnly} onClick={() => setAgeOnly(!ageOnly)}>
            👶 {Math.floor(Math.max(6, baby.ageMonths))} aya uygun
          </Chip>
          <Chip active={meal === ""} onClick={() => setMeal("")}>Tüm öğünler</Chip>
          {(Object.keys(MEAL_LABELS) as MealSlot[]).map((m) => (
            <Chip key={m} active={meal === m} onClick={() => setMeal(meal === m ? "" : m)}>
              {MEAL_LABELS[m]}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {QUICK.map((f) => (
            <Chip key={f.id} active={quick.includes(f.id)} onClick={() => toggle(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {baby.profile.allergies.length > 0 && (
        <p className="mb-3 px-1 text-xs font-bold text-muted">🚫 Bilinen alerjileri içeren tarifler gizleniyor.</p>
      )}

      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {loading && !data && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {data && items.length === 0 && (
        <EmptyState emoji="🥄" title="Sonuç yok">
          Filtreleri azaltmayı deneyin.
        </EmptyState>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((r) => (
          <RecipeCard key={r.id} recipe={r} introduced={introduced} allergies={baby.profile.allergies} />
        ))}
      </div>
    </div>
  );
}
