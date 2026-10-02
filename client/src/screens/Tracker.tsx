import { useRef, useState } from "react";
import { ALLERGENS } from "../../../shared/data/reference.ts";
import { daysBetween } from "../../../shared/logic/age.ts";
import type { Food } from "../../../shared/types.ts";
import { REACTIONS } from "../components/FoodSheet.tsx";
import { Badge, Button, Callout, Card, PageHeader, SectionTitle, cx } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { relativeDay, useBaby } from "../lib/baby.ts";
import { navigate } from "../lib/router.ts";
import { STANDALONE } from "../lib/env.ts";
import { actions, getState, today, useStore, type AppState } from "../lib/store.ts";
import { copyText, toast } from "../lib/toast.ts";

export function Tracker() {
  const baby = useBaby()!;
  const allergens = useStore((s) => s.allergens);
  const tried = useStore((s) => s.tried);
  const favorites = useStore((s) => s.favorites);
  const { data } = useApi<{ items: Food[] }>("/api/foods");
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppState | null>(null);

  const introducedCount = ALLERGENS.filter((a) => allergens[a.id]?.introducedAt).length;
  const history = Object.entries(tried)
    .sort((a, b) => b[1].lastDate.localeCompare(a[1].lastDate))
    .slice(0, 25);
  const foodById = Object.fromEntries((data?.items ?? []).map((f) => [f.id, f]));
  const reactions = Object.entries(tried).filter(([, e]) => e.reaction === "reaksiyon");

  const exportData = async () => {
    const json = JSON.stringify(getState(), null, 2);
    if (STANDALONE) {
      // Artifact çerçevesi dosya indirmeyi engeller → panoya kopyala
      toast((await copyText(json)) ? "Yedek panoya kopyalandı — bir nota yapıştırıp saklayın ✓" : "Kopyalanamadı");
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = `minik-tabak-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const readBackup = (text: string) => {
    try {
      const parsed = JSON.parse(text) as AppState;
      if (typeof parsed !== "object" || !parsed || !("tried" in parsed)) throw new Error();
      setPending(parsed);
    } catch {
      toast("Bu, geçerli bir Minik Tabak yedeği değil.");
    }
  };

  return (
    <div>
      <PageHeader emoji="📒" title="Günlük" subtitle="Alerjenler, tadım geçmişi ve doktor özeti." />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["🛂", Object.keys(tried).length, "besin denendi"],
          ["🥜", `${introducedCount}/9`, "alerjen"],
          ["❤️", favorites.length, "favori tarif"],
        ].map(([icon, value, label]) => (
          <Card key={String(label)} className="!p-3 text-center">
            <div className="text-2xl" aria-hidden>{icon}</div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs font-bold text-muted">{label}</div>
          </Card>
        ))}
      </div>

      {reactions.length > 0 && (
        <Callout tone="danger" className="mt-4">
          Reaksiyon kaydedilen besinler: {reactions.map(([id]) => foodById[id]?.name ?? id).join(", ")}. Bu bilgileri çocuk doktorunuzla paylaşın.
        </Callout>
      )}

      <SectionTitle emoji="🥜">Alerjen yolculuğu</SectionTitle>
      <Card className="!p-2">
        {ALLERGENS.map((a, i) => {
          const entry = allergens[a.id];
          const allergic = baby.profile.allergies.includes(a.id);
          const stale = entry?.lastGivenAt && daysBetween(entry.lastGivenAt, today()) > 7;
          return (
            <div key={a.id} className={cx("flex items-center gap-3 rounded-2xl p-2.5", i % 2 === 1 && "bg-bg/60")}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card border border-line text-2xl" aria-hidden>
                {a.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold leading-tight">{a.name}</p>
                <p className="text-xs font-semibold text-muted">
                  {allergic
                    ? "Alerji kaydedildi — önerilerde yer almaz"
                    : entry?.introducedAt
                      ? `Tanıştı: ${relativeDay(entry.introducedAt)} · ${entry.timesGiven} kez · son ${relativeDay(entry.lastGivenAt!)}`
                      : `${a.order}. sırada · henüz tanışmadı`}
                </p>
                {stale && !allergic && <p className="text-xs font-bold text-sun-ink">⏰ 1 haftadan uzun süredir verilmedi</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {allergic ? (
                  <Badge tone="danger">🚫 Alerji</Badge>
                ) : (
                  <Button size="sm" variant={entry ? "sage" : "soft"} onClick={() => actions.introduceAllergen(a.id)}>
                    {entry ? "+ Verdim" : "Tanıştı"}
                  </Button>
                )}
                <details className="text-right">
                  <summary className="cursor-pointer list-none text-[11px] font-bold text-muted">Diğer ▾</summary>
                  <div className="mt-1 flex flex-col items-end gap-1">
                    <button onClick={() => actions.toggleAllergy(a.id)} className="text-xs font-bold text-danger-ink underline">
                      {allergic ? "Alerji kaydını kaldır" : "Reaksiyon/alerji kaydet"}
                    </button>
                    {entry && (
                      <button onClick={() => actions.resetAllergen(a.id)} className="text-xs font-bold text-muted underline">
                        Sıfırla
                      </button>
                    )}
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </Card>
      <p className="mt-2 px-1 text-xs font-semibold text-muted">Alerji kaydı yalnızca doktor değerlendirmesinden sonra kesinleşir. Şüpheli bir reaksiyonda besini kesip doktorunuza danışın.</p>

      <SectionTitle emoji="🕘" action={<Button size="sm" variant="ghost" onClick={() => navigate("/besinler")}>Pasaport →</Button>}>
        Son tadımlar
      </SectionTitle>
      {history.length === 0 ? (
        <Card className="text-center">
          <p className="font-bold">Henüz kayıt yok.</p>
          <p className="text-sm text-muted font-semibold">Besinler sekmesinden denediği besinleri işaretleyin.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-line !py-1">
          {history.map(([id, e]) => {
            const f = foodById[id];
            const r = REACTIONS.find((x) => x.id === e.reaction)!;
            return (
              <div key={id} className="flex items-center gap-3 py-2.5">
                <span className="text-2xl" aria-hidden>{f?.emoji ?? "🍽️"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{f?.name ?? id}</p>
                  <p className="text-xs font-semibold text-muted">
                    {e.count} kez · son {relativeDay(e.lastDate)}
                  </p>
                </div>
                <Badge tone={e.reaction === "reaksiyon" ? "danger" : e.reaction === "sevdi" ? "sage" : "neutral"}>
                  {r.emoji} {r.label}
                </Badge>
              </div>
            );
          })}
        </Card>
      )}

      <SectionTitle emoji="🩺">Doktor & yedek</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card as="button" onClick={() => navigate("/rapor")}>
          <p className="font-extrabold">📄 Doktor özeti</p>
          <p className="text-sm font-semibold text-muted">{STANDALONE ? "Alerjen ve tadım özetini kopyalayıp doktorunuzla paylaşın." : "Kontrole giderken yazdırın veya PDF kaydedin."}</p>
        </Card>
        <Card>
          <p className="font-extrabold">💾 Verileriniz bu cihazda</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={exportData}>{STANDALONE ? "Yedeği kopyala" : "Yedek indir"}</Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>Dosyadan yükle</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json,.txt"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) readBackup(await file.text());
                e.target.value = "";
              }}
            />
          </div>
          {pending && (
            <div className="mt-3 rounded-2xl bg-sun-soft p-3 text-sun-ink" role="alertdialog" aria-label="Yedeği yükle">
              <p className="font-bold">Mevcut kayıtlar yedekteki kayıtlarla değiştirilecek.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPending(null)}>Vazgeç</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    actions.importData(pending);
                    setPending(null);
                    toast("Yedek yüklendi ✓");
                  }}
                >
                  Yükle
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
