import { useMemo } from "react";
import type { AllergenId } from "../../../shared/types.ts";
import { buildUrl } from "./api.ts";
import type { Baby } from "./baby.ts";
import { lastAllergenIntro, today, useStore } from "./store.ts";

/** Profil + günlük kayıtlarından plan API adresini üretir */
export function usePlanUrl(baby: Baby | undefined, kind: "daily" | "weekly"): string | null {
  const allergens = useStore((s) => s.allergens);
  const tried = useStore((s) => s.tried);
  const shuffleMap = useStore((s) => s.shuffle);
  const day = today();
  return useMemo(() => {
    if (!baby) return null;
    const introduced = (Object.keys(allergens) as AllergenId[]).filter((id) => allergens[id]?.introducedAt);
    return buildUrl(`/api/plan/${kind}`, {
      ageMonths: baby.ageMonths,
      date: day,
      method: baby.profile.method,
      introduced,
      allergies: baby.profile.allergies,
      tried: Object.keys(tried),
      lastAllergenIntro: lastAllergenIntro(allergens),
      shuffle: kind === "daily" ? shuffleMap[day] : undefined,
    });
  }, [baby, allergens, tried, shuffleMap, day, kind]);
}

export function useIntroduced(): AllergenId[] {
  const allergens = useStore((s) => s.allergens);
  return useMemo(() => (Object.keys(allergens) as AllergenId[]).filter((id) => allergens[id]?.introducedAt), [allergens]);
}
