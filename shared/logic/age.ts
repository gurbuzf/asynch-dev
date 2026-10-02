import { STAGES } from "../data/reference.ts";
import type { Stage } from "../types.ts";

const DAY_MS = 86_400_000;
const AVG_MONTH_DAYS = 30.4375;

export interface AgeInfo {
  months: number;
  days: number;
  totalDays: number;
  /** Ondalıklı ay (ör. 7.4) — plan ve filtreleme için */
  decimalMonths: number;
  /** Prematüre düzeltmesi uygulandıysa true */
  corrected: boolean;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = parseIsoDate(value);
  return !Number.isNaN(d.getTime()) && toIsoDate(d) === value;
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return toIsoDate(new Date(parseIsoDate(iso).getTime() + days * DAY_MS));
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS);
}

/** Takvim ayı farkı + kalan gün (ör. 15 Mart → 2 Mayıs = 1 ay 17 gün). */
function calendarDiff(from: Date, to: Date): { months: number; days: number } {
  let months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  if (months < 0) return { months: 0, days: 0 };
  const anchor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, 1));
  // Ayın son gününü aşmayacak şekilde doğum gününe sabitle (31 Ocak + 1 ay → 28/29 Şubat)
  const lastDay = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0)).getUTCDate();
  anchor.setUTCDate(Math.min(from.getUTCDate(), lastDay));
  const days = Math.round((to.getTime() - anchor.getTime()) / DAY_MS);
  return { months, days };
}

/**
 * Bebeğin yaşını hesaplar. 37 haftadan önce doğan bebeklerde 2 yaşına kadar düzeltilmiş yaş kullanılır.
 */
export function computeAge(birthDate: string, today: string, gestationWeeks?: number): AgeInfo {
  let effectiveBirth = parseIsoDate(birthDate);
  const now = parseIsoDate(today);
  let corrected = false;

  if (gestationWeeks && gestationWeeks >= 22 && gestationWeeks < 37) {
    const shiftDays = Math.round((40 - gestationWeeks) * 7);
    const shifted = new Date(effectiveBirth.getTime() + shiftDays * DAY_MS);
    const chronoDays = (now.getTime() - effectiveBirth.getTime()) / DAY_MS;
    if (chronoDays < 24 * AVG_MONTH_DAYS) {
      effectiveBirth = shifted;
      corrected = true;
    }
  }

  const totalDays = Math.max(0, Math.round((now.getTime() - effectiveBirth.getTime()) / DAY_MS));
  const { months, days } = calendarDiff(effectiveBirth, now);
  const decimalMonths = Math.round((months + days / AVG_MONTH_DAYS) * 100) / 100;
  return { months, days, totalDays, decimalMonths, corrected };
}

export function formatAge(age: Pick<AgeInfo, "months" | "days">): string {
  if (age.months === 0) return `${age.days} günlük`;
  if (age.months >= 24) {
    const years = Math.floor(age.months / 12);
    const rest = age.months % 12;
    return rest ? `${years} yaş ${rest} aylık` : `${years} yaşında`;
  }
  return age.days ? `${age.months} ay ${age.days} günlük` : `${age.months} aylık`;
}

export function stageForAge(ageMonths: number): Stage {
  let current = STAGES[0];
  for (const stage of STAGES) {
    if (ageMonths >= stage.fromMonths) current = stage;
  }
  return current;
}

/** Evre içindeki ilerleme (0–1) */
export function stageProgress(ageMonths: number): number {
  const stage = stageForAge(ageMonths);
  const span = stage.toMonths - stage.fromMonths;
  return Math.min(1, Math.max(0, (ageMonths - stage.fromMonths) / span));
}
