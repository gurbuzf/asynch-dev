import { useState } from "react";
import { Sheet, cx } from "./ui.tsx";

const INFANT = [
  { icon: "📞", text: "112'yi arayın ya da birine arattırın. Telefonu hoparlöre alın." },
  { icon: "🤲", text: "Bebeği yüzüstü, başı gövdesinden aşağıda kalacak şekilde ön kolunuza yatırın; çenesini elinizle destekleyin." },
  { icon: "✋", text: "Avuç içi topuğuyla kürek kemikleri arasına 5 kez sert vuruş yapın." },
  { icon: "🔄", text: "Çıkmadıysa sırtüstü çevirin. Göğüs ortasına, meme hizasının hemen altına iki parmakla 5 kez bastırın (≈4 cm derinlik)." },
  { icon: "🔁", text: "Cisim çıkana ya da ekip gelene kadar 5 sırt vuruşu + 5 göğüs basısına devam edin." },
  { icon: "❤️", text: "Bilinç kaybolursa temel yaşam desteğine (CPR) başlayın; ağza her soluk vermeden önce bakın, cismi görürseniz alın." },
];

const CHILD = [
  { icon: "📞", text: "112'yi arayın ya da birine arattırın." },
  { icon: "🧍", text: "Çocuğun arkasına geçin, öne doğru eğin." },
  { icon: "✋", text: "Kürek kemikleri arasına 5 kez sert sırt vuruşu yapın." },
  { icon: "🤜", text: "Çıkmadıysa arkasından sarılıp yumruğunuzu göbeğin hemen üstüne koyun; diğer elinizle kavrayıp içeri-yukarı doğru 5 kez bastırın (Heimlich)." },
  { icon: "🔁", text: "Cisim çıkana kadar 5 sırt vuruşu + 5 karın basısını sürdürün." },
  { icon: "❤️", text: "Bilinç kaybolursa CPR'a başlayın." },
];

export function SosSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"bebek" | "cocuk" | "alerji">("bebek");
  const steps = tab === "bebek" ? INFANT : CHILD;
  return (
    <Sheet open={open} onClose={onClose} title="Acil durum rehberi">
      <h2 className="text-2xl font-black text-danger-ink pr-10">🆘 Acil Durum</h2>
      <a
        href="tel:112"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-danger py-4 text-xl font-black text-white shadow-soft active:scale-[0.98]"
      >
        📞 112'yi Ara
      </a>
      <p className="mt-2 text-center text-sm font-bold text-muted">Düğme çalışmazsa telefonunuzdan doğrudan <span className="select-all text-danger-ink">112</span>'yi tuşlayın.</p>

      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-card p-1.5 border border-line" role="tablist">
        {(
          [
            ["bebek", "1 yaş altı"],
            ["cocuk", "1 yaş üstü"],
            ["alerji", "Alerji"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cx("rounded-xl py-2 text-sm font-extrabold transition", tab === id ? "bg-danger-soft text-danger-ink" : "text-muted")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== "alerji" ? (
        <>
          <p className="mt-4 text-[15px] font-semibold text-muted">
            <b className="text-ink">Boğulma sessizdir:</b> ağlayamaz, öksüremez, morarır. Öksürüyor ve ses çıkarıyorsa bu <b className="text-ink">öğürmedir</b> — müdahale etmeyin, öksürmesine izin verin.
          </p>
          <ol className="mt-4 space-y-2.5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-card border border-line p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger-soft font-black text-danger-ink">{i + 1}</span>
                <span className="text-[15px] font-semibold leading-snug">
                  <span aria-hidden className="mr-1">{s.icon}</span>
                  {s.text}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">Ağza kör parmakla girip cisim aramayın. Bu adımları gerçek bir bebek ilk yardım kursunda uygulamalı öğrenmenizi öneririz.</p>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-danger-soft p-4 text-danger-ink">
            <p className="font-black">Hemen 112 — ciddi alerjik reaksiyon (anafilaksi) belirtileri:</p>
            <ul className="mt-2 list-disc pl-5 font-semibold space-y-1">
              <li>Nefes darlığı, hırıltı, sürekli öksürük</li>
              <li>Dudak, dil veya yüzde şişme</li>
              <li>Yaygın kurdeşen + kusma</li>
              <li>Solukluk, morarma, halsizlik, gevşeklik</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-sun-soft p-4 text-sun-ink">
            <p className="font-black">Hafif reaksiyon — besini kesin, doktorunuzu arayın:</p>
            <ul className="mt-2 list-disc pl-5 font-semibold space-y-1">
              <li>Ağız çevresinde birkaç kızarıklık / kurdeşen</li>
              <li>Tek seferlik kusma</li>
              <li>Hafif ishal</li>
            </ul>
          </div>
          <p className="text-sm text-muted">Reaksiyonun fotoğrafını çekmek ve ne kadar yediğini not etmek doktorunuza çok yardımcı olur. Uygulamada Günlük → Alerjenler bölümünden kaydedebilirsiniz.</p>
        </div>
      )}
    </Sheet>
  );
}
