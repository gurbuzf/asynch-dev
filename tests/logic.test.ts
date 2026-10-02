import { describe, expect, it } from "vitest";
import { RECIPE_BY_ID } from "../shared/data/index.ts";
import { addDays, computeAge, daysBetween, formatAge, isIsoDate, stageForAge } from "../shared/logic/age.ts";
import { ALLERGEN_GAP_DAYS, buildDailyPlan, buildWeeklyPlan, mealSlotsForAge } from "../shared/logic/plan.ts";
import { adaptationForAge, filterRecipes, normalizeTr } from "../shared/logic/recipes.ts";
import type { PlanInput } from "../shared/types.ts";

const base: PlanInput = {
  ageMonths: 7.2,
  date: "2026-10-02",
  method: "karma",
  introducedAllergens: [],
  allergies: [],
  triedFoods: ["kabak", "brokoli", "tatli-patates", "havuc"],
};

describe("yaş hesaplama", () => {
  it("takvim ayı ve gün farkını hesaplar", () => {
    expect(computeAge("2026-03-15", "2026-10-02")).toMatchObject({ months: 6, days: 17, corrected: false });
    expect(computeAge("2026-01-31", "2026-02-28")).toMatchObject({ months: 0, days: 28 });
    expect(computeAge("2026-01-31", "2026-03-01")).toMatchObject({ months: 1 });
  });

  it("prematüre bebeklerde düzeltilmiş yaş kullanır", () => {
    const chrono = computeAge("2026-03-01", "2026-10-01");
    const corrected = computeAge("2026-03-01", "2026-10-01", 32);
    expect(corrected.corrected).toBe(true);
    expect(chrono.totalDays - corrected.totalDays).toBe(56);
    expect(computeAge("2026-03-01", "2026-10-01", 38).corrected).toBe(false);
  });

  it("gelecekteki doğum tarihinde negatif yaş üretmez", () => {
    expect(computeAge("2026-12-01", "2026-10-01")).toMatchObject({ months: 0, days: 0, totalDays: 0 });
  });

  it("yaşı okunur biçimde yazar", () => {
    expect(formatAge({ months: 7, days: 12 })).toBe("7 ay 12 günlük");
    expect(formatAge({ months: 0, days: 20 })).toBe("20 günlük");
    expect(formatAge({ months: 9, days: 0 })).toBe("9 aylık");
    expect(formatAge({ months: 26, days: 3 })).toBe("2 yaş 2 aylık");
  });

  it("tarih yardımcıları", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(daysBetween("2026-10-01", "2026-10-04")).toBe(3);
  });

  it("evreleri doğru eşler", () => {
    expect(stageForAge(3).id).toBe("hazirlik");
    expect(stageForAge(6).id).toBe("ilk-tatlar");
    expect(stageForAge(8.5).id).toBe("kesif");
    expect(stageForAge(10).id).toBe("pratik");
    expect(stageForAge(30).id).toBe("aile-sofrasi");
  });
});

describe("öğün sayısı", () => {
  it("yaşla birlikte artar (WHO 2023)", () => {
    expect(mealSlotsForAge(5)).toHaveLength(0);
    expect(mealSlotsForAge(6.1)).toEqual(["ogle"]);
    expect(mealSlotsForAge(7)).toHaveLength(2);
    expect(mealSlotsForAge(8.5)).toHaveLength(3);
    expect(mealSlotsForAge(10)).toHaveLength(4);
    expect(mealSlotsForAge(14)).toHaveLength(5);
  });
});

describe("günlük plan", () => {
  it("6 aydan küçük bebekte menü üretmez", () => {
    const plan = buildDailyPlan({ ...base, ageMonths: 4.5 });
    expect(plan.started).toBe(false);
    expect(plan.meals).toHaveLength(0);
    expect(plan.stage.id).toBe("hazirlik");
  });

  it("aynı girdi için deterministik, shuffle ile değişir", () => {
    const a = buildDailyPlan(base);
    const b = buildDailyPlan(base);
    expect(a.meals.map((m) => m.recipe.id)).toEqual(b.meals.map((m) => m.recipe.id));
    const variants = new Set(
      [1, 2, 3, 4, 5].map((s) => buildDailyPlan({ ...base, shuffle: s }).meals.map((m) => m.recipe.id).join()),
    );
    expect(variants.size).toBeGreaterThan(1);
  });

  it("yaşa uygun olmayan tarif önermez ve bir günde tekrar etmez", () => {
    for (const age of [6.2, 7, 8.5, 10, 13, 20]) {
      for (let s = 0; s < 15; s++) {
        const plan = buildDailyPlan({ ...base, ageMonths: age, shuffle: s, introducedAllergens: ["sut", "yumurta", "bugday"] });
        const ids = plan.meals.map((m) => m.recipe.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const m of plan.meals) expect(m.recipe.minAgeMonths).toBeLessThanOrEqual(age);
        expect(plan.meals).toHaveLength(mealSlotsForAge(age).length);
      }
    }
  });

  it("tanıştırılmamış alerjen içeren tarifi (günün alerjeni hariç) önermez", () => {
    for (let s = 0; s < 30; s++) {
      const plan = buildDailyPlan({ ...base, ageMonths: 10, shuffle: s, introducedAllergens: ["yumurta"] });
      const todays = plan.allergenSuggestion?.allergen.id;
      for (const m of plan.meals) {
        for (const a of m.recipe.allergens) {
          expect(a === "yumurta" || a === todays, `${m.recipe.id} → ${a}`).toBe(true);
        }
      }
    }
  });

  it("bilinen alerjileri asla önermez", () => {
    for (let s = 0; s < 30; s++) {
      const plan = buildDailyPlan({
        ...base,
        ageMonths: 11,
        shuffle: s,
        introducedAllergens: ["yumurta", "sut", "bugday", "susam", "balik"],
        allergies: ["yumurta"],
      });
      for (const m of plan.meals) expect(m.recipe.allergens).not.toContain("yumurta");
      expect(plan.allergenSuggestion?.allergen.id).not.toBe("yumurta");
      expect(plan.foodOfDay?.allergen).not.toBe("yumurta");
    }
  });

  it("her gün en az bir demir kaynağı içerir", () => {
    for (const age of [6.6, 7.5, 9, 12, 18]) {
      for (let s = 0; s < 20; s++) {
        const plan = buildDailyPlan({ ...base, ageMonths: age, shuffle: s, introducedAllergens: ["sut"] });
        expect(plan.meals.some((m) => m.recipe.nutrients.includes("demir")), `yaş ${age}, shuffle ${s}`).toBe(true);
      }
    }
  });

  it("birkaç besin denenmeden alerjen önermez", () => {
    const plan = buildDailyPlan({ ...base, triedFoods: ["kabak"] });
    expect(plan.allergenSuggestion).toBeUndefined();
    expect(plan.allergenNote).toMatch(/en az 3/);
  });

  it("alerjen sırası ile yumurtayı ilk önerir ve tarifini erken öğüne koyar", () => {
    const plan = buildDailyPlan(base);
    expect(plan.allergenSuggestion?.allergen.id).toBe("yumurta");
    const recipe = plan.allergenSuggestion?.recipe;
    expect(recipe?.introducesAllergen).toBe("yumurta");
    expect(plan.meals[0].recipe.id).toBe(recipe?.id);
  });

  it("son alerjenden sonra bekleme süresine uyar", () => {
    const plan = buildDailyPlan({ ...base, introducedAllergens: ["yumurta"], lastAllergenIntro: "2026-10-01" });
    expect(plan.allergenSuggestion).toBeUndefined();
    expect(plan.allergenNote).toMatch(/2 gün sonra/);
    const later = buildDailyPlan({ ...base, introducedAllergens: ["yumurta"], lastAllergenIntro: addDays(base.date, -ALLERGEN_GAP_DAYS) });
    expect(later.allergenSuggestion?.allergen.id).toBe("yerfistigi");
  });

  it("günün besini denenmemiş ve yaşa uygun", () => {
    const plan = buildDailyPlan(base);
    expect(plan.foodOfDay).toBeDefined();
    expect(base.triedFoods).not.toContain(plan.foodOfDay!.id);
    expect(plan.foodOfDay!.minAgeMonths).toBeLessThanOrEqual(base.ageMonths);
  });
});

describe("haftalık plan", () => {
  it("7 gün üretir, alerjenleri en az 3 gün arayla planlar", () => {
    const week = buildWeeklyPlan(base);
    expect(week.days).toHaveLength(7);
    const introDays = week.days.map((d, i) => (d.allergenSuggestion ? i : -1)).filter((i) => i >= 0);
    expect(introDays.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < introDays.length; i++) {
      expect(introDays[i] - introDays[i - 1]).toBeGreaterThanOrEqual(ALLERGEN_GAP_DAYS);
    }
    const ids = week.days.map((d) => d.allergenSuggestion?.allergen.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("alışveriş listesi tariflerin malzemelerini toplar, suyu dışarıda bırakır", () => {
    const week = buildWeeklyPlan({ ...base, ageMonths: 10, introducedAllergens: ["sut", "yumurta", "bugday"] });
    expect(week.shopping.length).toBeGreaterThan(5);
    expect(week.shopping.some((i) => /^su\b/.test(i.name))).toBe(false);
    for (const item of week.shopping) {
      expect(item.recipes.length).toBeGreaterThan(0);
      expect(item.amounts.length).toBeGreaterThan(0);
    }
  });

  it("hafta içinde aynı tarifi çok sık tekrar etmez", () => {
    const week = buildWeeklyPlan({ ...base, ageMonths: 10, introducedAllergens: ["sut", "yumurta", "bugday", "susam"] });
    const all = week.days.flatMap((d) => d.meals.map((m) => m.recipe.id));
    const counts = Object.values(all.reduce<Record<string, number>>((acc, id) => ((acc[id] = (acc[id] ?? 0) + 1), acc), {}));
    expect(Math.max(...counts)).toBeLessThanOrEqual(3);
  });
});

describe("tarif arama", () => {
  it("Türkçe karakterden bağımsız arar", () => {
    expect(normalizeTr("Işık Çorbası Ğ")).toBe("isik corbasi g");
    expect(filterRecipes({ q: "corba" }).some((r) => r.id === "bebek-ezogelin")).toBe(true);
    expect(filterRecipes({ q: "köfte" }).length).toBeGreaterThan(2);
  });

  it("yaş, öğün ve alerjen filtrelerini uygular", () => {
    const list = filterRecipes({ ageMonths: 6, exclude: ["yumurta"], meal: "kahvalti" });
    expect(list.length).toBeGreaterThan(0);
    for (const r of list) {
      expect(r.minAgeMonths).toBeLessThanOrEqual(6);
      expect(r.allergens).not.toContain("yumurta");
      expect(r.meals).toContain("kahvalti");
    }
  });

  it("yaşa uygun hazırlama önerisini seçer", () => {
    const r = RECIPE_BY_ID["kabak-puresi"];
    expect(adaptationForAge(r, 6.5).fromMonths).toBe(6);
    expect(adaptationForAge(r, 8).fromMonths).toBe(7);
    expect(adaptationForAge(r, 15).fromMonths).toBe(9);
  });
});

describe("Türkçe ekler", async () => {
  const { genitive } = await import("../shared/logic/text.ts");
  it("ünlü uyumuna göre tamlayan eki", () => {
    expect(genitive("Ela")).toBe("Ela'nın");
    expect(genitive("Can")).toBe("Can'ın");
    expect(genitive("Deniz")).toBe("Deniz'in");
    expect(genitive("Umut")).toBe("Umut'un");
    expect(genitive("Öykü")).toBe("Öykü'nün");
    expect(genitive("Doruk")).toBe("Doruk'un");
    expect(genitive("Elif")).toBe("Elif'in");
  });
});

describe("alışveriş listesi birleştirme", () => {
  it("parantezli açıklamaları aynı kalemde toplar", () => {
    const week = buildWeeklyPlan({ ...base, ageMonths: 11, introducedAllergens: ["sut", "yumurta", "bugday", "susam", "balik"] });
    const names = week.shopping.map((i) => i.name);
    expect(names.some((n) => n.includes("("))).toBe(false);
    expect(new Set(names).size).toBe(names.length);
  });
});
