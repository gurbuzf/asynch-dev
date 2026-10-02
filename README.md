# 🥣 Minik Tabak — Kanıta Dayalı Ek Gıda Rehberi

Bebeğinizin **yaşına göre şekillenen** günlük menüler, 45 tarif, 56 besinlik tadım pasaportu, adım adım alerjen tanıştırma planı ve tek dokunuşla ilk yardım rehberi. Bu bir **full-stack TypeScript** uygulamasıdır: Express API + React PWA, ikisi de aynı ortak alan katmanını (`shared/`) kullanır.

> ⚠️ Tıbbi tavsiye yerine geçmez. İçerik WHO (2023), AAP, ESPGHAN, CDC, NHS, NIAID, FDA, EFSA ve T.C. Sağlık Bakanlığı önerileri temel alınarak hazırlanmıştır.

## 🌐 Web uygulaması (sunucusuz sürüm)

`npm run build:artifact` tek dosyalık, sunucu gerektirmeyen bir sürüm üretir (`artifact/minik-tabak.html`). Bu sürümde API (`shared/api.ts`) tarayıcının içinde çalışır; Claude Artifact olarak yayınlanmıştır ve statik herhangi bir barındırmada (GitHub Pages, Netlify…) açılabilir. Ekran görüntüleri: [`docs/screenshots/`](docs/screenshots).

## Özellikler

| Ekran | Ne yapar? |
|---|---|
| ☀️ **Bugün** | Yaş (prematüreler için düzeltilmiş yaş), evre ve ilerleme çubuğu; yaşa göre öğün sayısı (WHO 2023); **her gün en az bir demir kaynağı garantili** menü; günün yeni alerjeni; alerjen bakım hatırlatıcısı; günün besini; günün ipucu; günlük kontrol listesi |
| 🗓️ **Haftalık plan** | 7 günlük menü + alerjen takvimi (yeni alerjenler arasında ≥3 gün) + gruplanmış, paylaşılabilir **alışveriş listesi** |
| 🍲 **Tarifler** | 45 tuzsuz/şekersiz tarif (Türk mutfağı uyarlamaları: ezogelin, mücver, hamsi köftesi, türlü, yayla çorbası…). Yaş/öğün/demir/BLW/dondurulabilir filtreleri, bebeğin yaşına özel doku önerisi, "büyüdükçe" zaman çizelgesi, saklama bilgisi, diyetisyen notu ve ekranı açık tutan **Pişirme modu** |
| 🛂 **Besinler** | Tadım pasaportu: her besin bir mühür. Yaşa göre sunum (6–8 / 9–11 / 12+ ay), boğulma riski, tepki kaydı (😍😐🙅⚠️) ve 8–15 tekrar maruziyet sayacı |
| 📒 **Günlük** | 9 alerjenin yolculuğu, tadım geçmişi, reaksiyon uyarıları, yazdırılabilir **doktor özeti**, JSON yedekleme/geri yükleme |
| 📚 **Rehber** | 13 makale, 12 mit-gerçek kartı, "Ne zaman ne?" zaman çizelgesi, kaynaklar |
| 🆘 **Acil** | Her ekrandan erişilen boğulma ilk yardımı (1 yaş altı/üstü), anafilaksi belirtileri, tek dokunuşla 112 |

Diğer: açık/koyu tema, PWA (ana ekrana eklenebilir, çevrimdışı önbellek), Türkçe ünlü uyumuyla kişiselleştirme ("Ela'nın tabağı", "Umut'un tabağı"), tüm kişisel veriler yalnızca cihazda.

## Güvenlik kuralları kodda

Plan motoru (`shared/logic/plan.ts`) ve içerik testleri şu kuralları **zorunlu** kılar:

- 6 aydan önce menü üretilmez; 4 aydan önce başlanmaması vurgulanır.
- Tanıştırılmamış alerjen içeren tarif önerilmez (yalnızca o günün tek yeni alerjeni hariç).
- Bilinen alerjiler hiçbir öneride yer almaz.
- Alerjenlere başlamadan önce en az 3 besin denenmiş olmalı; yeni alerjenler arasında 3 gün beklenir.
- 12 ay altı tariflerde **bal, eklenmiş tuz, şeker, pekmez** bulunmadığı testle doğrulanır.
- Malzemelerdeki alerjenlerin tarifte beyan edildiği testle doğrulanır (bu test geliştirme sırasında gerçek beyan hatalarını yakaladı).

## Çalıştırma

```bash
npm install
npm run dev        # API :8787 + Vite :5173 (proxy ile)
npm test           # 48 test: içerik güvenliği, plan mantığı, API
npm run typecheck
npm run build && npm start   # üretim: Express derlenmiş istemciyi de sunar → http://localhost:8787
npm run build:artifact       # sunucusuz tek dosya → artifact/minik-tabak.html
```

## Mimari

```
shared/            Ortak alan katmanı (API + istemci)
  types.ts         Tipler
  data/            Tarifler, besinler, ipuçları, makaleler, evreler, alerjenler, kaynaklar
  logic/           Yaş/evre hesabı, deterministik günlük & haftalık plan, alışveriş listesi, arama
shared/api.ts      Çerçeveden bağımsız API işleyicisi (Express ve tarayıcı içi sürüm ortak kullanır)
server/            Express 5 adaptörü (+ üretimde SPA sunumu)
client/            React 19 + Tailwind 4 PWA (hash router, localStorage store)
tests/             Vitest + Supertest
```

### API

| Uç nokta | Açıklama |
|---|---|
| `GET /api/health` | Durum ve içerik sayıları |
| `GET /api/meta` | Evreler, alerjenler, etiketler, kaynaklar |
| `GET /api/recipes?ageMonths&meal&q&tag&exclude&method&iron&freezable` | Tarif listesi (özet) |
| `GET /api/recipes/:id` | Tam tarif |
| `GET /api/foods?ageMonths&category&q` | Besin veritabanı |
| `GET /api/tips?ageMonths` · `GET /api/myths` | İpuçları ve mitler |
| `GET /api/articles` · `GET /api/articles/:id` | Rehber makaleleri |
| `GET /api/plan/daily?ageMonths&date&method&introduced&allergies&tried&lastAllergenIntro&shuffle` | Kişisel günlük plan |
| `GET /api/plan/weekly?…` | 7 günlük plan + alışveriş listesi |

Plan uçları durumsuzdur: sunucu hiçbir kişisel veri saklamaz; isim ve doğum tarihi gönderilmez. Aynı gün + aynı profil her zaman aynı menüyü üretir (`shuffle` ile değiştirilebilir).
