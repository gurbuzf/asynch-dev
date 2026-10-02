import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/app.ts";

const app = createApp();

describe("API", () => {
  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.recipes).toBeGreaterThan(40);
  });

  it("GET /api/meta evreleri ve alerjenleri döndürür", async () => {
    const res = await request(app).get("/api/meta");
    expect(res.body.stages).toHaveLength(5);
    expect(res.body.allergens).toHaveLength(9);
    expect(res.body.labels.meals.kahvalti).toBe("Kahvaltı");
  });

  it("GET /api/recipes yaşa göre filtreler", async () => {
    const res = await request(app).get("/api/recipes").query({ ageMonths: 6, exclude: "yumurta,sut" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(5);
    for (const r of res.body.items) {
      expect(r.minAgeMonths).toBeLessThanOrEqual(6);
      expect(r.allergens).not.toContain("yumurta");
      expect(r).not.toHaveProperty("steps");
    }
  });

  it("GET /api/recipes/:id tam tarifi, bilinmeyen id 404 döndürür", async () => {
    const ok = await request(app).get("/api/recipes/bebek-ezogelin");
    expect(ok.body.steps.length).toBeGreaterThan(2);
    const missing = await request(app).get("/api/recipes/yok-boyle-tarif");
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBeTruthy();
  });

  it("geçersiz parametrelerde 400 döndürür", async () => {
    expect((await request(app).get("/api/recipes").query({ ageMonths: "abc" })).status).toBe(400);
    expect((await request(app).get("/api/recipes").query({ exclude: "cikolata" })).status).toBe(400);
    expect((await request(app).get("/api/plan/daily")).status).toBe(400);
    expect((await request(app).get("/api/plan/daily").query({ ageMonths: 7, date: "2026-13-01" })).status).toBe(400);
    expect((await request(app).get("/api/plan/daily").query({ ageMonths: 7, method: "x" })).status).toBe(400);
  });

  it("GET /api/plan/daily kişiselleştirilmiş plan döndürür", async () => {
    const res = await request(app)
      .get("/api/plan/daily")
      .query({ ageMonths: 8.5, date: "2026-10-02", introduced: "yumurta,sut", tried: "kabak,brokoli,havuc", method: "blw" });
    expect(res.status).toBe(200);
    expect(res.body.meals).toHaveLength(3);
    expect(res.body.stage.id).toBe("kesif");
    expect(res.body.tip.title).toBeTruthy();
    expect(res.body.allergenSuggestion.allergen.id).toBe("yerfistigi");
  });

  it("GET /api/plan/weekly alışveriş listesiyle döner", async () => {
    const res = await request(app).get("/api/plan/weekly").query({ ageMonths: 10, date: "2026-10-02" });
    expect(res.body.days).toHaveLength(7);
    expect(Array.isArray(res.body.shopping)).toBe(true);
  });

  it("makale, besin, ipucu ve mit uçları", async () => {
    const list = await request(app).get("/api/articles");
    expect(list.body.items[0]).not.toHaveProperty("sections");
    const article = await request(app).get(`/api/articles/${list.body.items[0].id}`);
    expect(article.body.sections.length).toBeGreaterThan(0);
    expect(article.body.sources[0].url).toMatch(/^https:/);
    const foods = await request(app).get("/api/foods").query({ ageMonths: 6, q: "brokoli" });
    expect(foods.body.items[0].id).toBe("brokoli");
    const tips = await request(app).get("/api/tips").query({ ageMonths: 7 });
    expect(tips.body.total).toBeGreaterThan(3);
    const myths = await request(app).get("/api/myths");
    expect(myths.body.total).toBeGreaterThan(5);
  });

  it("bilinmeyen API ucu JSON 404 döndürür", async () => {
    const res = await request(app).get("/api/olmayan");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});
