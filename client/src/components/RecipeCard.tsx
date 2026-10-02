import { MEAL_LABELS } from "../../../shared/data/reference.ts";
import type { AllergenId, RecipeSummary } from "../../../shared/types.ts";
import { navigate } from "../lib/router.ts";
import { actions, useStore } from "../lib/store.ts";
import { Badge, cx } from "./ui.tsx";

const BG = ["bg-primary-soft", "bg-sage-soft", "bg-sun-soft", "bg-sky-soft", "bg-lilac-soft"];

export function emojiBg(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return BG[h % BG.length];
}

export function RecipeCard({ recipe, introduced, allergies, compact }: { recipe: RecipeSummary; introduced: AllergenId[]; allergies: AllergenId[]; compact?: boolean }) {
  const favorite = useStore((s) => s.favorites.includes(recipe.id));
  const newAllergens = recipe.allergens.filter((a) => !introduced.includes(a));
  const blocked = recipe.allergens.some((a) => allergies.includes(a));
  const total = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className={cx("relative rounded-3xl bg-card border border-line/70 shadow-soft transition hover:border-primary/40", blocked && "opacity-60")}>
      <button onClick={() => navigate(`/tarif/${recipe.id}`)} className="flex w-full gap-3.5 p-3.5 text-left">
        <div className={cx("grid shrink-0 place-items-center rounded-2xl text-4xl", compact ? "h-16 w-16" : "h-20 w-20", emojiBg(recipe.id))} aria-hidden>
          {recipe.emoji}
        </div>
        <div className="min-w-0 flex-1 pr-7">
          <h3 className="font-extrabold leading-snug">{recipe.title}</h3>
          {!compact && <p className="text-sm text-muted mt-0.5 line-clamp-2">{recipe.summary}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="primary">{recipe.minAgeMonths}+ ay</Badge>
            <Badge>⏱ {total} dk</Badge>
            {recipe.nutrients.includes("demir") && <Badge tone="danger">🩸 Demir</Badge>}
            {recipe.freezable && !compact && <Badge tone="sky">❄️</Badge>}
            {blocked ? (
              <Badge tone="danger">🚫 Alerji</Badge>
            ) : (
              newAllergens.length > 0 && <Badge tone="sun">⚠️ Yeni alerjen</Badge>
            )}
            {compact && <Badge>{recipe.meals.map((m) => MEAL_LABELS[m]).join(" · ")}</Badge>}
          </div>
        </div>
      </button>
      <button
        onClick={() => actions.toggleFavorite(recipe.id)}
        aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        aria-pressed={favorite}
        className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full text-lg transition hover:bg-primary-soft"
      >
        {favorite ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
