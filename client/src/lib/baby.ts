import { useMemo } from "react";
import { computeAge, formatAge, stageForAge, type AgeInfo } from "../../../shared/logic/age.ts";
import type { Stage } from "../../../shared/types.ts";
import { today, useStore, type Profile } from "./store.ts";

export interface Baby {
  profile: Profile;
  age: AgeInfo;
  ageLabel: string;
  ageMonths: number;
  stage: Stage;
}

export function useBaby(): Baby | undefined {
  const profile = useStore((s) => s.profile);
  const day = today();
  return useMemo(() => {
    if (!profile) return undefined;
    const age = computeAge(profile.birthDate, day, profile.gestationWeeks);
    return { profile, age, ageLabel: formatAge(age), ageMonths: age.decimalMonths, stage: stageForAge(age.decimalMonths) };
  }, [profile, day]);
}

export function relativeDay(iso: string, now = today()): string {
  const diff = Math.round((Date.parse(now) - Date.parse(iso)) / 86_400_000);
  if (diff <= 0) return "bugün";
  if (diff === 1) return "dün";
  if (diff < 7) return `${diff} gün önce`;
  if (diff < 30) return `${Math.floor(diff / 7)} hafta önce`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("tr-TR", opts);
}
