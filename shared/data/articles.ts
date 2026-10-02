import type { Article } from "../types.ts";

export const ARTICLES: Article[] = [
  {
    id: "hazir-mi",
    title: "Bebeğim ek gıdaya hazır mı?",
    emoji: "🚦",
    category: "baslangic",
    minutes: 3,
    summary: "Takvimden çok bebeğinizin gelişim işaretlerine bakın.",
    sources: ["who2023", "espghan", "nhs"],
    sections: [
      {
        paragraphs: [
          "Dünya Sağlık Örgütü ve ESPGHAN, ek gıdaya yaklaşık 6. ayda başlanmasını öneriyor. 4. aydan (17 hafta) önce başlanmamalı, 6. aydan sonraya da ertelenmemelidir. Ancak her bebek farklıdır; aşağıdaki üç işaretin birlikte görülmesi önemlidir.",
        ],
      },
      {
        heading: "Üç temel işaret",
        bullets: [
          "Desteksiz veya az destekle dik oturabiliyor ve başını sabit tutabiliyor.",
          "Yiyeceğe bakıp, onu tutup ağzına kendisi götürebiliyor (el-göz-ağız koordinasyonu).",
          "Yiyeceği diliyle dışarı itmek yerine yutabiliyor (dil itme refleksi azalmış).",
        ],
      },
      {
        heading: "Hazırlık işareti OLMAYANLAR",
        bullets: [
          "Yumruğunu emmek",
          "Geceleri daha sık uyanmak",
          "Daha sık emmek istemek (genellikle büyüme atağıdır)",
          "Sizi yerken izlemek",
        ],
      },
      {
        heading: "Prematüre bebekler",
        callout: {
          tone: "info",
          text: "Erken doğan bebeklerde ek gıda zamanlaması düzeltilmiş yaşa ve bireysel gelişime göre belirlenir. Uygulama, gebelik haftasını girerseniz düzeltilmiş yaşı kullanır — yine de başlangıç zamanını mutlaka çocuk doktorunuzla planlayın.",
        },
      },
    ],
  },
  {
    id: "ilk-hafta",
    title: "İlk 2 hafta: Adım adım başlangıç planı",
    emoji: "🗓️",
    category: "baslangic",
    minutes: 4,
    summary: "Ne zaman, ne kadar, hangi sırayla? Kafa karışıklığını bitiren plan.",
    sources: ["nhs", "who2023", "aap"],
    sections: [
      {
        heading: "Gün 1–3",
        bullets: [
          "Günde 1 öğün, keyifli olduğu bir saatte (genellikle öğle).",
          "Tek malzemeli sebze püresi veya yumuşak sebze çubuğu: kabak, brokoli, tatlı patates.",
          "1–2 çay kaşığı yeterli. Yemezse sorun değil.",
        ],
      },
      {
        heading: "Gün 4–7",
        bullets: [
          "Demir kaynağı ekleyin: mercimek püresi veya etli sebze püresi.",
          "Yeni bir sebze daha: bezelye, karnabahar.",
          "İlk alerjen: iyi pişmiş yumurta (sabah saatinde).",
        ],
      },
      {
        heading: "Gün 8–14",
        bullets: [
          "Günde 2 öğüne çıkın.",
          "Yoğurt, fıstık ezmesi, tahin gibi alerjenleri 2–3 gün arayla birer birer ekleyin.",
          "Meyveleri de tanıştırın: armut, muz, avokado.",
          "Kıvamı yavaş yavaş koyulaştırın.",
        ],
      },
      {
        callout: {
          tone: "ok",
          text: "Bu dönemde bebeğinizin ne kadar yediği değil, deneyimi önemlidir. Süt (anne sütü/mama) hâlâ ana besin kaynağıdır.",
        },
      },
    ],
  },
  {
    id: "bogulma-ilk-yardim",
    title: "Öğürme mi, boğulma mı? İlk yardım",
    emoji: "🆘",
    category: "guvenlik",
    minutes: 4,
    summary: "Her ebeveynin bilmesi gereken hayati fark ve ilk yardım adımları.",
    sources: ["cdc", "nhs"],
    sections: [
      {
        heading: "Öğürme (normal, koruyucu refleks)",
        bullets: [
          "Gürültülüdür: öksürük, öğürme sesi",
          "Yüz kızarabilir, gözler sulanabilir, dil dışarı çıkar",
          "Bebek kendi kendine çözer",
          "Yapılacak: SAKİN kalın, müdahale etmeyin, parmağınızı ağzına sokmayın",
        ],
      },
      {
        heading: "Boğulma (ACİL)",
        bullets: [
          "Sessizdir ya da tiz, hırıltılı ses",
          "Ağlayamaz, öksüremez, nefes alamaz",
          "Dudaklar/yüz morarır veya solar",
          "Panik ifadesi",
        ],
      },
      {
        heading: "1 yaş altı bebekte ilk yardım",
        steps: [
          "112'yi arayın (ya da birine arattırın).",
          "Bebeği yüzüstü, başı gövdesinden aşağıda olacak şekilde ön kolunuza yatırın; çenesini elinizle destekleyin.",
          "Avuç içi topuğuyla kürek kemikleri arasına 5 kez sert vuruş yapın.",
          "Çıkmazsa bebeği sırtüstü çevirin; göğüs ortasına (meme başı hizasının hemen altı) iki parmakla 5 kez bastırın.",
          "Cisim çıkana veya ekip gelene kadar 5 sırt vuruşu + 5 göğüs basısını sürdürün.",
          "Bebek bilincini kaybederse temel yaşam desteğine (CPR) başlayın.",
        ],
      },
      {
        callout: {
          tone: "danger",
          text: "Ağza kör parmakla girip cisim aramayın — cismi daha derine itebilirsiniz. Ek gıdaya başlamadan önce bebek ilk yardım kursuna katılmanızı öneririz.",
        },
      },
    ],
  },
  {
    id: "yasak-besinler",
    title: "1 yaş altında verilmeyecekler",
    emoji: "🚫",
    category: "guvenlik",
    minutes: 3,
    summary: "Kısa ama hayati liste.",
    sources: ["cdc", "nhs", "aap", "fda"],
    sections: [
      {
        bullets: [
          "🍯 Bal (pişmiş olsa bile) — bebek botulizmi riski.",
          "🧂 Eklenmiş tuz — böbrekler kaldıramaz; < 1 g/gün.",
          "🍬 Eklenmiş şeker, şekerli içecekler, şekerlemeler.",
          "🥛 İçecek olarak inek sütü — pişirmede az miktar olur.",
          "🧃 Meyve suyu, gazlı içecek, çay, kahve, bitki çayları.",
          "🥚 Çiğ veya az pişmiş yumurta (yumuşak haşlanmış, ev yapımı mayonez).",
          "🧀 Pastörize edilmemiş süt ürünleri.",
          "🐟 Yüksek cıvalı balıklar: köpek balığı, kılıç balığı, marlin, büyük ton balığı.",
          "🦪 Çiğ deniz ürünleri.",
          "🍚 Pirinç sütü (5 yaş altı).",
          "🥓 İşlenmiş et: sucuk, salam, sosis (tuz ve nitrit).",
        ],
      },
      {
        heading: "Boğulma riski yüksek besinler",
        bullets: [
          "Bütün yemişler, fıstık (5 yaşına kadar)",
          "Bütün üzüm, çeri domates, zeytin — uzunlamasına dörde bölün",
          "Çiğ havuç, çiğ elma — rendeleyin veya pişirin",
          "Patlamış mısır, sert şeker, sakız",
          "Kaşıktan kalın fıstık ezmesi",
          "Bütün nohut, bütün bezelye (küçük bebeklerde)",
          "Sosis (yuvarlak dilim halinde özellikle tehlikeli)",
        ],
      },
    ],
  },
  {
    id: "demir",
    title: "Demir: 6. aydan sonra en kritik besin",
    emoji: "🩸",
    category: "beslenme",
    minutes: 4,
    summary: "Neden önemli, nereden alınır, emilimi nasıl artırılır?",
    sources: ["who2023", "espghan", "bliss", "saglikbak"],
    sections: [
      {
        paragraphs: [
          "Bebekler anne karnından getirdikleri demir depolarını yaklaşık 6. ayda tüketmeye başlar. Bu dönemde demir ihtiyacı, kilogram başına yaşamın hiçbir döneminde olmadığı kadar yüksektir. Demir eksikliği beyin gelişimini olumsuz etkileyebilir.",
        ],
      },
      {
        heading: "En iyi kaynaklar",
        bullets: [
          "Hem demir (en iyi emilen): kırmızı et, tavuk but, ciğer (haftada 1), balık, yumurta",
          "Bitkisel demir: kırmızı/yeşil mercimek, nohut, fasulye, tahin, yulaf, ıspanak, karabuğday",
          "Demirle zenginleştirilmiş bebek tahılları",
        ],
      },
      {
        heading: "Emilimi artıran ipuçları",
        bullets: [
          "Bitkisel demiri C vitaminiyle eşleştirin: domates, kırmızı biber, brokoli, portakal, limon.",
          "Et + bakliyat birlikte: et, bitkisel demirin emilimini de artırır.",
          "Demirli öğünle birlikte büyük miktarda süt/peynir vermeyin; kalsiyum emilimi azaltabilir.",
          "Her öğünde bir demir kaynağı hedefleyin (BLISS yaklaşımı).",
        ],
      },
      {
        callout: {
          tone: "info",
          text: "Türkiye'de 'Demir Gibi Türkiye' programıyla 4–12 ay arası bebeklere demir desteği verilir. Çocuk doktorunuzun önerdiği takviyeyi sürdürün.",
        },
      },
    ],
  },
  {
    id: "alerjen-rehberi",
    title: "Alerjen tanıştırma rehberi",
    emoji: "🥜",
    category: "beslenme",
    minutes: 5,
    summary: "Erken, tek tek ve düzenli: alerjiden korunmanın bilimsel yolu.",
    sources: ["aap", "naiad", "espghan"],
    sections: [
      {
        paragraphs: [
          "Eskiden alerjen besinlerin geciktirilmesi önerilirdi. Bugün ise LEAP gibi büyük çalışmalar sayesinde erken tanıştırmanın, özellikle yer fıstığı alerjisi riskini anlamlı ölçüde azalttığını biliyoruz.",
        ],
      },
      {
        heading: "Altın kurallar",
        steps: [
          "Bebek birkaç farklı katı gıdayı sorunsuz yedikten sonra başlayın (6. ay civarı).",
          "Bebek sağlıklıyken, günün erken saatinde ve evdeyken verin.",
          "Küçük miktarla (¼ çay kaşığı) başlayın, 10 dakika izleyin, sorun yoksa porsiyonu tamamlayın.",
          "Bir seferde yalnızca BİR yeni alerjen. Yeni alerjenler arasında 2–3 gün bırakın.",
          "Tolere edilen alerjeni menüden ÇIKARMAYIN: haftada 2–3 kez vermeye devam edin.",
        ],
      },
      {
        heading: "Reaksiyon belirtileri",
        bullets: [
          "Hafif: ağız çevresinde kızarıklık, birkaç kurdeşen → besini kesin, doktorunuza danışın.",
          "Ciddi: yaygın kurdeşen, dudak/dil şişmesi, tekrarlayan kusma, öksürük, hırıltı, nefes darlığı, solukluk, halsizlik → HEMEN 112.",
        ],
      },
      {
        callout: {
          tone: "warn",
          text: "Şiddetli egzaması veya bilinen yumurta alerjisi olan bebekler yer fıstığı alerjisi açısından yüksek risklidir. Bu bebeklerde yer fıstığını 4–6. ayda, ancak ÖNCE doktor değerlendirmesi ve gerekirse alerji testi ile tanıştırın.",
        },
      },
    ],
  },
  {
    id: "blw-puree",
    title: "BLW mi, püre mi, karma mı?",
    emoji: "⚖️",
    category: "taktik",
    minutes: 4,
    summary: "Her yöntemin artıları, eksileri ve güvenli uygulama ipuçları.",
    sources: ["bliss", "nhs"],
    sections: [
      {
        heading: "Kaşıkla (püre)",
        bullets: [
          "Artı: Ne kadar yediğini görmek kolay, demir zengini besinleri vermek pratik.",
          "Dikkat: Pütürlü dokulara 9. aydan önce geçin; tokluk işaretlerine saygı gösterin.",
        ],
      },
      {
        heading: "Bebek liderliğinde (BLW)",
        bullets: [
          "Artı: Kendi iştahını düzenler, ince motor becerileri gelişir, aile sofrasına erken katılır.",
          "Dikkat: Klasik BLW'de demir ve enerji alımı düşük kalabilir. Her öğünde bir demir kaynağı + bir enerji kaynağı sunun (BLISS).",
          "Besinler parmak boyunda ve iki parmak arasında ezilecek yumuşaklıkta olmalı.",
        ],
      },
      {
        heading: "Karma yöntem",
        bullets: [
          "Pek çok ailenin tercihi: Kaşıkla demirli püreler + yanında parmak besinler.",
          "Önceden yüklenmiş kaşık, iki dünyanın en iyisidir.",
        ],
      },
      {
        callout: {
          tone: "ok",
          text: "Doğru yöntem, ailenize uyan ve güvenlik kurallarına uyduğunuz yöntemdir. Uygulama tercihinize göre tarif önerir.",
        },
      },
    ],
  },
  {
    id: "duyarli-beslenme",
    title: "Duyarlı beslenme: Açlık ve tokluk dili",
    emoji: "💬",
    category: "taktik",
    minutes: 3,
    summary: "Bebeğiniz konuşamaz ama ne istediğini size söyler.",
    sources: ["who2023"],
    sections: [
      {
        heading: "Açlık işaretleri",
        bullets: ["Kaşığa uzanır, ağzını açar", "Yemeği görünce heyecanlanır", "Yemeği işaret eder"],
      },
      {
        heading: "Tokluk işaretleri",
        bullets: ["Başını çevirir", "Ağzını sıkıca kapatır", "Kaşığı/yemeği iter", "Yemekle oynamaya, atmaya başlar", "Mama sandalyesinden çıkmak ister"],
      },
      {
        heading: "Yapılmaması gerekenler",
        bullets: [
          "Uçak-tren oyunuyla 'kandırmak'",
          "Dikkati dağıtıp (ekran) ağza yemek koymak",
          "Bir kaşık daha, son kaşık ısrarı",
          "Yemeği ödül veya ceza olarak kullanmak",
        ],
      },
    ],
  },
  {
    id: "secici-yeme",
    title: "Yemek seçen bebek için 10 taktik",
    emoji: "🧩",
    category: "sorun",
    minutes: 4,
    summary: "Baskı yapmadan çeşitliliği artırmanın kanıtlanmış yolları.",
    sources: ["espghan"],
    sections: [
      {
        steps: [
          "Her öğünde 'güvenli' (sevdiği) bir besin + yeni bir besin koyun.",
          "Yeni besini çok küçük porsiyonda sunun; tabakta görmek bile bir maruziyettir.",
          "8–15 kez tekrar edin — farklı günlerde, farklı şekillerde (çubuk, püre, köfte).",
          "Siz de aynı yemekten yiyin ve keyifle yediğinizi gösterin.",
          "Sabit öğün saatleri belirleyin; aralarda sürekli atıştırma iştahı kapatır.",
          "Süt miktarını kontrol edin: 1 yaş sonrası fazla süt (>500 ml) iştahı azaltır.",
          "Yemek süresini 20–30 dakika ile sınırlayın, sonra sakince kaldırın.",
          "Övgüyü yemeğe değil davranışa yapın: 'Brokoliye dokundun, harika keşif!'",
          "Mutfağa davet edin: yıkama, karıştırma, sofrayı kurma.",
          "Tadına bakmaya zorlamayın — 'tatmak zorunda değilsin, tabakta durabilir.'",
        ],
      },
      {
        callout: {
          tone: "warn",
          text: "Kilo alımında duraklama, 20'den az besin kabul etme, öğürerek yiyeceği tamamen reddetme gibi durumlar beslenme bozukluğuna işaret edebilir — çocuk doktorunuza danışın.",
        },
      },
    ],
  },
  {
    id: "kabizlik",
    title: "Ek gıdayla gelen kabızlık",
    emoji: "🚽",
    category: "sorun",
    minutes: 3,
    summary: "Çok yaygın, genellikle basit önlemlerle geçer.",
    sources: ["nhs"],
    sections: [
      {
        paragraphs: ["Katı gıdaya geçişte dışkı kıvamının ve sıklığının değişmesi normaldir. Sert, ağrılı, topak topak dışkı kabızlığa işaret eder."],
      },
      {
        heading: "Yardımcı olabilecekler",
        bullets: [
          "Öğünlerle birlikte su sunun.",
          "'P' meyveleri: erik (kuru erik püresi), armut, şeftali.",
          "Lifli besinler: yulaf, mercimek, sebzeler.",
          "Muz, pirinç ve elma püresini bir süre azaltın.",
          "Bisiklet çevirme hareketi ve karın masajı.",
        ],
      },
      {
        callout: { tone: "warn", text: "Dışkıda kan, şişkin karın, kusma, kilo kaybı veya 1 haftayı aşan kabızlıkta doktora başvurun." },
      },
    ],
  },
  {
    id: "saklama",
    title: "Hazırlama, dondurma ve saklama",
    emoji: "❄️",
    category: "taktik",
    minutes: 3,
    summary: "Haftada bir saat mutfakta, haftanın geri kalanı rahat.",
    sources: ["nhs"],
    sections: [
      {
        heading: "Saklama süreleri",
        bullets: [
          "Buzdolabı: sebze/meyve püreleri 48 saat; et, tavuk, balık, yumurta içerenler 24 saat.",
          "Derin dondurucu: püreler ve köfteler 1 ay (en iyi lezzet ve besin değeri için).",
          "Pişen yemeği 1–2 saat içinde soğutup buzdolabına kaldırın.",
        ],
      },
      {
        heading: "Çözdürme ve ısıtma",
        bullets: [
          "Buzdolabında bir gece önceden çözdürün (oda sıcaklığında değil).",
          "Bir kez, buharı tütene kadar iyice ısıtın; karıştırıp ılıyınca verin.",
          "Mikrodalgada sıcak noktalar oluşur — iyice karıştırıp sıcaklığı kontrol edin.",
          "Isıtılmış yemeği tekrar ısıtmayın; çözülmüş yemeği tekrar dondurmayın.",
        ],
      },
      {
        heading: "Buz kalıbı yöntemi",
        paragraphs: ["Püreleri silikon buz kalıplarına dökün, donunca kilitli poşete aktarıp tarih yazın. Her küp yaklaşık 1–2 yemek kaşığıdır; farklı küpleri birleştirerek her gün yeni kombinasyonlar yaratın."],
      },
    ],
  },
  {
    id: "hasta-gun",
    title: "Hasta, iştahsız ve diş çıkaran günler",
    emoji: "🤒",
    category: "sorun",
    minutes: 3,
    summary: "İştah düştüğünde ne yapmalı?",
    sources: ["who2023"],
    sections: [
      {
        bullets: [
          "Hastalık sırasında sık sık emzirin/mama verin ve sıvı alımını artırın.",
          "Sevdiği, yumuşak ve kolay yutulan besinler sunun: yoğurt, çorba, püre.",
          "Zorlamayın; iştah genellikle iyileşme sonrası 'telafi' eder (WHO: hastalık sonrası birkaç hafta ek öğün önerilir).",
          "Diş çıkarırken soğuk besinler: donmuş yoğurt damlaları, soğutulmuş salatalık çubukları.",
        ],
      },
      {
        callout: { tone: "danger", text: "Az ıslak bez (6 saatten uzun kuru bez), çökük bıngıldak, uyuşukluk, yüksek ateş veya içememe durumunda hemen doktora başvurun." },
      },
    ],
  },
  {
    id: "vejetaryen",
    title: "Vejetaryen ailelerde bebek beslenmesi",
    emoji: "🌱",
    category: "beslenme",
    minutes: 3,
    summary: "Mümkün — ama planlı olmalı.",
    sources: ["who2023", "espghan"],
    sections: [
      {
        paragraphs: [
          "WHO, 6–8 ay arasında hayvansal gıdalar olmadan demir, çinko ve B12 ihtiyacının karşılanmasının çok zor olduğunu belirtiyor. Yumurta ve süt ürünleri tüketen (lakto-ovo) vejetaryen beslenme dikkatle planlanabilir; vegan beslenme ise mutlaka uzman eşliğinde ve takviyelerle yapılmalıdır.",
        ],
      },
      {
        heading: "Dikkat edilecek besinler",
        bullets: [
          "Demir: mercimek, nohut, tahin, yulaf + her öğünde C vitamini",
          "Çinko: bakliyat, tam tahıllar, yemiş ezmeleri",
          "B12: yumurta, süt ürünleri; veganlarda takviye ŞART",
          "Omega-3: öğütülmüş keten tohumu, ceviz (ezme/öğütülmüş)",
          "Protein ve enerji: tahin, fıstık ezmesi, avokado, zeytinyağı",
        ],
      },
      {
        callout: { tone: "warn", text: "Vegan beslenen bebekler için çocuk doktoru ve diyetisyen takibi şiddetle önerilir." },
      },
    ],
  },
];
