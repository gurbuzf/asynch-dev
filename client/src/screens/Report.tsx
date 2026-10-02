import { ALLERGENS, METHOD_LABELS } from "../../../shared/data/reference.ts";
import type { Food } from "../../../shared/types.ts";
import { REACTIONS } from "../components/FoodSheet.tsx";
import { Button, PageHeader } from "../components/ui.tsx";
import { useApi } from "../lib/api.ts";
import { formatDate, useBaby } from "../lib/baby.ts";
import { back } from "../lib/router.ts";
import { today, useStore } from "../lib/store.ts";

export function Report() {
  const baby = useBaby()!;
  const allergens = useStore((s) => s.allergens);
  const tried = useStore((s) => s.tried);
  const { data } = useApi<{ items: Food[] }>("/api/foods");
  const foods = data?.items ?? [];
  const byReaction = (r: string) => foods.filter((f) => tried[f.id]?.reaction === r);

  return (
    <div className="pb-6">
      <PageHeader title="Doktor özeti" emoji="📄" onBack={() => back("/gunluk")} subtitle={`Oluşturma: ${formatDate(today(), { day: "numeric", month: "long", year: "numeric" })}`} />
      <div className="mt-3 flex gap-2 no-print">
        <Button onClick={() => window.print()}>🖨️ Yazdır / PDF</Button>
      </div>

      <div className="mt-5 space-y-5 rounded-3xl border border-line bg-card p-5 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-lg font-black">Bebek</h2>
          <p><b>Ad:</b> {baby.profile.name}</p>
          <p><b>Doğum tarihi:</b> {formatDate(baby.profile.birthDate, { day: "numeric", month: "long", year: "numeric" })}</p>
          <p><b>Yaş:</b> {baby.ageLabel}{baby.age.corrected ? ` (düzeltilmiş; ${baby.profile.gestationWeeks}. haftada doğdu)` : ""}</p>
          <p><b>Besleme yöntemi:</b> {METHOD_LABELS[baby.profile.method]}</p>
          <p><b>Egzama:</b> {{ yok: "Yok", hafif: "Hafif-orta", siddetli: "Şiddetli" }[baby.profile.eczema]}</p>
        </section>

        <section>
          <h2 className="text-lg font-black">Alerjenler</h2>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="py-1.5">Alerjen</th>
                <th>Durum</th>
                <th>İlk</th>
                <th>Son</th>
                <th>Kez</th>
              </tr>
            </thead>
            <tbody>
              {ALLERGENS.map((a) => {
                const e = allergens[a.id];
                const allergic = baby.profile.allergies.includes(a.id);
                return (
                  <tr key={a.id} className="border-b border-line/60">
                    <td className="py-1.5 font-bold">{a.name}</td>
                    <td>{allergic ? "⚠️ Alerji/reaksiyon" : e?.introducedAt ? "Tolere ediyor" : "Tanışmadı"}</td>
                    <td>{e?.introducedAt ?? "—"}</td>
                    <td>{e?.lastGivenAt ?? "—"}</td>
                    <td>{e?.timesGiven ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-black">Denenen besinler ({Object.keys(tried).length})</h2>
          {REACTIONS.map((r) => {
            const list = byReaction(r.id);
            if (!list.length) return null;
            return (
              <p key={r.id} className="mt-1">
                <b>
                  {r.emoji} {r.label}:
                </b>{" "}
                {list.map((f) => `${f.name}${r.id === "reaksiyon" ? ` (${tried[f.id].lastDate})` : ""}`).join(", ")}
              </p>
            );
          })}
        </section>

        <section>
          <h2 className="text-lg font-black">Doktora sorulacaklar</h2>
          <div className="mt-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 border-b border-dashed border-line" />
            ))}
          </div>
        </section>
        <p className="text-xs text-muted">Bu özet ebeveyn tarafından Minik Tabak uygulamasına girilen kayıtlardan oluşturulmuştur.</p>
      </div>
    </div>
  );
}
