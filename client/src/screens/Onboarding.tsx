import { useState } from "react";
import { ALLERGENS, METHOD_LABELS } from "../../../shared/data/reference.ts";
import { computeAge, formatAge, isIsoDate, toIsoDate } from "../../../shared/logic/age.ts";
import type { AllergenId, FeedingMethod } from "../../../shared/types.ts";
import { Button, Callout, Card, cx } from "../components/ui.tsx";
import { actions, today, type Eczema, type Profile } from "../lib/store.ts";

const METHOD_INFO: Record<FeedingMethod, { emoji: string; text: string }> = {
  kasik: { emoji: "🥄", text: "Püreler ve kaşıkla besleme; zamanla pütürlü dokulara geçiş." },
  blw: { emoji: "✋", text: "Bebek yumuşak parmak besinleri kendisi alır ve yer." },
  karma: { emoji: "🤝", text: "İkisinin en iyisi: demirli püreler + parmak besinler. Çoğu ailenin tercihi." },
};

export function ProfileForm({ initial, onSave, submitLabel }: { initial?: Profile; onSave: (p: Profile) => void; submitLabel: string }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [premature, setPremature] = useState(Boolean(initial?.gestationWeeks));
  const [weeks, setWeeks] = useState(initial?.gestationWeeks ?? 34);
  const [method, setMethod] = useState<FeedingMethod>(initial?.method ?? "karma");
  const [eczema, setEczema] = useState<Eczema>(initial?.eczema ?? "yok");
  const [allergies, setAllergies] = useState<AllergenId[]>(initial?.allergies ?? []);
  const [touched, setTouched] = useState(false);

  const validDate = isIsoDate(birthDate) && birthDate <= today();
  const valid = name.trim().length > 0 && validDate;
  const preview = validDate ? computeAge(birthDate, today(), premature ? weeks : undefined) : undefined;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSave({ name: name.trim(), birthDate, gestationWeeks: premature ? weeks : undefined, method, eczema, allergies });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Card>
        <label className="block font-extrabold" htmlFor="name">Bebeğinizin adı</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ör. Ela"
          maxLength={30}
          autoComplete="off"
          className="mt-2 w-full rounded-2xl border-2 border-line bg-bg px-4 py-3 text-lg font-bold outline-none focus:border-primary"
        />
        {touched && !name.trim() && <p className="mt-1.5 text-sm font-bold text-danger-ink">Lütfen bir isim girin.</p>}

        <label className="mt-5 block font-extrabold" htmlFor="birth">Doğum tarihi</label>
        <input
          id="birth"
          type="date"
          value={birthDate}
          max={today()}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-2 w-full rounded-2xl border-2 border-line bg-bg px-4 py-3 text-lg font-bold outline-none focus:border-primary"
        />
        {touched && !validDate && <p className="mt-1.5 text-sm font-bold text-danger-ink">Geçerli bir doğum tarihi seçin.</p>}

        <label className="mt-5 flex items-center gap-3 font-bold">
          <input type="checkbox" checked={premature} onChange={(e) => setPremature(e.target.checked)} className="h-5 w-5 accent-[var(--primary)]" />
          37. haftadan önce doğdu (prematüre)
        </label>
        {premature && (
          <div className="mt-3 rounded-2xl bg-sky-soft p-3 text-sky-ink">
            <label className="font-bold" htmlFor="weeks">Doğum haftası: {weeks}. hafta</label>
            <input id="weeks" type="range" min={24} max={36} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" />
            <p className="mt-1 text-sm font-semibold">Öneriler düzeltilmiş yaşa göre yapılır. Başlangıç zamanını mutlaka doktorunuzla planlayın.</p>
          </div>
        )}
        {preview && (
          <p className="mt-4 rounded-2xl bg-primary-soft px-4 py-2.5 font-extrabold text-primary-ink">
            👶 {preview.corrected ? "Düzeltilmiş yaş: " : ""}{formatAge(preview)}
          </p>
        )}
      </Card>

      <Card>
        <p className="font-extrabold">Besleme yöntemi</p>
        <p className="text-sm text-muted font-semibold">Tarif önerileri buna göre şekillenir; istediğiniz zaman değiştirebilirsiniz.</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(METHOD_LABELS) as FeedingMethod[]).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMethod(m)}
              aria-pressed={method === m}
              className={cx("flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left transition", method === m ? "border-primary bg-primary-soft" : "border-line")}
            >
              <span className="text-2xl" aria-hidden>{METHOD_INFO[m].emoji}</span>
              <span>
                <span className="block font-extrabold">{METHOD_LABELS[m]}</span>
                <span className="block text-sm text-muted font-semibold">{METHOD_INFO[m].text}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="font-extrabold">Egzama durumu</p>
        <p className="text-sm text-muted font-semibold">Şiddetli egzama, yer fıstığı ve yumurta alerjisi riskini artırır.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ["yok", "Yok"],
              ["hafif", "Hafif-orta"],
              ["siddetli", "Şiddetli"],
            ] as const
          ).map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setEczema(id)}
              aria-pressed={eczema === id}
              className={cx("rounded-2xl border-2 py-2.5 font-extrabold transition", eczema === id ? "border-primary bg-primary-soft text-primary-ink" : "border-line")}
            >
              {label}
            </button>
          ))}
        </div>
        {eczema === "siddetli" && (
          <Callout tone="warn" className="mt-3">
            Yer fıstığı ve yumurtayı tanıştırmadan önce çocuk doktorunuzla görüşün; alerji testi önerilebilir (NIAID/AAP).
          </Callout>
        )}

        <p className="mt-5 font-extrabold">Doktor tarafından tanı konmuş besin alerjisi</p>
        <p className="text-sm text-muted font-semibold">Seçtikleriniz hiçbir öneride yer almaz.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALLERGENS.map((a) => {
            const on = allergies.includes(a.id);
            return (
              <button
                type="button"
                key={a.id}
                aria-pressed={on}
                onClick={() => setAllergies(on ? allergies.filter((x) => x !== a.id) : [...allergies, a.id])}
                className={cx("rounded-full border-2 px-3 py-1.5 text-sm font-extrabold transition", on ? "border-danger bg-danger-soft text-danger-ink" : "border-line")}
              >
                {a.emoji} {a.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

/** Uygulamayı denemek isteyenler için açıkça "örnek" olarak işaretlenmiş 7,5 aylık bir profil */
function loadSample() {
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 7);
  birth.setDate(birth.getDate() - 15);
  actions.saveProfile({ name: "Örnek Ela", birthDate: toIsoDate(birth), method: "karma", eczema: "yok", allergies: [] });
  for (const id of ["kabak", "brokoli", "tatli-patates", "avokado", "armut"]) actions.markTried(id, "sevdi");
  actions.markTried("havuc", "sevmedi");
  actions.markTried("havuc", "notr");
}

export function Onboarding() {
  const [step, setStep] = useState<"welcome" | "form">("welcome");

  if (step === "welcome") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <div className="animate-pop text-center">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-[2.5rem] bg-primary-soft text-7xl shadow-soft" aria-hidden>
            🥣
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">Minik Tabak</h1>
          <p className="mt-3 text-lg font-semibold text-muted">
            Bebeğinizin yaşına göre şekillenen günlük menüler, 45+ tarif ve adım adım alerjen rehberi.
          </p>
        </div>
        <div className="mt-8 space-y-2.5 animate-pop" style={{ animationDelay: "120ms" }}>
          {[
            ["☀️", "Her gün yaşına uygun menü ve günün ipucu"],
            ["🥜", "Alerjenleri güvenle, sırayla tanıştırma planı"],
            ["🛂", "Tadım pasaportu: denediği her besin bir mühür"],
            ["🛒", "Haftalık plan + otomatik alışveriş listesi"],
            ["🆘", "Tek dokunuşla boğulma ilk yardım rehberi"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl bg-card border border-line px-4 py-3 font-bold">
              <span className="text-xl" aria-hidden>{icon}</span>
              {text}
            </div>
          ))}
        </div>
        <Callout tone="info" className="mt-6 text-sm">
          İçerikler WHO, AAP, ESPGHAN, CDC ve NHS rehberleri temel alınarak hazırlanmıştır; tıbbi tavsiye yerine geçmez. Bebeğinize özel durumlar için çocuk doktorunuza danışın.
        </Callout>
        <Button size="lg" className="mt-6 w-full" onClick={() => setStep("form")}>
          Hadi başlayalım →
        </Button>
        <Button size="lg" variant="outline" className="mt-2.5 w-full" onClick={loadSample}>
          👀 Örnek bebekle göz at
        </Button>
        <p className="mt-3 text-center text-xs font-semibold text-muted">Tüm veriler yalnızca bu cihazda saklanır.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight">Bebeğinizi tanıyalım 👶</h1>
      <p className="mt-1 mb-5 font-semibold text-muted">Önerileri kişiselleştirmek için birkaç bilgi.</p>
      <ProfileForm onSave={actions.saveProfile} submitLabel="Minik Tabağı hazırla 🎉" />
    </div>
  );
}
