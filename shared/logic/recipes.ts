import { RECIPES } from "../data/index.ts";
import { normalizeTr } from "./text.ts";
import type { AllergenId, FeedingMethod, MealSlot, Recipe, RecipeSummary } from "../types.ts";

export function toSummary(r: Recipe): RecipeSummary {
  return {
    id: r.id,
    title: r.title,
    emoji: r.emoji,
    summary: r.summary,
    minAgeMonths: r.minAgeMonths,
    meals: r.meals,
    textures: r.textures,
    methods: r.methods,
    prepMinutes: r.prepMinutes,
    cookMinutes: r.cookMinutes,
    nutrients: r.nutrients,
    allergens: r.allergens,
    tags: r.tags,
    introducesAllergen: r.introducesAllergen,
    freezable: Boolean(r.storage.freezer),
  };
}

export interface RecipeQuery {
  ageMonths?: number;
  meal?: MealSlot;
  q?: string;
  tag?: string;
  exclude?: AllergenId[];
  method?: FeedingMethod;
  ironOnly?: boolean;
  freezableOnly?: boolean;
}

export function filterRecipes(query: RecipeQuery, source: Recipe[] = RECIPES): Recipe[] {
  const needle = query.q ? normalizeTr(query.q.trim()) : "";
  return source
    .filter((r) => query.ageMonths === undefined || r.minAgeMonths <= query.ageMonths)
    .filter((r) => !query.meal || r.meals.includes(query.meal))
    .filter((r) => !query.tag || r.tags.includes(query.tag))
    .filter((r) => !query.method || r.methods.includes(query.method))
    .filter((r) => !query.ironOnly || r.nutrients.includes("demir"))
    .filter((r) => !query.freezableOnly || Boolean(r.storage.freezer))
    .filter((r) => !query.exclude?.length || !r.allergens.some((a) => query.exclude!.includes(a)))
    .filter((r) => {
      if (!needle) return true;
      const haystack = normalizeTr(
        [r.title, r.summary, ...r.tags, ...r.ingredients.map((i) => i.name)].join(" "),
      );
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    })
    .sort((a, b) => a.minAgeMonths - b.minAgeMonths || a.title.localeCompare(b.title, "tr"));
}

/** Bebeğin yaşına uygun doku/hazırlama önerisini döndürür */
export function adaptationForAge(recipe: Recipe, ageMonths: number) {
  let best = recipe.ageAdaptations[0];
  for (const a of recipe.ageAdaptations) {
    if (a.fromMonths <= ageMonths) best = a;
  }
  return best;
}

export { normalizeTr };
