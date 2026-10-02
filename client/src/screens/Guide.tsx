import { useState } from "react";
import { SOURCES, STAGES } from "../../../shared/data/reference.ts";
import type { Article, ArticleCategory, Food, Myth, Source } from "../../../shared/types.ts";
import { Badge, Callout, Card, ErrorState, PageHeader, SectionTitle, Skeleton, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { useBaby } from "../lib/baby.ts";
import { back, navigate } from "../lib/router.ts";

type ArticleMeta = Omit<Article, "sections">;
type Tab = "makaleler" | "mitler" | "takvim" | "kaynaklar";

const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  baslangic: "🚀 Başlangıç",
  guvenlik: "🛡️ Güvenlik",
  beslenme: "🥗 Beslenme",
  taktik: "🧠 Taktikler",
  sorun: "🩹 Sorunlar & çözümler",
};

export function Guide({ tab: initial }: { tab?: string }) {
  const [tab, setTab] = useState<Tab>((["makaleler", "mitler", "takvim", "kaynaklar"].includes(initial ?? "") ? initial : "makaleler") as Tab);
  return (
    <div>
      <PageHeader emoji="📚" title="Rehber" subtitle="Kanıta dayalı bilgiler, mitler ve taktikler." />
      <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl border border-line bg-card p-1" role="tablist">
        {(
          [
            ["makaleler", "Makaleler"],
            ["mitler", "Mitler"],
            ["takvim", "Ne zaman?"],
            ["kaynaklar", "Kaynaklar"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cx("rounded-xl py-2 text-[13px] font-extrabold transition", tab === id ? "bg-primary-soft text-primary-ink" : "text-muted")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "makaleler" && <Articles />}
        {tab === "mitler" && <Myths />}
        {tab === "takvim" && <Timeline />}
        {tab === "kaynaklar" && <Sources />}
      </div>
    </div>
  );
}

function Articles() {
  const { data, error, reload } = useApi<{ items: ArticleMeta[] }>("/api/articles");
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Skeleton className="h-64" />;
  const groups = (Object.keys(CATEGORY_LABEL) as ArticleCategory[]).map((c) => [c, data.items.filter((a) => a.category === c)] as const);
  return (
    <div>
      {groups.map(([cat, items]) =>
        items.length ? (
          <section key={cat}>
            <SectionTitle>{CATEGORY_LABEL[cat]}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((a) => (
                <Card key={a.id} as="button" onClick={() => navigate(`/rehber/${a.id}`)} className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg text-2xl" aria-hidden>
                    {a.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-extrabold leading-snug">{a.title}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-muted">{a.summary}</span>
                    <span className="mt-1.5 block text-xs font-bold text-muted">⏱ {a.minutes} dk okuma</span>
                  </span>
                </Card>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}

function Myths() {
  const { data } = useApi<{ items: Myth[] }>("/api/myths");
  const [open, setOpen] = useState<string[]>([]);
  if (!data) return <Skeleton className="h-64" />;
  return (
    <div className="space-y-3">
      <p className="px-1 font-semibold text-muted">Kulaktan kulağa yayılan bilgiler… Doğrusunu görmek için kartlara dokunun.</p>
      {data.items.map((m) => {
        const revealed = open.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => setOpen(revealed ? open.filter((x) => x !== m.id) : [...open, m.id])}
            aria-expanded={revealed}
            className={cx("w-full rounded-3xl border-2 p-4 text-left transition", revealed ? "border-sage bg-sage-soft" : "border-line bg-card shadow-soft")}
          >
            <p className="flex items-start gap-2 font-extrabold leading-snug">
              <span aria-hidden>{revealed ? "✅" : "❓"}</span>
              <span className={cx(revealed && "text-muted line-through decoration-2")}>{m.myth}</span>
            </p>
            {revealed ? (
              <div className="mt-2 animate-pop">
                <p className="font-semibold leading-relaxed">{m.truth}</p>
                {m.source && <p className="mt-1.5 text-xs font-bold text-muted">Kaynak: {SOURCES[m.source].publisher}</p>}
              </div>
            ) : (
              <p className="mt-1 text-xs font-bold text-muted">Doğrusu ne? Dokun →</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Timeline() {
  const baby = useBaby()!;
  const { data } = useApi<{ items: Food[] }>("/api/foods");
  if (!data) return <Skeleton className="h-64" />;
  const months = [...new Set(data.items.map((f) => f.minAgeMonths))].sort((a, b) => a - b);
  const milestones: Record<number, string> = {
    6: "Ek gıdaya başlangıç: sebzeler, meyveler, et, yumurta, yoğurt, alerjenler",
    7: "Pütürlü dokular, gluten (az miktar), bakliyat",
    8: "Daha zengin karışımlar",
    9: "Kıskaç kavrama: küçük lokmalar, dörde bölünmüş üzüm",
    12: "İnek sütü içecek olarak, bal, aile sofrası",
  };
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STAGES.map((s) => (
          <div key={s.id} className={cx("rounded-2xl border-2 p-3", baby.stage.id === s.id ? "border-primary bg-primary-soft" : "border-line bg-card")}>
            <p className="text-lg" aria-hidden>{s.emoji}</p>
            <p className="font-extrabold leading-tight">{s.title}</p>
            <p className="text-xs font-bold text-muted">{s.fromMonths}–{s.toMonths} ay</p>
          </div>
        ))}
      </div>
      <ol className="relative space-y-4 border-l-2 border-line pl-5">
        {months.map((m) => {
          const reached = baby.ageMonths >= m;
          return (
            <li key={m} className="relative">
              <span className={cx("absolute -left-[1.95rem] grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-black", reached ? "border-sage bg-sage text-white" : "border-line bg-card text-muted")}>
                {reached ? "✓" : m}
              </span>
              <p className="font-black">{m}. ay {reached && <Badge tone="sage">ulaşıldı</Badge>}</p>
              {milestones[m] && <p className="text-sm font-semibold text-muted">{milestones[m]}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.items
                  .filter((f) => f.minAgeMonths === m)
                  .map((f) => (
                    <span key={f.id} className="rounded-full border border-line bg-card px-2.5 py-1 text-sm font-bold">
                      {f.emoji} {f.name}
                    </span>
                  ))}
              </div>
            </li>
          );
        })}
        <li className="relative">
          <span className="absolute -left-[1.95rem] grid h-7 w-7 place-items-center rounded-full border-2 border-line bg-card text-xs font-black text-muted">12</span>
          <p className="font-black">12. ay ve sonrası</p>
          <p className="text-sm font-semibold text-muted">{milestones[12]}. Bütün yemiş, patlamış mısır ve sert şekerler 5 yaşına kadar yok.</p>
        </li>
      </ol>
    </div>
  );
}

function Sources() {
  const { data } = useApi<{ sources: Source[] }>("/api/meta");
  const sources = data?.sources ?? Object.values(SOURCES);
  return (
    <div className="space-y-3">
      <Callout tone="info">
        Minik Tabak'taki öneriler aşağıdaki uluslararası ve ulusal rehberlere dayanır. Uygulama tıbbi tavsiye yerine geçmez; bebeğinize özel durumlar için çocuk doktorunuza danışın.
      </Callout>
      {sources.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="block rounded-3xl border border-line bg-card p-4 shadow-soft transition hover:border-primary/40">
          <p className="text-xs font-black uppercase tracking-wide text-primary-ink">{s.publisher}</p>
          <p className="mt-1 font-bold leading-snug">{s.title}</p>
          <p className="mt-1 truncate text-xs font-semibold text-muted">{s.url} ↗</p>
        </a>
      ))}
    </div>
  );
}

export function ArticleDetail({ id }: { id: string }) {
  const { data: a, error, reload } = useApi<Omit<Article, "sources"> & { sources: Source[] }>(`/api/articles/${encodeURIComponent(id)}`);
  if (error && !a) return <ErrorState message={error} onRetry={reload} />;
  if (!a) return <Skeleton className="h-96" />;
  return (
    <article className="pb-6">
      <PageHeader onBack={() => back("/rehber")} emoji={a.emoji} title={a.title} subtitle={`${a.summary} · ⏱ ${a.minutes} dk`} />
      <div className="mt-4 space-y-5">
        {a.sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h2 className="mb-2 text-lg font-black">{s.heading}</h2>}
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="mb-2 font-semibold leading-relaxed text-ink/90">{p}</p>
            ))}
            {s.bullets && (
              <ul className="space-y-1.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2.5 rounded-2xl bg-card border border-line/70 px-3.5 py-2.5 font-semibold leading-snug">
                    <span className="text-primary" aria-hidden>●</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.steps && (
              <ol className="space-y-2">
                {s.steps.map((b, j) => (
                  <li key={j} className="flex gap-3 rounded-2xl bg-card border border-line/70 p-3 font-semibold leading-snug">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-black text-primary-ink">{j + 1}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ol>
            )}
            {s.callout && (
              <Callout tone={s.callout.tone} className="mt-2">
                {s.callout.text}
              </Callout>
            )}
          </section>
        ))}
      </div>
      <SectionTitle emoji="🔗">Kaynaklar</SectionTitle>
      <div className="space-y-2">
        {a.sources.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold hover:border-primary/40">
            {s.publisher} — <span className="font-semibold text-muted">{s.title}</span> ↗
          </a>
        ))}
      </div>
    </article>
  );
}
