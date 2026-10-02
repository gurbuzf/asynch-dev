// Çerçeveden bağımsız API: Express sunucusu ve sunucusuz (tarayıcı içi) sürüm aynı işleyiciyi kullanır.
import {
  ALLERGENS,
  ARTICLES,
  FOODS,
  FOOD_CATEGORY_LABELS,
  MEAL_LABELS,
  METHOD_LABELS,
  MYTHS,
  NUTRIENT_LABELS,
  RECIPES,
  RECIPE_BY_ID,
  SHOPPING_LABELS,
  SOURCES,
  STAGES,
  TEXTURE_LABELS,
  TIPS,
} from "./data/index.ts";
import { isIsoDate, stageForAge, toIsoDate } from "./logic/age.ts";
import { buildDailyPlan, buildWeeklyPlan } from "./logic/plan.ts";
import { filterRecipes, normalizeTr, toSummary } from "./logic/recipes.ts";
import type { AllergenId, FeedingMethod, FoodCategory, MealSlot, PlanInput } from "./types.ts";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Query = Record<string, unknown>;

export interface ApiResponse {
  status: number;
  body: unknown;
  cacheSeconds?: number;
}

const ALLERGEN_IDS = new Set<string>(ALLERGENS.map((a) => a.id));
const MEALS = new Set<string>(Object.keys(MEAL_LABELS));
const METHODS = new Set<string>(Object.keys(METHOD_LABELS));
const FOOD_IDS = new Set(FOODS.map((f) => f.id));

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length ? value : undefined;
}

function parseAge(value: unknown, required = false): number | undefined {
  const s = str(value);
  if (s === undefined) {
    if (required) throw new HttpError(400, "ageMonths parametresi gerekli");
    return undefined;
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || n > 60) throw new HttpError(400, "ageMonths 0–60 arasında bir sayı olmalı");
  return n;
}

function parseAllergens(value: unknown): AllergenId[] {
  const s = str(value);
  if (!s) return [];
  const list = s.split(",").map((x) => x.trim()).filter(Boolean);
  const invalid = list.filter((x) => !ALLERGEN_IDS.has(x));
  if (invalid.length) throw new HttpError(400, `Geçersiz alerjen: ${invalid.join(", ")}`);
  return [...new Set(list)] as AllergenId[];
}

function parsePlanInput(query: Query): PlanInput {
  const ageMonths = parseAge(query.ageMonths, true)!;
  const date = str(query.date) ?? toIsoDate(new Date());
  if (!isIsoDate(date)) throw new HttpError(400, "date YYYY-AA-GG biçiminde olmalı");
  const method = (str(query.method) ?? "karma") as FeedingMethod;
  if (!METHODS.has(method)) throw new HttpError(400, "method kasik | blw | karma olmalı");
  const lastAllergenIntro = str(query.lastAllergenIntro);
  if (lastAllergenIntro && !isIsoDate(lastAllergenIntro)) throw new HttpError(400, "lastAllergenIntro YYYY-AA-GG biçiminde olmalı");
  const triedFoods = (str(query.tried) ?? "").split(",").filter((id) => FOOD_IDS.has(id));
  const shuffle = Number(str(query.shuffle) ?? 0);
  return {
    ageMonths,
    date,
    method,
    introducedAllergens: parseAllergens(query.introduced),
    allergies: parseAllergens(query.allergies),
    triedFoods,
    lastAllergenIntro,
    shuffle: Number.isFinite(shuffle) ? shuffle : 0,
  };
}

type Handler = (query: Query, params: string[]) => unknown;

const routes: [RegExp, Handler, number?][] = [
  [/^\/health$/, () => ({ ok: true, recipes: RECIPES.length, foods: FOODS.length, tips: TIPS.length, articles: ARTICLES.length })],
  [
    /^\/meta$/,
    () => ({
      stages: STAGES,
      allergens: ALLERGENS,
      sources: Object.values(SOURCES),
      labels: {
        meals: MEAL_LABELS,
        textures: TEXTURE_LABELS,
        methods: METHOD_LABELS,
        nutrients: NUTRIENT_LABELS,
        shopping: SHOPPING_LABELS,
        foodCategories: FOOD_CATEGORY_LABELS,
      },
      tags: [...new Set(RECIPES.flatMap((r) => r.tags))].sort(),
    }),
    3600,
  ],
  [/^\/stage$/, (q) => stageForAge(parseAge(q.ageMonths, true)!)],
  [
    /^\/recipes$/,
    (q) => {
      const meal = str(q.meal);
      if (meal && !MEALS.has(meal)) throw new HttpError(400, "Geçersiz öğün");
      const method = str(q.method);
      if (method && !METHODS.has(method)) throw new HttpError(400, "Geçersiz yöntem");
      const list = filterRecipes({
        ageMonths: parseAge(q.ageMonths),
        meal: meal as MealSlot | undefined,
        q: str(q.q),
        tag: str(q.tag),
        exclude: parseAllergens(q.exclude),
        method: method as FeedingMethod | undefined,
        ironOnly: q.iron === "1",
        freezableOnly: q.freezable === "1",
      });
      return { total: list.length, items: list.map(toSummary) };
    },
  ],
  [
    /^\/recipes\/([^/]+)$/,
    (_q, [id]) => {
      const recipe = RECIPE_BY_ID[id];
      if (!recipe) throw new HttpError(404, "Tarif bulunamadı");
      return recipe;
    },
  ],
  [
    /^\/foods$/,
    (q) => {
      const age = parseAge(q.ageMonths);
      const category = str(q.category) as FoodCategory | undefined;
      const text = str(q.q);
      const needle = text ? normalizeTr(text) : "";
      const items = FOODS.filter((f) => age === undefined || f.minAgeMonths <= age)
        .filter((f) => !category || f.category === category)
        .filter((f) => !needle || normalizeTr(f.name).includes(needle));
      return { total: items.length, items };
    },
  ],
  [
    /^\/tips$/,
    (q) => {
      const age = parseAge(q.ageMonths);
      const items = TIPS.filter((t) => age === undefined || (age >= t.fromMonths && age < t.toMonths));
      return { total: items.length, items };
    },
  ],
  [/^\/myths$/, () => ({ total: MYTHS.length, items: MYTHS })],
  [/^\/articles$/, () => ({ total: ARTICLES.length, items: ARTICLES.map(({ sections: _s, ...rest }) => rest) })],
  [
    /^\/articles\/([^/]+)$/,
    (_q, [id]) => {
      const article = ARTICLES.find((a) => a.id === id);
      if (!article) throw new HttpError(404, "Makale bulunamadı");
      return { ...article, sources: article.sources.map((s) => SOURCES[s]) };
    },
  ],
  [/^\/plan\/daily$/, (q) => buildDailyPlan(parsePlanInput(q))],
  [/^\/plan\/weekly$/, (q) => buildWeeklyPlan(parsePlanInput(q))],
];

/** `/api` önekinden sonraki yolu ve sorgu parametrelerini işler. */
export function handleApi(path: string, query: Query): ApiResponse {
  try {
    for (const [pattern, handler, cacheSeconds] of routes) {
      const match = pattern.exec(path);
      if (match) return { status: 200, body: handler(query, match.slice(1).map(decodeURIComponent)), cacheSeconds };
    }
    throw new HttpError(404, "Uç nokta bulunamadı");
  } catch (err) {
    if (err instanceof HttpError) return { status: err.status, body: { error: err.message } };
    throw err;
  }
}
