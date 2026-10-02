import { ALLERGENS, NUTRIENT_LABELS } from "../../../shared/data/reference.ts";
import type { Food } from "../../../shared/types.ts";
import { relativeDay } from "../lib/baby.ts";
import { actions, useStore, type Reaction } from "../lib/store.ts";
import { Badge, Callout, Sheet, cx } from "./ui.tsx";

export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
  { id: "sevdi", emoji: "😍", label: "Sevdi" },
  { id: "notr", emoji: "😐", label: "Kararsız" },
  { id: "sevmedi", emoji: "🙅", label: "Sevmedi" },
  { id: "reaksiyon", emoji: "⚠️", label: "Reaksiyon" },
];

export const CHOKING: Record<Food["choking"], { label: string; tone: "sage" | "sun" | "danger" }> = {
  dusuk: { label: "Düşük boğulma riski", tone: "sage" },
  orta: { label: "Orta boğulma riski — doğru kesin", tone: "sun" },
  yuksek: { label: "Yüksek boğulma riski — dikkat!", tone: "danger" },
};

export function servingKey(ageMonths: number): keyof Food["serving"] {
  if (ageMonths < 9) return "6-8";
  if (ageMonths < 12) return "9-11";
  return "12+";
}

const EXPOSURE_GOAL = 10;

export function FoodSheet({ food, ageMonths, onClose }: { food: Food | null; ageMonths: number; onClose: () => void }) {
  const entry = useStore((s) => (food ? s.tried[food.id] : undefined));
  if (!food) return null;
  const locked = food.minAgeMonths > ageMonths;
  const current = servingKey(ageMonths);
  const allergen = food.allergen ? ALLERGENS.find((a) => a.id === food.allergen) : undefined;

  return (
    <Sheet open onClose={onClose} title={food.name}>
      <div className="flex items-center gap-4 pr-10">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-card border border-line text-5xl" aria-hidden>
          {food.emoji}
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">{food.name}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="primary">{food.minAgeMonths}+ ay</Badge>
            <Badge tone={CHOKING[food.choking].tone}>{CHOKING[food.choking].label}</Badge>
            {allergen && <Badge tone="sun">{allergen.emoji} Alerjen</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {food.nutrients.map((n) => (
          <Badge key={n} tone="sage">
            {NUTRIENT_LABELS[n].emoji} {NUTRIENT_LABELS[n].label}
          </Badge>
        ))}
      </div>

      <h3 className="mt-5 font-extrabold">Yaşa göre nasıl sunulur?</h3>
      <div className="mt-2 space-y-2">
        {(["6-8", "9-11", "12+"] as const).map((k) => (
          <div key={k} className={cx("rounded-2xl border-2 p-3", k === current ? "border-primary bg-primary-soft" : "border-line bg-card")}>
            <p className={cx("text-xs font-black uppercase tracking-wide", k === current ? "text-primary-ink" : "text-muted")}>
              {k} ay {k === current && "· şu an"}
            </p>
            <p className="mt-0.5 font-semibold leading-snug">{food.serving[k]}</p>
          </div>
        ))}
      </div>

      {food.note && (
        <Callout tone="info" className="mt-3">
          {food.note}
        </Callout>
      )}
      {allergen && !locked && (
        <Callout tone="warn" className="mt-3">
          <b>İlk deneme:</b> {allergen.firstServe}
        </Callout>
      )}

      {locked ? (
        <Callout tone="warn" className="mt-4" icon="🔒">
          Bu besin için {food.minAgeMonths}. ayı bekleyin.
        </Callout>
      ) : (
        <div className="mt-5">
          <h3 className="font-extrabold">{entry ? `Denendi · ${entry.count} kez (${relativeDay(entry.lastDate)})` : "Tadım pasaportuna ekle"}</h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {REACTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => actions.markTried(food.id, r.id)}
                className={cx(
                  "flex flex-col items-center gap-1 rounded-2xl border-2 py-2.5 text-xs font-extrabold transition active:scale-95",
                  entry?.reaction === r.id ? (r.id === "reaksiyon" ? "border-danger bg-danger-soft" : "border-sage bg-sage-soft") : "border-line bg-card",
                )}
              >
                <span className="text-2xl" aria-hidden>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-muted">Her dokunuş bir deneme olarak sayılır.</p>

          {entry && entry.reaction !== "sevdi" && entry.reaction !== "reaksiyon" && (
            <div className="mt-4 rounded-2xl bg-sun-soft p-3 text-sun-ink">
              <p className="font-extrabold">Tekrar maruziyet: {Math.min(entry.count, EXPOSURE_GOAL)}/{EXPOSURE_GOAL}</p>
              <div className="mt-2 flex gap-1" aria-hidden>
                {Array.from({ length: EXPOSURE_GOAL }, (_, i) => (
                  <span key={i} className={cx("h-2.5 flex-1 rounded-full", i < entry.count ? "bg-sun" : "bg-card")} />
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold">Bir besinin kabulü 8–15 deneme sürebilir. Farklı şekillerde sunmaya devam edin!</p>
            </div>
          )}
          {entry?.reaction === "reaksiyon" && (
            <Callout tone="danger" className="mt-4">
              Bu besini kesin ve çocuk doktorunuza danışın. Nefes darlığı, şişlik veya halsizlik varsa hemen 112'yi arayın.
            </Callout>
          )}
          {entry && (
            <button onClick={() => actions.untry(food.id)} className="mt-3 text-sm font-bold text-muted underline">
              Kaydı sil
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
