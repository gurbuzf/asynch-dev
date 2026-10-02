import express, { type NextFunction, type Request, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
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
} from "../shared/data/index.ts";
import { isIsoDate, stageForAge, toIsoDate } from "../shared/logic/age.ts";
import { buildDailyPlan, buildWeeklyPlan } from "../shared/logic/plan.ts";
import { filterRecipes, normalizeTr, toSummary } from "../shared/logic/recipes.ts";
import type { AllergenId, FeedingMethod, FoodCategory, MealSlot, PlanInput } from "../shared/types.ts";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
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

function parsePlanInput(query: Request["query"]): PlanInput {
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

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  });

  const api = express.Router();

  api.get("/health", (_req, res) => {
    res.json({ ok: true, recipes: RECIPES.length, foods: FOODS.length, tips: TIPS.length, articles: ARTICLES.length });
  });

  api.get("/meta", (_req, res) => {
    res.set("Cache-Control", "public, max-age=3600");
    res.json({
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
    });
  });

  api.get("/stage", (req, res) => {
    res.json(stageForAge(parseAge(req.query.ageMonths, true)!));
  });

  api.get("/recipes", (req, res) => {
    const meal = str(req.query.meal);
    if (meal && !MEALS.has(meal)) throw new HttpError(400, "Geçersiz öğün");
    const method = str(req.query.method);
    if (method && !METHODS.has(method)) throw new HttpError(400, "Geçersiz yöntem");
    const list = filterRecipes({
      ageMonths: parseAge(req.query.ageMonths),
      meal: meal as MealSlot | undefined,
      q: str(req.query.q),
      tag: str(req.query.tag),
      exclude: parseAllergens(req.query.exclude),
      method: method as FeedingMethod | undefined,
      ironOnly: req.query.iron === "1",
      freezableOnly: req.query.freezable === "1",
    });
    res.json({ total: list.length, items: list.map(toSummary) });
  });

  api.get("/recipes/:id", (req, res) => {
    const recipe = RECIPE_BY_ID[req.params.id];
    if (!recipe) throw new HttpError(404, "Tarif bulunamadı");
    res.json(recipe);
  });

  api.get("/foods", (req, res) => {
    const age = parseAge(req.query.ageMonths);
    const category = str(req.query.category) as FoodCategory | undefined;
    const q = str(req.query.q);
    const needle = q ? normalizeTr(q) : "";
    const items = FOODS.filter((f) => age === undefined || f.minAgeMonths <= age)
      .filter((f) => !category || f.category === category)
      .filter((f) => !needle || normalizeTr(f.name).includes(needle));
    res.json({ total: items.length, items });
  });

  api.get("/tips", (req, res) => {
    const age = parseAge(req.query.ageMonths);
    const items = TIPS.filter((t) => age === undefined || (age >= t.fromMonths && age < t.toMonths));
    res.json({ total: items.length, items });
  });

  api.get("/myths", (_req, res) => {
    res.json({ total: MYTHS.length, items: MYTHS });
  });

  api.get("/articles", (_req, res) => {
    res.json({
      total: ARTICLES.length,
      items: ARTICLES.map(({ sections: _s, ...rest }) => rest),
    });
  });

  api.get("/articles/:id", (req, res) => {
    const article = ARTICLES.find((a) => a.id === req.params.id);
    if (!article) throw new HttpError(404, "Makale bulunamadı");
    res.json({ ...article, sources: article.sources.map((id) => SOURCES[id]) });
  });

  api.get("/plan/daily", (req, res) => {
    res.json(buildDailyPlan(parsePlanInput(req.query)));
  });

  api.get("/plan/weekly", (req, res) => {
    res.json(buildWeeklyPlan(parsePlanInput(req.query)));
  });

  api.use((_req, _res, next) => next(new HttpError(404, "Uç nokta bulunamadı")));

  app.use("/api", api);

  // Üretimde derlenmiş istemciyi sun (SPA)
  const dist = path.resolve(import.meta.dirname, "../dist");
  if (existsSync(dist)) {
    app.use(express.static(dist, { maxAge: "1h", index: false }));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(dist, "index.html"));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Beklenmeyen bir hata oluştu" });
  });

  return app;
}
