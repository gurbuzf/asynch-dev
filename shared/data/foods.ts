import type { Food } from "../types.ts";

// Sunum önerileri: NHS, CDC boğulma riski rehberi, BLISS protokolü ve WHO 2023 temel alınarak hazırlanmıştır.
// "6-8" sütunu: parmak besinler için "parmak boyu, iki parmakla ezilebilen" kuralı geçerlidir.

export const FOODS: Food[] = [
  // ---------- SEBZELER ----------
  {
    id: "kabak", name: "Kabak", emoji: "🥒", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Buharda yumuşatılıp püre yapın ya da kabuklu, parmak boyu çubuklar halinde verin.",
      "9-11": "Küp küp doğranmış, buharda pişmiş; mücver ya da omlete rendelenmiş.",
      "12+": "Zeytinyağlı kabak, mücver, sebzeli makarna sosunda.",
    },
    note: "Hafif tadıyla ideal ilk sebzelerden biri.",
  },
  {
    id: "brokoli", name: "Brokoli", emoji: "🥦", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit", "lif", "kalsiyum"], choking: "dusuk",
    serving: {
      "6-8": "Sapı tutma yeri olacak şekilde büyük çiçekler halinde iyice yumuşayana kadar buharda pişirin; ya da püre.",
      "9-11": "Küçük çiçekler veya ince kıyılmış olarak omlet/köfte içinde.",
      "12+": "Fırında zeytinyağlı, makarna veya pilav içinde.",
    },
    note: "Acımsı yeşil sebzeleri erken ve tekrar tekrar sunmak sebze sevgisini artırır (ESPGHAN).",
  },
  {
    id: "havuc", name: "Havuç", emoji: "🥕", category: "sebze", minAgeMonths: 6,
    nutrients: ["avit", "lif"], choking: "yuksek",
    serving: {
      "6-8": "Çiğ ASLA. Çatal kolayca batana kadar haşlanmış kalın çubuklar ya da püre.",
      "9-11": "Haşlanmış küçük küpler veya rendelenip köfte/mücvere eklenmiş.",
      "12+": "Pişmiş halde; çiğ havucu yalnızca ince rendelenmiş olarak verin.",
    },
    note: "Çiğ, sert havuç boğulma riski yüksek besinlerdendir (CDC).",
  },
  {
    id: "tatli-patates", name: "Tatlı patates", emoji: "🍠", category: "sebze", minAgeMonths: 6,
    nutrients: ["avit", "lif", "enerji"], choking: "dusuk",
    serving: {
      "6-8": "Fırında yumuşatılmış parmak dilimleri (kabuğu tutma yeri olur) veya püre.",
      "9-11": "Küp küp, ezme ya da köfte bağlayıcısı olarak.",
      "12+": "Fırın sebze tabağında, çorbada.",
    },
  },
  {
    id: "patates", name: "Patates", emoji: "🥔", category: "sebze", minAgeMonths: 6,
    nutrients: ["enerji", "cvit"], choking: "dusuk",
    serving: {
      "6-8": "Püre veya fırında yumuşak parmak dilimleri. Tuz ve tereyağı fazlası olmadan.",
      "9-11": "Küp küp haşlanmış, sebze yemeklerinde.",
      "12+": "Aile yemeklerinde; kızartma yerine fırında.",
    },
  },
  {
    id: "balkabagi", name: "Bal kabağı", emoji: "🎃", category: "sebze", minAgeMonths: 6,
    nutrients: ["avit", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Fırında ya da buharda pişirip püre; yumuşak dilimler.",
      "9-11": "Küp, çorba veya yulaf lapasına karıştırılmış.",
      "12+": "Çorba, fırın yemekleri, şekersiz kek.",
    },
    note: "Adı 'bal' olsa da bal içermez; güvenle verilebilir.",
  },
  {
    id: "karnabahar", name: "Karnabahar", emoji: "🥬", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Büyük çiçekler halinde iyice buharda pişirilmiş veya püre.",
      "9-11": "Küçük çiçekler, ezilmiş halde köftede.",
      "12+": "Fırında, yoğurtlu.",
    },
  },
  {
    id: "bezelye", name: "Bezelye", emoji: "🫛", category: "sebze", minAgeMonths: 6,
    nutrients: ["protein", "lif", "demir"], choking: "orta",
    serving: {
      "6-8": "Püre ya da çatalla tamamen ezilmiş (bütün tane değil).",
      "9-11": "Hafifçe ezilmiş tane; kıskaç kavrama için harika bir alıştırma.",
      "12+": "Bütün, pişmiş taneler.",
    },
    note: "Bütün pişmiş bezelye taneleri küçük bebeklerde boğulma riski taşır (CDC) — 9 aydan önce ezin.",
  },
  {
    id: "ispanak", name: "Ispanak", emoji: "🥬", category: "sebze", minAgeMonths: 7,
    nutrients: ["demir", "avit", "lif"], choking: "dusuk",
    serving: {
      "6-8": "İnce kıyılmış, pişmiş; başka bir püreye karıştırılmış küçük miktar.",
      "9-11": "Omlet, mücver, köfte içine kıyılmış.",
      "12+": "Ispanaklı yemekler; yoğurtla.",
    },
    note: "Nitrat nedeniyle ana sebze olarak değil, karışımlarda az miktarda kullanın; pişmiş ıspanağı hazırlandığı gün tüketin, tekrar tekrar ısıtmayın (EFSA).",
  },
  {
    id: "domates", name: "Domates", emoji: "🍅", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit", "avit"], choking: "orta",
    serving: {
      "6-8": "Kabuğu soyulmuş, çekirdeği alınmış büyük dilimler veya pişmiş sosta.",
      "9-11": "Küçük küpler; çeri domatesi dörde bölün.",
      "12+": "Salata, menemen; çeri domatesler 4 yaşına kadar dörde bölünmeli.",
    },
    note: "Demirin emilimini artıran C vitamini kaynağı. Çeri domates bütün verilmez.",
  },
  {
    id: "salatalik", name: "Salatalık", emoji: "🥒", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit"], choking: "orta",
    serving: {
      "6-8": "Kabuğu soyulmuş, parmak boyu kalın çubuk (emmek için). Ince dilim yok.",
      "9-11": "Çok ince rendelenmiş cacık içinde veya küçük yumuşak parçalar.",
      "12+": "İnce çubuklar, kahvaltı tabağında.",
    },
    note: "Diş kaşıntısına iyi gelir; buzdolabında soğutulmuş çubuklar verilebilir.",
  },
  {
    id: "patlican", name: "Patlıcan", emoji: "🍆", category: "sebze", minAgeMonths: 6,
    nutrients: ["lif"], choking: "dusuk",
    serving: {
      "6-8": "Közlenip kabuğu soyulmuş, ezilmiş — yoğurtla.",
      "9-11": "Közlenmiş patlıcan ezmesi, sebze yemeklerinde.",
      "12+": "Tuzsuz/az tuzlu aile yemeklerinde.",
    },
  },
  {
    id: "pirasa", name: "Pırasa", emoji: "🥬", category: "sebze", minAgeMonths: 7,
    nutrients: ["lif", "cvit"], choking: "orta",
    serving: {
      "6-8": "Çok iyi pişmiş ve püre yapılmış, başka sebzelerle.",
      "9-11": "İnce doğranmış, zeytinyağlı.",
      "12+": "Zeytinyağlı pırasa, köfte içinde.",
    },
    note: "Lifli yapısı nedeniyle küçük bebeklere ince kıyılmış ve iyi pişmiş verin.",
  },
  {
    id: "taze-fasulye", name: "Taze fasulye", emoji: "🫛", category: "sebze", minAgeMonths: 6,
    nutrients: ["lif", "cvit"], choking: "orta",
    serving: {
      "6-8": "Bütün, çok yumuşak pişmiş (BLW için kavranabilir) ya da püre.",
      "9-11": "Küçük parçalara doğranmış zeytinyağlı.",
      "12+": "Aile yemeği olarak.",
    },
  },
  {
    id: "kirmizi-biber", name: "Kırmızı biber (tatlı)", emoji: "🫑", category: "sebze", minAgeMonths: 6,
    nutrients: ["cvit", "avit"], choking: "orta",
    serving: {
      "6-8": "Közlenip kabuğu soyulmuş geniş şeritler.",
      "9-11": "Pişmiş küçük parçalar, menemen ve omlette.",
      "12+": "Çiğ ince şeritler.",
    },
    note: "En zengin C vitamini kaynaklarından — demirli yemeklerin yanına harika.",
  },
  {
    id: "pancar", name: "Pancar", emoji: "🟣", category: "sebze", minAgeMonths: 7,
    nutrients: ["lif"], choking: "orta",
    serving: {
      "6-8": "Haşlanmış/fırınlanmış ve püre, az miktarda.",
      "9-11": "Küçük yumuşak küpler veya yoğurtla ezme.",
      "12+": "Salatalarda, rendelenmiş.",
    },
    note: "Kakayı/çişi pembeleştirebilir — panik yok! Nitrat içerdiğinden porsiyonu küçük tutun.",
  },

  // ---------- MEYVELER ----------
  {
    id: "avokado", name: "Avokado", emoji: "🥑", category: "meyve", minAgeMonths: 6,
    nutrients: ["enerji", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Olgun avokado şeritleri (kayganlığı azaltmak için öğütülmüş yulafa bulayın) veya ezme.",
      "9-11": "Küçük küpler, tam buğday ekmeğine sürülmüş.",
      "12+": "Kahvaltıda, salatada.",
    },
    note: "Sağlıklı yağ deposu; enerji yoğunluğu yüksek.",
  },
  {
    id: "muz", name: "Muz", emoji: "🍌", category: "meyve", minAgeMonths: 6,
    nutrients: ["enerji", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Kabuğun bir kısmını tutamak olarak bırakın ya da ezin.",
      "9-11": "Küçük dilimler/küpler.",
      "12+": "Dilimlenmiş; şekersiz tatlıların doğal tatlandırıcısı.",
    },
  },
  {
    id: "elma", name: "Elma", emoji: "🍎", category: "meyve", minAgeMonths: 6,
    nutrients: ["lif", "cvit"], choking: "yuksek",
    serving: {
      "6-8": "Çiğ ASLA. Buharda yumuşatılmış dilimler veya püre; ya da çok ince rendelenmiş.",
      "9-11": "Pişmiş küçük küpler veya ince rendelenmiş çiğ elma.",
      "12+": "İnce dilimler; tercihen hâlâ rendeli/pişmiş.",
    },
    note: "Çiğ sert elma dilimleri boğulma riski yüksek besinlerdendir.",
  },
  {
    id: "armut", name: "Armut", emoji: "🍐", category: "meyve", minAgeMonths: 6,
    nutrients: ["lif", "cvit"], choking: "orta",
    serving: {
      "6-8": "Çok olgunsa kabuksuz dilim; değilse buharda pişirilip püre.",
      "9-11": "Olgun armut küpleri.",
      "12+": "Dilimler.",
    },
    note: "Kabızlığa iyi gelen sorbitol içerir.",
  },
  {
    id: "seftali", name: "Şeftali", emoji: "🍑", category: "meyve", minAgeMonths: 6,
    nutrients: ["cvit", "avit"], choking: "orta",
    serving: {
      "6-8": "Olgun şeftali — kabuğu soyulmuş büyük dilimler ya da püre.",
      "9-11": "Küçük küpler, yoğurtla.",
      "12+": "Dilimler.",
    },
  },
  {
    id: "erik", name: "Erik / kuru erik", emoji: "🟣", category: "meyve", minAgeMonths: 6,
    nutrients: ["lif"], choking: "yuksek",
    serving: {
      "6-8": "Çekirdeksiz, kabuksuz püre. Kuru erik suda bekletilip püre yapılır.",
      "9-11": "Olgun eriğin çekirdeği alınıp ince doğranmış.",
      "12+": "Dörde bölünmüş; kuru erik ince doğranmış.",
    },
    note: "Kabızlık için klasik yardımcı.",
  },
  {
    id: "uzum", name: "Üzüm", emoji: "🍇", category: "meyve", minAgeMonths: 9,
    nutrients: ["cvit"], choking: "yuksek",
    serving: {
      "6-8": "Önerilmez (veya çekirdeksiz üzümü ezip püre içinde).",
      "9-11": "Çekirdeksiz üzümü UZUNLAMASINA dörde bölün.",
      "12+": "4 yaşına kadar daima uzunlamasına dörde bölün.",
    },
    note: "Bütün üzüm, küçük çocuklarda boğulmaya bağlı ölümlerin önde gelen nedenlerindendir.",
  },
  {
    id: "cilek", name: "Çilek", emoji: "🍓", category: "meyve", minAgeMonths: 6,
    nutrients: ["cvit"], choking: "orta",
    serving: {
      "6-8": "Çok büyük bütün çilek (emmek için) veya ezilmiş.",
      "9-11": "Küçük parçalara doğranmış.",
      "12+": "Dörde bölünmüş.",
    },
    note: "Ağız çevresinde kızarıklık asidik yapıya bağlı temas reaksiyonu olabilir; yayılırsa doktora danışın.",
  },
  {
    id: "mandalina", name: "Portakal / mandalina", emoji: "🍊", category: "meyve", minAgeMonths: 6,
    nutrients: ["cvit"], choking: "orta",
    serving: {
      "6-8": "Zarı soyulmuş dilimlerden emmesi için büyük parçalar (çekirdeksiz).",
      "9-11": "Zarı alınmış, küçük parçalar.",
      "12+": "Zarı alınmış dilimler.",
    },
    note: "Meyve suyu değil, meyvenin kendisi! AAP 1 yaş altına meyve suyu önermez.",
  },
  {
    id: "kayisi", name: "Kayısı", emoji: "🟠", category: "meyve", minAgeMonths: 6,
    nutrients: ["avit", "lif"], choking: "orta",
    serving: {
      "6-8": "Olgun taze kayısı püresi; kuru kayısıyı suda bekletip püre yapın (kükürtsüz tercih edin).",
      "9-11": "Taze kayısı küpleri; kuru kayısı çok ince doğranmış.",
      "12+": "Taze dilim; kuru kayısı ince doğranmış.",
    },
    note: "Kuru meyveler yapışkan ve sert olabilir — bütün verilmez.",
  },
  {
    id: "karpuz", name: "Karpuz / kavun", emoji: "🍉", category: "meyve", minAgeMonths: 6,
    nutrients: ["cvit"], choking: "orta",
    serving: {
      "6-8": "Çekirdeksiz, parmak boyu çubuklar.",
      "9-11": "Küçük küpler.",
      "12+": "Dilimler.",
    },
  },
  {
    id: "hurma", name: "Hurma", emoji: "🟤", category: "meyve", minAgeMonths: 9,
    nutrients: ["lif", "enerji"], choking: "yuksek",
    serving: {
      "6-8": "Önerilmez (yapışkan doku).",
      "9-11": "Çekirdeği çıkarılıp sıcak suda bekletilmiş, püre yapılarak tatlandırıcı olarak.",
      "12+": "Çok ince doğranmış ya da püre.",
    },
    note: "Şeker yerine doğal tatlandırıcı; ama yine de az kullanın.",
  },

  // ---------- PROTEİN ----------
  {
    id: "dana-kiyma", name: "Dana / kuzu kıyma", emoji: "🥩", category: "protein", minAgeMonths: 6,
    nutrients: ["demir", "cinko", "protein"], choking: "orta",
    serving: {
      "6-8": "Sebzeyle pişirip püre; ya da yumuşak, parmak şeklinde köfte.",
      "9-11": "Kıymalı sebze yemekleri, küçük köfteler.",
      "12+": "Aile yemekleri.",
    },
    note: "Hem demir hem çinko açısından en değerli besinlerden. WHO her gün hayvansal gıda önerir.",
  },
  {
    id: "tavuk", name: "Tavuk (tercihen but)", emoji: "🍗", category: "protein", minAgeMonths: 6,
    nutrients: ["protein", "demir", "cinko"], choking: "orta",
    serving: {
      "6-8": "But eti (göğüsten daha demirli ve yumuşak) — pişirip püre; ya da baget kemiği üzerinde, kıkırdak/deri temizlenmiş.",
      "9-11": "İnce didiklenmiş, köfte.",
      "12+": "Küçük parçalar halinde.",
    },
  },
  {
    id: "ciger", name: "Dana ciğer", emoji: "🫀", category: "protein", minAgeMonths: 7,
    nutrients: ["demir", "avit", "cinko"], choking: "orta",
    serving: {
      "6-8": "İyice pişmiş, püre yapılmış — haftada en fazla 1 kez, çok küçük porsiyon.",
      "9-11": "Köfte içinde az miktarda.",
      "12+": "Haftada en fazla 1 kez.",
    },
    note: "Çok yüksek A vitamini içerdiğinden sınırlı tüketilmelidir.",
  },
  {
    id: "yumurta", name: "Yumurta", emoji: "🥚", category: "protein", minAgeMonths: 6, allergen: "yumurta",
    nutrients: ["protein", "demir", "avit"], choking: "dusuk",
    serving: {
      "6-8": "Tamamı (sarısı + akı) iyice pişmiş: omlet şeritleri veya haşlanmış yumurta ezmesi.",
      "9-11": "Haşlanmış yumurta küpleri, sebzeli omlet.",
      "12+": "Menemen, haşlanmış; az pişmiş yumurta yok.",
    },
    note: "'Önce sarısı' kuralı eskidi — bütün yumurta 6. aydan itibaren iyice pişmiş olarak verilebilir.",
  },
  {
    id: "somon", name: "Somon", emoji: "🍣", category: "protein", minAgeMonths: 6, allergen: "balik",
    nutrients: ["omega3", "protein", "demir"], choking: "orta",
    serving: {
      "6-8": "Kılçıkları tek tek kontrol ederek ayıklanmış, fırında pişmiş ve ezilmiş.",
      "9-11": "Didiklenmiş, köftede.",
      "12+": "Fırında.",
    },
    note: "Düşük cıvalı balık — haftada 2 kez önerilir (FDA).",
  },
  {
    id: "hamsi", name: "Hamsi / sardalya", emoji: "🐟", category: "protein", minAgeMonths: 7, allergen: "balik",
    nutrients: ["omega3", "kalsiyum", "protein", "demir"], choking: "orta",
    serving: {
      "6-8": "Ayıklanmış (kılçıksız) fırın hamsi, ezilmiş.",
      "9-11": "Kılçıksız hamsi köftesi.",
      "12+": "Fırında, ayıklanmış.",
    },
    note: "Karadeniz'in süper besini: omega-3 açısından zengin, cıvası düşük.",
  },
  {
    id: "levrek", name: "Levrek / çipura / mezgit", emoji: "🐠", category: "protein", minAgeMonths: 6, allergen: "balik",
    nutrients: ["protein", "omega3"], choking: "orta",
    serving: {
      "6-8": "Buğulama, kılçıksız, ezilmiş.",
      "9-11": "Didiklenmiş.",
      "12+": "Aile yemeği.",
    },
    note: "Köpek balığı, kılıç balığı, ton balığı (büyük türler) gibi yüksek cıvalı balıklardan kaçının.",
  },
  {
    id: "karides", name: "Karides", emoji: "🦐", category: "protein", minAgeMonths: 9, allergen: "kabuklu",
    nutrients: ["protein"], choking: "yuksek",
    serving: {
      "6-8": "Önerilmez (veya çok ince püre, alerjen tanıştırma amacıyla).",
      "9-11": "İyice pişmiş, çok ince kıyılmış.",
      "12+": "Küçük parçalara doğranmış.",
    },
    note: "Bütün karides kauçuk dokusuyla boğulma riski taşır.",
  },
  {
    id: "tofu", name: "Tofu", emoji: "🧈", category: "protein", minAgeMonths: 6, allergen: "soya",
    nutrients: ["protein", "kalsiyum", "demir"], choking: "dusuk",
    serving: {
      "6-8": "Yumuşak tofu ezilmiş; sert tofu fırında parmak çubuklar.",
      "9-11": "Küpler.",
      "12+": "Küpler, sotede.",
    },
  },

  // ---------- SÜT ÜRÜNLERİ ----------
  {
    id: "yogurt", name: "Yoğurt (tam yağlı, şekersiz)", emoji: "🥣", category: "sut", minAgeMonths: 6, allergen: "sut",
    nutrients: ["kalsiyum", "protein"], choking: "dusuk",
    serving: {
      "6-8": "Kaşıkla veya önceden yüklenmiş kaşık olarak bebeğe uzatın.",
      "9-11": "Meyve püresiyle karıştırılmış; donmuş yoğurt damlaları.",
      "12+": "Her gün; meyveli yoğurtlar yerine sade + taze meyve.",
    },
    note: "Türkiye'de geleneksel ilk besinlerden. Hazır meyveli yoğurtlar genellikle şeker içerir.",
  },
  {
    id: "peynir-lor", name: "Lor / tuzsuz beyaz peynir", emoji: "🧀", category: "sut", minAgeMonths: 7, allergen: "sut",
    nutrients: ["kalsiyum", "protein"], choking: "dusuk",
    serving: {
      "6-8": "Tuzsuz lor ezilmiş, sebze püresine karıştırılmış.",
      "9-11": "Lor, tuzsuz/az tuzlu peynir — tuzunu suda bekleterek azaltın.",
      "12+": "Az tuzlu beyaz peynir; kaşar ince rendelenmiş.",
    },
    note: "Klasik beyaz peynir çok tuzludur. 1 yaş altında tuz ihtiyacı < 1 g/gün.",
  },
  {
    id: "inek-sutu", name: "İnek sütü", emoji: "🥛", category: "sut", minAgeMonths: 12, allergen: "sut",
    nutrients: ["kalsiyum", "protein"], choking: "dusuk",
    serving: {
      "6-8": "Ana içecek olarak verilmez; pişirmede (lapa, muhallebi) az miktar kullanılabilir.",
      "9-11": "Yine yalnızca pişirmede.",
      "12+": "Tam yağlı, açık bardaktan; günde ~400–500 ml'yi aşmayın.",
    },
    note: "12 aydan önce içecek olarak inek sütü bağırsak kanamasına ve demir eksikliğine yol açabilir (CDC).",
  },
  {
    id: "tereyagi", name: "Tereyağı", emoji: "🧈", category: "sut", minAgeMonths: 6, allergen: "sut",
    nutrients: ["enerji", "avit"], choking: "dusuk",
    serving: {
      "6-8": "Tuzsuz tereyağı, sebze püresine küçük bir parça.",
      "9-11": "Yemeklerde az miktar.",
      "12+": "Az miktar.",
    },
  },

  // ---------- TAHILLAR ----------
  {
    id: "yulaf", name: "Yulaf", emoji: "🌾", category: "tahil", minAgeMonths: 6,
    nutrients: ["lif", "demir", "enerji"], choking: "dusuk",
    serving: {
      "6-8": "İnce öğütülmüş yulaf lapası (anne sütü/mama veya suyla pişmiş).",
      "9-11": "Normal yulaf lapası, şekersiz yulaf pankeki.",
      "12+": "Yulaf lapası, muffin, köfte bağlayıcısı.",
    },
    note: "Saf yulaf glutensizdir ama genellikle buğdayla çapraz bulaşıktır.",
  },
  {
    id: "bulgur", name: "Bulgur", emoji: "🌾", category: "tahil", minAgeMonths: 7, allergen: "bugday",
    nutrients: ["lif", "demir", "enerji"], choking: "dusuk",
    serving: {
      "6-8": "İnce (köftelik) bulgur, çorbada iyice pişmiş.",
      "9-11": "Sebzeli bulgur pilavı (yumuşak pişmiş).",
      "12+": "Aile pilavı, kısır (az baharatlı).",
    },
    note: "Pirince göre daha fazla lif ve daha az arsenik — harika bir alternatif.",
  },
  {
    id: "pirinc", name: "Pirinç", emoji: "🍚", category: "tahil", minAgeMonths: 6,
    nutrients: ["enerji"], choking: "dusuk",
    serving: {
      "6-8": "Bol suda pişirilip suyu dökülmüş, lapa veya püre içinde.",
      "9-11": "Yumuşak pilav, sütlaç (şekersiz).",
      "12+": "Pilav.",
    },
    note: "Arsenik birikimi nedeniyle tek tahıl olarak kullanmayın; yulaf, bulgur, karabuğday ile dönüşümlü verin. Pirinç sütü 5 yaş altına önerilmez (NHS).",
  },
  {
    id: "makarna", name: "Makarna / şehriye", emoji: "🍝", category: "tahil", minAgeMonths: 7, allergen: "bugday",
    nutrients: ["enerji"], choking: "dusuk",
    serving: {
      "6-8": "Burgu veya kalem makarna iyice pişmiş (kavraması kolay).",
      "9-11": "Küçük makarna, arpa şehriye.",
      "12+": "Aile makarnaları.",
    },
  },
  {
    id: "ekmek", name: "Tam buğday ekmeği", emoji: "🍞", category: "tahil", minAgeMonths: 7, allergen: "bugday",
    nutrients: ["lif", "enerji"], choking: "orta",
    serving: {
      "6-8": "Hafifçe kızartılmış parmak şeritleri, üzerine ezme sürülmüş.",
      "9-11": "Küçük parçalar.",
      "12+": "Dilimler.",
    },
    note: "Yumuşak beyaz ekmek ağızda hamurlaşıp topaklanabilir; hafif kızartmak riski azaltır.",
  },
  {
    id: "irmik", name: "İrmik", emoji: "🌾", category: "tahil", minAgeMonths: 7, allergen: "bugday",
    nutrients: ["enerji"], choking: "dusuk",
    serving: {
      "6-8": "Şekersiz irmik lapası (meyveyle tatlandırılmış).",
      "9-11": "İrmik lapası, sebzeli.",
      "12+": "Şekersiz irmik tatlısı.",
    },
  },
  {
    id: "karabugday", name: "Karabuğday", emoji: "🌾", category: "tahil", minAgeMonths: 6,
    nutrients: ["lif", "demir", "protein"], choking: "dusuk",
    serving: {
      "6-8": "Lapa veya un olarak pankek.",
      "9-11": "Pilav, lapa.",
      "12+": "Pilav, salata.",
    },
    note: "Adına rağmen buğday değildir; glutensizdir.",
  },

  // ---------- BAKLİYAT ----------
  {
    id: "kirmizi-mercimek", name: "Kırmızı mercimek", emoji: "🫘", category: "bakliyat", minAgeMonths: 6,
    nutrients: ["demir", "protein", "lif"], choking: "dusuk",
    serving: {
      "6-8": "Havuç/patatesle pişirilip püre (bebek mercimek çorbası).",
      "9-11": "Pütürlü çorba, mercimek köftesi (az baharatlı).",
      "12+": "Aile çorbası, az tuzlu.",
    },
    note: "Bitkisel demir kaynağı — limon/domates gibi C vitaminiyle birlikte verin.",
  },
  {
    id: "nohut", name: "Nohut", emoji: "🧆", category: "bakliyat", minAgeMonths: 7,
    nutrients: ["demir", "protein", "lif"], choking: "yuksek",
    serving: {
      "6-8": "Kabukları soyulup tamamen püre (bebek humusu).",
      "9-11": "Çatalla iyice ezilmiş; bütün nohut yok.",
      "12+": "Ezilmiş veya yarıya bölünmüş yumuşak nohut.",
    },
    note: "Bütün nohut tanesi küçük çocuklarda boğulma riskidir.",
  },
  {
    id: "yesil-mercimek", name: "Yeşil mercimek", emoji: "🫘", category: "bakliyat", minAgeMonths: 7,
    nutrients: ["demir", "protein", "lif"], choking: "dusuk",
    serving: {
      "6-8": "İyice pişip ezilmiş.",
      "9-11": "Sebzeli yemekte yumuşak taneler.",
      "12+": "Aile yemeği.",
    },
  },
  {
    id: "kuru-fasulye", name: "Kuru fasulye", emoji: "🫘", category: "bakliyat", minAgeMonths: 8,
    nutrients: ["demir", "protein", "lif"], choking: "orta",
    serving: {
      "6-8": "Kabukları soyulup püre, az miktarda (gaz yapabilir).",
      "9-11": "Çatalla ezilmiş.",
      "12+": "Ezilmiş veya yumuşak taneler.",
    },
  },

  // ---------- YAĞLAR & EZMELER ----------
  {
    id: "zeytinyagi", name: "Zeytinyağı", emoji: "🫒", category: "yag", minAgeMonths: 6,
    nutrients: ["enerji"], choking: "dusuk",
    serving: {
      "6-8": "Her püreye ½–1 çay kaşığı sızma zeytinyağı.",
      "9-11": "Yemeklerde.",
      "12+": "Yemeklerde, salatalarda.",
    },
    note: "Bebek beslenmesinde yağ kısıtlanmaz — beyin gelişimi için önemli enerji kaynağı.",
  },
  {
    id: "tahin", name: "Tahin", emoji: "🥄", category: "yag", minAgeMonths: 6, allergen: "susam",
    nutrients: ["kalsiyum", "demir", "enerji"], choking: "orta",
    serving: {
      "6-8": "İnce bir tabaka veya püre/yoğurda karıştırılmış (kaşıktan kalın top halinde değil).",
      "9-11": "Humus, tahinli yoğurt, ekmeğe ince sürülmüş.",
      "12+": "Ekmeğe sürülmüş; pekmezle karıştırmadan.",
    },
    note: "Susam alerjenini tanıştırmanın en kolay yolu.",
  },
  {
    id: "fistik-ezmesi", name: "Fıstık ezmesi (sade)", emoji: "🥜", category: "yag", minAgeMonths: 6, allergen: "yerfistigi",
    nutrients: ["protein", "enerji"], choking: "yuksek",
    serving: {
      "6-8": "Sulandırılmış veya püreye karıştırılmış; asla kaşıktan kalın topak halinde.",
      "9-11": "Kızarmış ekmek şeridine çok ince sürülmüş.",
      "12+": "İnce sürülmüş; bütün fıstık 5 yaşına kadar yok.",
    },
    note: "Erken tanıştırma yer fıstığı alerjisi riskini anlamlı ölçüde azaltır (LEAP çalışması, NIAID).",
  },
  {
    id: "ceviz", name: "Ceviz / badem / fındık", emoji: "🌰", category: "yag", minAgeMonths: 6, allergen: "agacyemisi",
    nutrients: ["omega3", "enerji", "protein"], choking: "yuksek",
    serving: {
      "6-8": "Un gibi öğütülmüş, lapaya/yoğurda serpilmiş.",
      "9-11": "Öğütülmüş veya ince ezme olarak.",
      "12+": "Öğütülmüş/ezme. Bütün veya iri parça yemiş 5 yaşına kadar yok.",
    },
  },
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));
