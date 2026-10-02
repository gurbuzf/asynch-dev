import { useEffect, useState } from "react";
import { MEAL_LABELS, TEXTURE_LABELS } from "../../../shared/data/reference.ts";
import { genitive } from "../../../shared/logic/text.ts";
import type { Recipe } from "../../../shared/types.ts";
import { emojiBg } from "../components/RecipeCard.tsx";
import { AllergenBadges, Badge, Button, Callout, Card, ErrorState, NutrientChips, SectionTitle, Skeleton, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { useBaby } from "../lib/baby.ts";
import { useIntroduced } from "../lib/plan.ts";
import { back } from "../lib/router.ts";
import { actions, useStore } from "../lib/store.ts";

export function RecipeDetail({ id }: { id: string }) {
  const baby = useBaby()!;
  const introduced = useIntroduced();
  const { data: recipe, error, reload } = useApi<Recipe>(`/api/recipes/${encodeURIComponent(id)}`);
  const favorite = useStore((s) => s.favorites.includes(id));
  const [checked, setChecked] = useState<number[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [cooking, setCooking] = useState(false);

  if (error && !recipe) return <ErrorState message={error} onRetry={reload} />;
  if (!recipe) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const age = baby.ageMonths;
  const tooYoung = recipe.minAgeMonths > age;
  const adaptation = [...recipe.ageAdaptations].reverse().find((a) => a.fromMonths <= age);
  const newAllergens = recipe.allergens.filter((a) => !introduced.includes(a));
  const blocked = recipe.allergens.filter((a) => baby.profile.allergies.includes(a));

  return (
    <article className="pb-6">
      <div className="flex items-center justify-between pt-1">
        <button onClick={() => back("/tarifler")} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold text-muted">
          ← Geri
        </button>
        <button
          onClick={() => actions.toggleFavorite(recipe.id)}
          aria-pressed={favorite}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold"
        >
          {favorite ? "❤️ Favoride" : "🤍 Favorile"}
        </button>
      </div>

      <header className="mt-4 text-center animate-pop">
        <div className={cx("mx-auto grid h-32 w-32 place-items-center rounded-[2.5rem] text-7xl shadow-soft", emojiBg(recipe.id))} aria-hidden>
          {recipe.emoji}
        </div>
        <h1 className="mt-4 text-[1.75rem] font-black leading-tight tracking-tight">{recipe.title}</h1>
        <p className="mt-1.5 font-semibold text-muted">{recipe.summary}</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            ["👶", `${recipe.minAgeMonths}+ ay`],
            ["🔪", `${recipe.prepMinutes} dk`],
            ["🔥", recipe.cookMinutes ? `${recipe.cookMinutes} dk` : "Pişirmesiz"],
            ["🍽️", recipe.yield],
          ].map(([icon, text]) => (
            <div key={icon} className="rounded-2xl border border-line bg-card px-1.5 py-2.5">
              <div aria-hidden>{icon}</div>
              <div className="mt-0.5 text-xs font-extrabold leading-tight">{text}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-4 space-y-2.5">
        <NutrientChips nutrients={recipe.nutrients} />
        <AllergenBadges allergens={recipe.allergens} introduced={introduced} allergies={baby.profile.allergies} />
        <div className="flex flex-wrap gap-1.5">
          {recipe.meals.map((m) => (
            <Badge key={m}>{MEAL_LABELS[m]}</Badge>
          ))}
          {recipe.textures.map((t) => (
            <Badge key={t} tone="lilac">{TEXTURE_LABELS[t]}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {blocked.length > 0 && <Callout tone="danger">Bu tarif {genitive(baby.profile.name)} alerjisi olan bir besin içeriyor. Lütfen hazırlamayın.</Callout>}
        {tooYoung && <Callout tone="warn" icon="🔒">Bu tarif {recipe.minAgeMonths}. aydan itibaren uygundur. Şimdilik kaydedip sonra deneyin.</Callout>}
        {!blocked.length && newAllergens.length > 0 && (
          <Callout tone="warn">
            Bu tarif henüz tanıştırılmamış alerjen içeriyor. Önce her alerjeni tek başına, az miktarda deneyin; yeni alerjenler arasında 2–3 gün bırakın.
          </Callout>
        )}
      </div>

      {adaptation && !tooYoung && (
        <Card className="mt-4 border-2 !border-primary/50 bg-primary-soft">
          <p className="text-xs font-black uppercase tracking-wide text-primary-ink">👶 {genitive(baby.profile.name)} yaşına göre ({baby.ageLabel})</p>
          <p className="mt-1 font-bold leading-snug">{adaptation.text}</p>
        </Card>
      )}

      <SectionTitle emoji="🧺" action={<Badge>{checked.length}/{recipe.ingredients.length}</Badge>}>Malzemeler</SectionTitle>
      <Card className="divide-y divide-line">
        {recipe.ingredients.map((ing, i) => {
          const on = checked.includes(i);
          return (
            <label key={i} className="flex cursor-pointer items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={on}
                onChange={() => setChecked(on ? checked.filter((x) => x !== i) : [...checked, i])}
                className="h-5 w-5 shrink-0 accent-[var(--sage)]"
              />
              <span className={cx("font-semibold", on && "text-muted line-through")}>
                <b className="font-black">{ing.amount}</b> {ing.name}
              </span>
            </label>
          );
        })}
      </Card>

      <SectionTitle emoji="👩‍🍳" action={<Button size="sm" variant="soft" onClick={() => setCooking(true)}>▶ Pişirme modu</Button>}>
        Hazırlanışı
      </SectionTitle>
      <ol className="space-y-2.5">
        {recipe.steps.map((step, i) => {
          const on = doneSteps.includes(i);
          return (
            <li key={i}>
              <button
                onClick={() => setDoneSteps(on ? doneSteps.filter((x) => x !== i) : [...doneSteps, i])}
                className={cx("flex w-full gap-3 rounded-3xl border border-line/70 bg-card p-3.5 text-left shadow-soft transition", on && "opacity-55")}
              >
                <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full font-black", on ? "bg-sage text-white" : "bg-primary-soft text-primary-ink")}>
                  {on ? "✓" : i + 1}
                </span>
                <span className="font-semibold leading-relaxed">{step}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <SectionTitle emoji="📈">Büyüdükçe</SectionTitle>
      <div className="space-y-2">
        {recipe.ageAdaptations.map((a) => {
          const current = a === adaptation;
          return (
            <div key={a.fromMonths} className={cx("flex gap-3 rounded-2xl border-2 p-3", current ? "border-primary bg-primary-soft" : "border-line bg-card")}>
              <Badge tone={current ? "primary" : "neutral"} className="h-fit shrink-0">{a.fromMonths}+ ay</Badge>
              <p className="text-sm font-semibold leading-snug">{a.text}</p>
            </div>
          );
        })}
      </div>

      <SectionTitle emoji="❄️">Saklama</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-black uppercase text-muted">Buzdolabı</p>
          <p className="mt-1 font-bold">{recipe.storage.fridge}</p>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase text-muted">Dondurucu</p>
          <p className="mt-1 font-bold">{recipe.storage.freezer ?? "Önerilmez"}</p>
        </Card>
      </div>

      <Card className="mt-5 bg-gradient-to-br from-sage-soft to-card">
        <p className="font-black text-sage-ink">🩺 Diyetisyen notu</p>
        <p className="mt-1.5 font-semibold leading-relaxed">{recipe.expertNote}</p>
      </Card>

      {cooking && <CookMode recipe={recipe} onClose={() => setCooking(false)} />}
    </article>
  );
}

function CookMode({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const last = recipe.steps.length - 1;

  // Pişirirken ekran kapanmasın
  useEffect(() => {
    let lock: { release: () => Promise<void> } | undefined;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => undefined);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((s) => Math.min(last, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      lock?.release().catch(() => undefined);
      document.removeEventListener("keydown", onKey);
    };
  }, [last, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]" role="dialog" aria-modal="true" aria-label="Pişirme modu">
      <div className="flex items-center justify-between">
        <p className="font-black">
          {recipe.emoji} {recipe.title}
        </p>
        <button onClick={onClose} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold" aria-label="Pişirme modunu kapat">
          ✕ Kapat
        </button>
      </div>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {recipe.steps.map((_, i) => (
          <span key={i} className={cx("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-line")} />
        ))}
      </div>
      <div className="flex flex-1 flex-col justify-center" aria-live="polite">
        <p className="text-sm font-black uppercase tracking-widest text-primary-ink">Adım {step + 1} / {recipe.steps.length}</p>
        <p key={step} className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl animate-pop">{recipe.steps[step]}</p>
        {step === last && <p className="mt-6 text-lg font-bold text-sage-ink">Afiyet olsun! 🥄 Yemeği ılıtıp sıcaklığını bileğinizin içinde test edin.</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Önceki
        </Button>
        {step < last ? (
          <Button size="lg" onClick={() => setStep(step + 1)}>Sonraki →</Button>
        ) : (
          <Button size="lg" variant="sage" onClick={onClose}>Bitti ✓</Button>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-muted">Ekran bu modda açık kalır.</p>
    </div>
  );
}
