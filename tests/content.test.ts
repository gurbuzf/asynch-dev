import { describe, expect, it } from "vitest";
import { ALLERGENS, ARTICLES, FOODS, MYTHS, RECIPES, SOURCES, TIPS } from "../shared/data/index.ts";
import type { AllergenId } from "../shared/types.ts";

// Bu testler içerik güvenliğini korur: yanlış bir düzenleme bebeğe zarar verebilecek bir öneriye dönüşmesin.

const lower = (s: string) => s.toLocaleLowerCase("tr");

/** Malzeme adından beklenen alerjenler (sezgisel ama katı) */
const ALLERGEN_PATTERNS: [AllergenId, RegExp][] = [
  ["yumurta", /yumurta/],
  ["sut", /yoğurt|peynir|\blor\b|tereyağ|kaşar|(?<!anne )süt(?!ü yerine)/],
  ["bugday", /bulgur|irmik|makarna|ekmek|şehriye|\bun\b|buğday unu|tam buğday/],
  ["susam", /tahin|susam/],
  ["yerfistigi", /fıstık/],
  ["balik", /somon|hamsi|balık|levrek|sardalya|mezgit/],
  ["agacyemisi", /ceviz|badem|fındık/],
];

describe("tarif içerik güvenliği", () => {
  it("tarif kimlikleri benzersiz", () => {
    const ids = RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("en az 40 tarif ve her yaş evresi için seçenek var", () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(40);
    for (const age of [6, 7, 9, 12]) {
      expect(RECIPES.filter((r) => r.minAgeMonths === age).length).toBeGreaterThan(0);
    }
  });

  it("12 ay altı tariflerde bal, eklenmiş tuz veya şeker yok", () => {
    for (const r of RECIPES.filter((r) => r.minAgeMonths < 12)) {
      for (const ing of r.ingredients) {
        const name = lower(ing.name);
        expect(name, `${r.id}: ${ing.name}`).not.toMatch(/(^|\s)bal(\s|$)(?!kabağı)/);
        expect(name.replace(/bal kabağı/g, ""), `${r.id}: ${ing.name}`).not.toMatch(/\bbal\b/);
        expect(name.replace(/tuzsuz/g, ""), `${r.id}: ${ing.name}`).not.toMatch(/tuz/);
        expect(name.replace(/şekersiz/g, ""), `${r.id}: ${ing.name}`).not.toMatch(/şeker|pekmez/);
      }
    }
  });

  it("malzemelerdeki alerjenler tarifin alerjen listesinde beyan edilmiş", () => {
    for (const r of RECIPES) {
      const text = r.ingredients.map((i) => lower(i.name)).join(" | ");
      for (const [allergen, pattern] of ALLERGEN_PATTERNS) {
        if (pattern.test(text)) {
          expect(r.allergens, `${r.id} '${allergen}' içeriyor ama beyan edilmemiş`).toContain(allergen);
        }
      }
    }
  });

  it("alerjen tanıştırma tarifleri o alerjeni içeriyor", () => {
    for (const r of RECIPES.filter((r) => r.introducesAllergen)) {
      expect(r.allergens).toContain(r.introducesAllergen);
    }
  });

  it("yaşa göre uyarlamalar tarifin başlangıç yaşından başlıyor ve artan sırada", () => {
    for (const r of RECIPES) {
      expect(r.ageAdaptations.length, r.id).toBeGreaterThan(0);
      expect(r.ageAdaptations[0].fromMonths, r.id).toBe(r.minAgeMonths);
      const months = r.ageAdaptations.map((a) => a.fromMonths);
      expect([...months].sort((a, b) => a - b), r.id).toEqual(months);
    }
  });

  it("her tarifte adımlar, malzemeler ve uzman notu var", () => {
    for (const r of RECIPES) {
      expect(r.steps.length, r.id).toBeGreaterThanOrEqual(2);
      expect(r.ingredients.length, r.id).toBeGreaterThanOrEqual(2);
      expect(r.expertNote.length, r.id).toBeGreaterThan(40);
      expect(r.meals.length, r.id).toBeGreaterThan(0);
    }
  });

  it("her alerjen için en az bir tanıştırma yolu var (kabuklu hariç)", () => {
    for (const a of ALLERGENS.filter((a) => !["kabuklu", "soya", "agacyemisi"].includes(a.id))) {
      expect(RECIPES.some((r) => r.allergens.includes(a.id)), a.id).toBe(true);
    }
  });
});

describe("besin veritabanı", () => {
  it("kimlikler benzersiz, yaşlar mantıklı", () => {
    const ids = FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of FOODS) {
      expect(f.minAgeMonths).toBeGreaterThanOrEqual(6);
      expect(f.serving["6-8"].length).toBeGreaterThan(5);
    }
  });

  it("inek sütü içecek olarak 12 aydan önce önerilmiyor", () => {
    expect(FOODS.find((f) => f.id === "inek-sutu")?.minAgeMonths).toBe(12);
  });

  it("üzüm, nohut, fıstık ezmesi gibi besinler yüksek boğulma riskli işaretli", () => {
    for (const id of ["uzum", "nohut", "fistik-ezmesi", "ceviz", "havuc", "elma"]) {
      expect(FOODS.find((f) => f.id === id)?.choking, id).toBe("yuksek");
    }
  });
});

describe("ipuçları, mitler ve makaleler", () => {
  it("ipucu yaş aralıkları geçerli ve kaynakları mevcut", () => {
    for (const t of TIPS) {
      expect(t.fromMonths).toBeLessThan(t.toMonths);
      if (t.source) expect(SOURCES[t.source]).toBeDefined();
    }
  });

  it("0–24 ayın her ayı için en az bir ipucu var", () => {
    for (let m = 0; m < 24; m += 0.5) {
      expect(TIPS.some((t) => m >= t.fromMonths && m < t.toMonths), `ay ${m}`).toBe(true);
    }
  });

  it("makale ve mit kaynakları tanımlı", () => {
    for (const a of ARTICLES) for (const s of a.sources) expect(SOURCES[s], `${a.id}:${s}`).toBeDefined();
    for (const m of MYTHS) if (m.source) expect(SOURCES[m.source]).toBeDefined();
  });
});
