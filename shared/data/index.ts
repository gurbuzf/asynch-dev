import type { Recipe } from "../types.ts";
import { RECIPES_FIRST } from "./recipes-first.ts";
import { RECIPES_EXPLORE } from "./recipes-explore.ts";
import { RECIPES_FAMILY } from "./recipes-family.ts";

export * from "./reference.ts";
export { FOODS, FOOD_BY_ID } from "./foods.ts";
export { TIPS, MYTHS } from "./tips.ts";
export { ARTICLES } from "./articles.ts";

export const RECIPES: Recipe[] = [...RECIPES_FIRST, ...RECIPES_EXPLORE, ...RECIPES_FAMILY];
export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
