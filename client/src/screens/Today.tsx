import { useState } from "react";
import { MEAL_LABELS, STAGES, SOURCES } from "../../../shared/data/reference.ts";
import { daysBetween, stageProgress } from "../../../shared/logic/age.ts";
import { genitive } from "../../../shared/logic/text.ts";
import type { AllergenId, DailyPlan, Food } from "../../../shared/types.ts";
import { FoodSheet, servingKey } from "../components/FoodSheet.tsx";
import { emojiBg } from "../components/RecipeCard.tsx";
import { Badge, Button, Callout, Card, ErrorState, ProgressBar, SectionTitle, Skeleton, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { formatDate, relativeDay, useBaby, type Baby } from "../lib/baby.ts";
import { usePlanUrl } from "../lib/plan.ts";
import { navigate } from "../lib/router.ts";
import { actions, today, useStore } from "../lib/store.ts";

const CATEGORY_STYLE: Record<string, { label: string; cls: string }> = {
  guvenlik: { label: "Güvenlik", cls: "bg-danger-soft text-danger-ink" },
  beslenme: { label: "Beslenme", cls: "bg-sage-soft text-sage-ink" },
  taktik: { label: "Taktik", cls: "bg-sky-soft text-sky-ink" },
  gelisim: { label: "Gelişim", cls: "bg-lilac-soft text-lilac-ink" },
  mit: { label: "Mit avcısı", cls: "bg-sun-soft text-sun-ink" },
};

const SLOT_TIME: Record<string, string> = { kahvalti: "08:00", ogle: "12:30", ara: "16:00", aksam: "18:30" };

export function Today() {
  const baby = useBaby()!;
  const url = usePlanUrl(baby, "daily");
  const { data: plan, error, loading, reload } = useApi<DailyPlan>(url);
  const [food, setFood] = useState<Food | null>(null);

  return (
    <div className="space-y-4">
      <Hero baby={baby} />

      {error && !plan && <ErrorState message={error} onRetry={reload} />}
      {loading && !plan && (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {plan && (
        <>
          <StageFacts plan={plan} />
          {plan.started ? (
            <>
              <AllergenOfDay plan={plan} baby={baby} />
              <Menu plan={plan} />
              <Maintenance plan={plan} />
              {plan.foodOfDay && <FoodOfDay food={plan.foodOfDay} ageMonths={plan.ageMonths} onOpen={() => setFood(plan.foodOfDay!)} />}
            </>
          ) : (
            <BeforeStart baby={baby} />
          )}
          <TipCard plan={plan} />
          <Checklist plan={plan} />
        </>
      )}

      <FoodSheet food={food} ageMonths={baby.ageMonths} onClose={() => setFood(null)} />
    </div>
  );
}

function Hero({ baby }: { baby: Baby }) {
  const progress = stageProgress(baby.ageMonths);
  const nextStage = STAGES.find((s) => s.fromMonths === baby.stage.toMonths);
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Günaydın ☀️" : hour < 17 ? "İyi günler 🌤️" : "İyi akşamlar 🌙";
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-soft via-sun-soft to-sage-soft p-5 shadow-soft animate-pop">
      <div className="absolute -right-6 -top-6 text-[7rem] opacity-25 select-none" aria-hidden>
        {baby.stage.emoji}
      </div>
      <p className="font-extrabold text-primary-ink">{greet} · {formatDate(today())}</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">{baby.ageLabel}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone="primary" className="!bg-card">
          {baby.stage.emoji} {baby.stage.title}
        </Badge>
        {baby.age.corrected && <Badge tone="sky" className="!bg-card">Düzeltilmiş yaş</Badge>}
      </div>
      <p className="mt-3 font-semibold leading-snug">{baby.stage.headline}</p>
      {nextStage && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-extrabold text-muted">
            <span>{baby.stage.title}</span>
            <span>
              {nextStage.emoji} {nextStage.title}
            </span>
          </div>
          <ProgressBar value={progress} label="Sonraki evreye ilerleme" />
        </div>
      )}
    </section>
  );
}

function StageFacts({ plan }: { plan: DailyPlan }) {
  const s = plan.stage;
  const facts = [
    { icon: "🍽️", label: "Öğün", value: s.mealsPerDay },
    { icon: "🥄", label: "Porsiyon", value: s.portion },
    { icon: "🧩", label: "Doku", value: s.textures },
    { icon: "💧", label: "Su", value: s.water },
  ];
  return (
    <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
      {facts.map((f) => (
        <div key={f.label} className="w-56 shrink-0 snap-start rounded-3xl border border-line/70 bg-card p-3.5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            <span aria-hidden>{f.icon}</span> {f.label}
          </p>
          <p className="mt-1 text-sm font-bold leading-snug">{f.value}</p>
        </div>
      ))}
    </div>
  );
}

function AllergenOfDay({ plan, baby }: { plan: DailyPlan; baby: Baby }) {
  const s = plan.allergenSuggestion;
  if (!s) {
    return plan.allergenNote ? (
      <Callout tone="info" icon="🥜">
        {plan.allergenNote}
      </Callout>
    ) : null;
  }
  const risky = baby.profile.eczema === "siddetli" && (s.allergen.id === "yerfistigi" || s.allergen.id === "yumurta");
  return (
    <Card className="border-2 !border-sun bg-gradient-to-br from-sun-soft to-card animate-pop">
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card text-3xl shadow-soft" aria-hidden>
          {s.allergen.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-sun-ink">Bugünün yeni alerjeni</p>
          <h2 className="text-xl font-black">{s.allergen.name}</h2>
          <p className="mt-1 text-sm font-semibold leading-snug">{s.allergen.firstServe}</p>
        </div>
      </div>
      {risky && (
        <Callout tone="danger" className="mt-3">
          Şiddetli egzaması olan bebeklerde {s.allergen.name.toLocaleLowerCase("tr")} tanıştırmadan önce çocuk doktorunuza danışın.
        </Callout>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {s.recipe && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/tarif/${s.recipe!.id}`)}>
            {s.recipe.emoji} Tarife git
          </Button>
        )}
        <Button size="sm" onClick={() => actions.introduceAllergen(s.allergen.id)}>
          ✓ Bugün tanıştırdık
        </Button>
      </div>
      <p className="mt-2.5 text-xs font-semibold text-muted">{s.message}</p>
    </Card>
  );
}

function Menu({ plan }: { plan: DailyPlan }) {
  return (
    <section>
      <SectionTitle
        emoji="🍽️"
        action={
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => actions.reshuffle(plan.date)} ariaLabel="Menüyü değiştir">
              🔀
            </Button>
            <Button variant="soft" size="sm" onClick={() => navigate("/hafta")}>
              7 gün →
            </Button>
          </div>
        }
      >
        Menü
      </SectionTitle>
      <div className="relative space-y-3 before:absolute before:left-[1.65rem] before:top-6 before:bottom-6 before:w-0.5 before:bg-line">
        {plan.meals.map((m, i) => (
          <button
            key={`${m.slot}-${i}`}
            onClick={() => navigate(`/tarif/${m.recipe.id}`)}
            className="relative flex w-full items-center gap-3.5 rounded-3xl border border-line/70 bg-card p-3 text-left shadow-soft transition hover:border-primary/40 active:scale-[0.99] animate-pop"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={cx("grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl", emojiBg(m.recipe.id))} aria-hidden>
              {m.recipe.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-muted">
                {MEAL_LABELS[m.slot]} · {SLOT_TIME[m.slot]}
              </p>
              <p className="font-extrabold leading-snug">{m.recipe.title}</p>
              <p className="mt-0.5 text-xs font-bold text-primary-ink">{m.reason}</p>
            </div>
            <span className="text-muted" aria-hidden>›</span>
          </button>
        ))}
      </div>
      <p className="mt-2 px-1 text-xs font-semibold text-muted">Saatler örnektir; bebeğinizin uyku ve süt düzenine göre ayarlayın. Ek gıdayı emzirme/mamadan ~1 saat sonra deneyin.</p>
    </section>
  );
}

function Maintenance({ plan }: { plan: DailyPlan }) {
  const allergens = useStore((s) => s.allergens);
  const due = plan.allergenMaintenance
    .map((a) => ({ a, last: allergens[a.id as AllergenId]?.lastGivenAt }))
    .filter(({ last }) => !last || daysBetween(last, plan.date) >= 4);
  if (!due.length) return null;
  return (
    <Card>
      <p className="font-extrabold">🔁 Alerjenleri menüde tutun</p>
      <p className="text-sm font-semibold text-muted">Tanıştırılan alerjenleri haftada 2–3 kez vermek toleransı korur.</p>
      <div className="mt-3 space-y-2">
        {due.map(({ a, last }) => (
          <div key={a.id} className="flex items-center justify-between gap-2 rounded-2xl bg-bg px-3 py-2">
            <span className="min-w-0 font-bold">
              {a.emoji} {a.name}
              <span className="block text-xs font-semibold text-muted">Son: {last ? relativeDay(last, plan.date) : "—"}</span>
            </span>
            <Button size="sm" variant="sage" onClick={() => actions.introduceAllergen(a.id)}>
              Bugün verdim
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FoodOfDay({ food, ageMonths, onOpen }: { food: Food; ageMonths: number; onOpen: () => void }) {
  return (
    <section>
      <SectionTitle emoji="🌟">Günün yeni besini</SectionTitle>
      <Card as="button" onClick={onOpen} className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sage-soft text-4xl" aria-hidden>
          {food.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">{food.name}</p>
          <p className="text-sm font-semibold text-muted line-clamp-2">{food.serving[servingKey(ageMonths)]}</p>
        </div>
        <Badge tone="sage">Dene →</Badge>
      </Card>
    </section>
  );
}

function BeforeStart({ baby }: { baby: Baby }) {
  const left = Math.max(0, Math.round((6 - baby.ageMonths) * 30.4375));
  return (
    <>
      <Card className="text-center">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Ek gıdaya yaklaşık</p>
        <p className="text-5xl font-black text-primary-ink">{left}</p>
        <p className="font-extrabold">gün kaldı</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          {genitive(baby.profile.name)} hazırlık işaretlerini göstermesi takvimden daha önemlidir. 4. aydan önce başlanmaz.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card as="button" onClick={() => navigate("/rehber/hazir-mi")}>
          <span className="text-3xl" aria-hidden>🚦</span>
          <p className="mt-1 font-extrabold leading-snug">Hazır mı? İşaretler</p>
        </Card>
        <Card as="button" onClick={() => navigate("/rehber/ilk-hafta")}>
          <span className="text-3xl" aria-hidden>🗓️</span>
          <p className="mt-1 font-extrabold leading-snug">İlk 2 hafta planı</p>
        </Card>
        <Card as="button" onClick={() => navigate("/rehber/bogulma-ilk-yardim")}>
          <span className="text-3xl" aria-hidden>🆘</span>
          <p className="mt-1 font-extrabold leading-snug">Öğürme vs boğulma</p>
        </Card>
        <Card as="button" onClick={() => navigate("/tarifler")}>
          <span className="text-3xl" aria-hidden>🥒</span>
          <p className="mt-1 font-extrabold leading-snug">İlk tarifler</p>
        </Card>
      </div>
    </>
  );
}

function TipCard({ plan }: { plan: DailyPlan }) {
  const style = CATEGORY_STYLE[plan.tip.category];
  const source = plan.tip.source ? SOURCES[plan.tip.source] : undefined;
  return (
    <section>
      <SectionTitle emoji="💡">Günün ipucu</SectionTitle>
      <Card>
        <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-xs font-black", style.cls)}>{style.label}</span>
        <h3 className="mt-2 text-lg font-black leading-snug">{plan.tip.title}</h3>
        <p className="mt-1 font-semibold leading-relaxed text-ink/90">{plan.tip.body}</p>
        {source && (
          <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-muted underline">
            Kaynak: {source.publisher}
          </a>
        )}
      </Card>
    </section>
  );
}

function Checklist({ plan }: { plan: DailyPlan }) {
  const done = useStore((s) => s.checklist[plan.date]) ?? [];
  const count = plan.checklist.filter((c) => done.includes(c.id)).length;
  const all = count === plan.checklist.length;
  return (
    <section>
      <SectionTitle emoji="✅" action={<Badge tone={all ? "sage" : "neutral"}>{count}/{plan.checklist.length}</Badge>}>
        Günlük kontrol listesi
      </SectionTitle>
      <Card className="space-y-1">
        {plan.checklist.map((c) => {
          const on = done.includes(c.id);
          return (
            <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 hover:bg-bg">
              <input type="checkbox" checked={on} onChange={() => actions.toggleCheck(plan.date, c.id)} className="peer sr-only" />
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-xl border-2 text-sm font-black transition peer-focus-visible:ring-2 peer-focus-visible:ring-primary", on ? "border-sage bg-sage text-white" : "border-line")}>
                {on && "✓"}
              </span>
              <span className={cx("font-bold transition", on && "text-muted line-through")}>{c.text}</span>
            </label>
          );
        })}
        {all && <p className="pt-2 text-center font-extrabold text-sage-ink animate-pop">Harika bir gün! 🎉 Kendinize de bir aferin.</p>}
      </Card>
    </section>
  );
}
