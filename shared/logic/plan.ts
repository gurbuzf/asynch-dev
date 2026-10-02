import { ALLERGENS, FOODS, RECIPES, RECIPE_BY_ID, TIPS } from "../data/index.ts";
import type {
  AllergenId,
  AllergenInfo,
  AllergenSuggestion,
  DailyPlan,
  Food,
  MealSlot,
  PlanInput,
  PlannedMeal,
  Recipe,
  ShoppingItem,
  Tip,
  WeeklyPlan,
} from "../types.ts";
import { addDays, daysBetween, stageForAge } from "./age.ts";
import { createRng, hashString, weightedPick } from "./random.ts";
import { normalizeTr, toSummary } from "./recipes.ts";

/** Yeni alerjenler arasında beklenecek gün sayısı */
export const ALLERGEN_GAP_DAYS = 3;
/** Alerjen tanıştırmaya başlamadan önce denenmiş olması önerilen besin sayısı */
export const MIN_FOODS_BEFORE_ALLERGENS = 3;

const ALLERGEN_MIN_AGE: Partial<Record<AllergenId, number>> = { kabuklu: 9 };

/** Yaşa göre günlük öğün dizilimi (WHO 2023 + NHS) */
export function mealSlotsForAge(ageMonths: number): MealSlot[] {
  if (ageMonths < 6) return [];
  if (ageMonths < 6.5) return ["ogle"];
  if (ageMonths < 8) return ["kahvalti", "ogle"];
  if (ageMonths < 9) return ["kahvalti", "ogle", "aksam"];
  if (ageMonths < 12) return ["kahvalti", "ogle", "ara", "aksam"];
  return ["kahvalti", "ara", "ogle", "ara", "aksam"];
}

function canEat(recipe: Recipe, ageMonths: number, allowed: Set<AllergenId>, allergies: Set<AllergenId>): boolean {
  if (recipe.minAgeMonths > ageMonths) return false;
  return recipe.allergens.every((a) => allowed.has(a) && !allergies.has(a));
}

function recipeWeight(recipe: Recipe, input: PlanInput, slot: MealSlot, avoid: Set<string>): number {
  let w = 1;
  if (recipe.meals.includes(slot)) w *= 6;
  if (recipe.methods.includes(input.method)) w *= 3;
  // Büyüdükçe daha "olgun" tarifleri öne çıkar, ilk tat pürelerini geri plana at
  const maturity = Math.min(input.ageMonths, 12) - 3;
  if (recipe.minAgeMonths >= maturity) w *= 2;
  if (input.ageMonths >= 9 && recipe.tags.includes("ilk-tat")) w *= 0.3;
  if (recipe.introducesAllergen) w *= 0.7;
  if (avoid.has(recipe.id)) w *= 0.05;
  return w;
}

function pickAllergen(input: PlanInput, allergies: Set<AllergenId>): { next?: AllergenInfo; note?: string } {
  if (input.ageMonths < 6) return {};
  const pending = ALLERGENS.filter(
    (a) =>
      !input.introducedAllergens.includes(a.id) &&
      !allergies.has(a.id) &&
      input.ageMonths >= (ALLERGEN_MIN_AGE[a.id] ?? 6),
  ).sort((a, b) => a.order - b.order);
  if (!pending.length) {
    return input.introducedAllergens.length ? { note: "Tüm temel alerjenler tanıştırıldı. Şimdi görev: düzenli olarak menüde tutmak! 🎉" } : {};
  }
  if (input.triedFoods.length < MIN_FOODS_BEFORE_ALLERGENS) {
    return {
      note: `Alerjenlere başlamadan önce birkaç (en az ${MIN_FOODS_BEFORE_ALLERGENS}) farklı besini sorunsuz denemesi önerilir. Şu ana kadar ${input.triedFoods.length} besin denendi.`,
    };
  }
  if (input.lastAllergenIntro) {
    const since = daysBetween(input.lastAllergenIntro, input.date);
    if (since >= 0 && since < ALLERGEN_GAP_DAYS) {
      const wait = ALLERGEN_GAP_DAYS - since;
      return {
        note: `Son yeni alerjen ${since === 0 ? "bugün" : `${since} gün önce`} tanıştırıldı. Olası gecikmiş reaksiyonları izleyebilmek için yeni alerjene ${wait} gün sonra geçin.`,
      };
    }
  }
  return { next: pending[0] };
}

function findAllergenRecipe(allergen: AllergenId, input: PlanInput, allowed: Set<AllergenId>, allergies: Set<AllergenId>): Recipe | undefined {
  const withTarget = new Set(allowed).add(allergen);
  const candidates = RECIPES.filter(
    (r) => r.allergens.includes(allergen) && canEat(r, input.ageMonths, withTarget, allergies),
  );
  // Öncelik: bu alerjeni tanıştırmak için tasarlanmış ve yalnızca bu yeni alerjeni içeren tarif
  return (
    candidates.find((r) => r.introducesAllergen === allergen) ??
    candidates.sort((a, b) => a.allergens.length - b.allergens.length)[0]
  );
}

function pickTip(ageMonths: number, date: string): Tip {
  const pool = TIPS.filter((t) => ageMonths >= t.fromMonths && ageMonths < t.toMonths);
  const list = pool.length ? pool : TIPS;
  return list[hashString(date) % list.length];
}

function pickFoodOfDay(input: PlanInput, allowed: Set<AllergenId>, allergies: Set<AllergenId>, rng: () => number): Food | undefined {
  if (input.ageMonths < 6) return undefined;
  const tried = new Set(input.triedFoods);
  const candidates = FOODS.filter(
    (f) =>
      f.minAgeMonths <= input.ageMonths &&
      !tried.has(f.id) &&
      (!f.allergen || (allowed.has(f.allergen) && !allergies.has(f.allergen))),
  );
  return weightedPick(
    candidates,
    (f) => (f.category === "sebze" ? 3 : 1) * (f.nutrients.includes("demir") ? 2 : 1),
    rng,
  );
}

function buildChecklist(ageMonths: number, hasAllergens: boolean): { id: string; text: string }[] {
  if (ageMonths < 6) {
    return [
      { id: "dvit", text: "D vitamini damlası verildi" },
      { id: "hazirlik", text: "Hazırlık işaretleri gözlemlendi (oturma, baş kontrolü, ilgi)" },
      { id: "sofra", text: "Aile sofrasında kucakta yer aldı" },
    ];
  }
  const list = [
    { id: "dvit", text: "D vitamini verildi" },
    { id: "demir", text: "En az bir demir kaynağı yedi" },
    { id: "su", text: "Öğünlerde açık bardaktan su sunuldu" },
    { id: "yesil", text: "Bir yeşil sebze sunuldu" },
    { id: "renk", text: "Tabakta en az 3 farklı renk vardı" },
  ];
  if (ageMonths < 12) list.splice(1, 0, { id: "demir-destek", text: "Doktorun önerdiği demir desteği verildi" });
  if (hasAllergens) list.push({ id: "alerjen", text: "Tanıştırılan alerjenlerden biri menüdeydi" });
  if (ageMonths >= 12) {
    list.push({ id: "sut", text: "İnek sütü 500 ml'yi geçmedi" });
    list.push({ id: "ekran", text: "Ekransız, birlikte yenen bir öğün" });
  } else {
    list.push({ id: "duyarli", text: "Tokluk işaretlerine saygı gösterildi, ısrar edilmedi" });
  }
  return list;
}

export function buildDailyPlan(input: PlanInput): DailyPlan {
  const stage = stageForAge(input.ageMonths);
  const allergies = new Set(input.allergies);
  const allowed = new Set(input.introducedAllergens.filter((a) => !allergies.has(a)));
  const rng = createRng(hashString(`${input.date}|${input.shuffle ?? 0}|${input.method}`));
  const avoid = new Set(input.avoidRecipes ?? []);
  const slots = mealSlotsForAge(input.ageMonths);
  const tip = pickTip(input.ageMonths, input.date);

  const base: DailyPlan = {
    date: input.date,
    ageMonths: input.ageMonths,
    stage,
    started: slots.length > 0,
    meals: [],
    allergenMaintenance: ALLERGENS.filter((a) => allowed.has(a.id)),
    tip,
    checklist: buildChecklist(input.ageMonths, allowed.size > 0),
  };
  if (!slots.length) return base;

  // 1) Bugünün yeni alerjeni
  const { next, note } = pickAllergen(input, allergies);
  let allergenSuggestion: AllergenSuggestion | undefined;
  const meals: PlannedMeal[] = [];
  const used = new Set<string>();

  if (next) {
    const recipe = findAllergenRecipe(next.id, input, allowed, allergies);
    allergenSuggestion = {
      allergen: next,
      recipe: recipe ? toSummary(recipe) : undefined,
      message: `Bugün ${next.name.toLocaleLowerCase("tr")} ile tanışma günü! Sabah veya öğle saatinde, az miktarla başlayın ve sonrasında 2 saat izleyin.`,
    };
    if (recipe) {
      // Alerjen tarifini günün en erken uygun öğününe yerleştir
      const slot = slots.find((s) => s !== "ara" && recipe.meals.includes(s)) ?? slots[0];
      meals.push({ slot, recipe: toSummary(recipe), reason: `${next.emoji} Yeni alerjen: ${next.name}` });
      used.add(recipe.id);
    }
  }

  // 2) Diğer öğünler
  for (const slot of slots) {
    if (meals.some((m) => m.slot === slot) && slot !== "ara") continue;
    if (slot === "ara" && meals.filter((m) => m.slot === "ara").length >= slots.filter((s) => s === "ara").length) continue;
    const candidates = RECIPES.filter((r) => !used.has(r.id) && canEat(r, input.ageMonths, allowed, allergies));
    const chosen = weightedPick(candidates, (r) => recipeWeight(r, input, slot, avoid), rng);
    if (!chosen) continue;
    used.add(chosen.id);
    meals.push({ slot, recipe: toSummary(chosen), reason: reasonFor(chosen, slot) });
  }

  // 3) Demir garantisi: hiçbir öğünde demir yoksa bir ana öğünü demirli tarifle değiştir
  if (!meals.some((m) => m.recipe.nutrients.includes("demir"))) {
    const target = meals.findIndex((m) => (m.slot === "ogle" || m.slot === "aksam") && !m.recipe.introducesAllergen);
    const idx = target >= 0 ? target : meals.findIndex((m) => !m.recipe.introducesAllergen);
    const ironCandidates = RECIPES.filter(
      (r) => !used.has(r.id) && r.nutrients.includes("demir") && canEat(r, input.ageMonths, allowed, allergies),
    );
    const iron = weightedPick(ironCandidates, (r) => recipeWeight(r, input, meals[idx]?.slot ?? "ogle", avoid), rng);
    if (iron && idx >= 0) {
      used.delete(meals[idx].recipe.id);
      used.add(iron.id);
      meals[idx] = { slot: meals[idx].slot, recipe: toSummary(iron), reason: "🩸 Günün demir kaynağı" };
    }
  }

  const order: MealSlot[] = ["kahvalti", "ara", "ogle", "aksam"];
  const sorted = slots.map((slot, i) => ({ slot, i }));
  // Öğünleri yaşa göre dizilim sırasına koy (ara öğünler iki ana öğün arasında)
  const placed: PlannedMeal[] = [];
  const pool = [...meals];
  for (const { slot } of sorted) {
    const idx = pool.findIndex((m) => m.slot === slot);
    if (idx >= 0) placed.push(pool.splice(idx, 1)[0]);
  }
  placed.push(...pool.sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot)));

  return {
    ...base,
    meals: placed,
    allergenSuggestion,
    allergenNote: note,
    foodOfDay: pickFoodOfDay(input, allowed, allergies, rng),
  };
}

function reasonFor(recipe: Recipe, slot: MealSlot): string {
  if (recipe.nutrients.includes("demir")) return "🩸 Demir zengini";
  if (recipe.nutrients.includes("omega3")) return "🧠 Omega-3 kaynağı";
  if (recipe.tags.includes("yesil")) return "🥦 Yeşil sebze tekrarı";
  if (recipe.nutrients.includes("kalsiyum")) return "🦴 Kalsiyum kaynağı";
  if (slot === "ara") return "🍎 Hafif ara öğün";
  if (recipe.tags.includes("blw")) return "✋ Kendi kendine yeme pratiği";
  return "🌈 Çeşitlilik için";
}

/** 7 günlük plan: alerjen takvimini de ileriye doğru simüle eder */
export function buildWeeklyPlan(input: PlanInput, days = 7): WeeklyPlan {
  const plans: DailyPlan[] = [];
  let introduced = [...input.introducedAllergens];
  let lastIntro = input.lastAllergenIntro;
  let tried = [...input.triedFoods];
  let recent: string[] = [...(input.avoidRecipes ?? [])];

  for (let d = 0; d < days; d++) {
    const date = addDays(input.date, d);
    const plan = buildDailyPlan({
      ...input,
      date,
      ageMonths: Math.round((input.ageMonths + d / 30.4375) * 100) / 100,
      introducedAllergens: introduced,
      lastAllergenIntro: lastIntro,
      triedFoods: tried,
      avoidRecipes: recent,
    });
    plans.push(plan);
    if (plan.allergenSuggestion?.recipe) {
      introduced = [...introduced, plan.allergenSuggestion.allergen.id];
      lastIntro = date;
    }
    if (plan.foodOfDay) tried = [...tried, plan.foodOfDay.id];
    recent = [...recent, ...plan.meals.map((m) => m.recipe.id)].slice(-14);
  }
  return { days: plans, shopping: buildShoppingList(plans) };
}

const NON_SHOPPING = /^(sıcak )?su\b|anne sütü|haşlama suyu|pişirme suyu|tavuk suyu veya su/i;

export function buildShoppingList(plans: DailyPlan[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>();
  for (const plan of plans) {
    for (const meal of plan.meals) {
      const recipe = RECIPE_BY_ID[meal.recipe.id];
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        if (NON_SHOPPING.test(ing.name)) continue;
        const key = normalizeTr(ing.name);
        const item = items.get(key) ?? { name: ing.name, group: ing.group, amounts: [], recipes: [] };
        item.amounts.push(ing.amount);
        if (!item.recipes.includes(recipe.title)) item.recipes.push(recipe.title);
        items.set(key, item);
      }
    }
  }
  return [...items.values()].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name, "tr"));
}
