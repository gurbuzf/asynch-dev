// Ortak alan tipleri — hem API hem istemci tarafından kullanılır.

export type AllergenId =
  | "yumurta"
  | "yerfistigi"
  | "sut"
  | "susam"
  | "bugday"
  | "balik"
  | "agacyemisi"
  | "soya"
  | "kabuklu";

export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

export type Texture = "puree" | "ezme" | "parmak" | "dograma" | "aile";

export type FeedingMethod = "kasik" | "blw" | "karma";

export type Nutrient =
  | "demir"
  | "protein"
  | "omega3"
  | "cvit"
  | "kalsiyum"
  | "lif"
  | "cinko"
  | "avit"
  | "enerji";

export type ShoppingGroup =
  | "sebze"
  | "meyve"
  | "et"
  | "sut"
  | "tahil"
  | "bakliyat"
  | "yag"
  | "baharat"
  | "diger";

export type SourceId =
  | "who2023"
  | "aap"
  | "espghan"
  | "cdc"
  | "nhs"
  | "bliss"
  | "efsa"
  | "saglikbak"
  | "naiad"
  | "fda";

export interface Source {
  id: SourceId;
  title: string;
  publisher: string;
  url: string;
}

export interface Ingredient {
  amount: string;
  name: string;
  group: ShoppingGroup;
}

export interface AgeAdaptation {
  fromMonths: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  minAgeMonths: number;
  meals: MealSlot[];
  textures: Texture[];
  methods: FeedingMethod[];
  prepMinutes: number;
  cookMinutes: number;
  yield: string;
  ingredients: Ingredient[];
  steps: string[];
  ageAdaptations: AgeAdaptation[];
  nutrients: Nutrient[];
  allergens: AllergenId[];
  storage: { fridge: string; freezer?: string };
  expertNote: string;
  tags: string[];
  /** Bu tarif belirli bir alerjeni tanıştırmak için tasarlandıysa */
  introducesAllergen?: AllergenId;
}

export type RecipeSummary = Pick<
  Recipe,
  | "id"
  | "title"
  | "emoji"
  | "summary"
  | "minAgeMonths"
  | "meals"
  | "textures"
  | "methods"
  | "prepMinutes"
  | "cookMinutes"
  | "nutrients"
  | "allergens"
  | "tags"
  | "introducesAllergen"
> & { freezable: boolean };

export type FoodCategory =
  | "sebze"
  | "meyve"
  | "protein"
  | "tahil"
  | "bakliyat"
  | "sut"
  | "yag";

export type ChokingRisk = "dusuk" | "orta" | "yuksek";

export interface Food {
  id: string;
  name: string;
  emoji: string;
  category: FoodCategory;
  minAgeMonths: number;
  allergen?: AllergenId;
  nutrients: Nutrient[];
  choking: ChokingRisk;
  serving: { "6-8": string; "9-11": string; "12+": string };
  note?: string;
}

export type TipCategory = "guvenlik" | "beslenme" | "taktik" | "gelisim" | "mit";

export interface Tip {
  id: string;
  fromMonths: number;
  toMonths: number;
  category: TipCategory;
  title: string;
  body: string;
  source?: SourceId;
}

export type CalloutTone = "info" | "warn" | "danger" | "ok";

export interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  callout?: { tone: CalloutTone; text: string };
}

export type ArticleCategory = "baslangic" | "guvenlik" | "beslenme" | "taktik" | "sorun";

export interface Article {
  id: string;
  title: string;
  emoji: string;
  category: ArticleCategory;
  minutes: number;
  summary: string;
  sections: ArticleSection[];
  sources: SourceId[];
}

export interface Myth {
  id: string;
  myth: string;
  truth: string;
  source?: SourceId;
}

export interface Stage {
  id: string;
  title: string;
  emoji: string;
  fromMonths: number;
  toMonths: number;
  headline: string;
  mealsPerDay: string;
  portion: string;
  textures: string;
  milk: string;
  water: string;
  goals: string[];
  skills: string[];
}

export interface AllergenInfo {
  id: AllergenId;
  name: string;
  emoji: string;
  order: number;
  firstServe: string;
  maintain: string;
}

/** Plan üretimi için istemciden gelen profil özeti */
export interface PlanInput {
  ageMonths: number;
  date: string; // YYYY-MM-DD
  method: FeedingMethod;
  introducedAllergens: AllergenId[];
  allergies: AllergenId[];
  triedFoods: string[];
  /** Son yeni alerjen tanıştırma tarihi (YYYY-MM-DD) */
  lastAllergenIntro?: string;
  /** Aynı gün için farklı bir menü istemek için */
  shuffle?: number;
  /** Tekrarı önlemek için yakın zamanda önerilen tarifler */
  avoidRecipes?: string[];
}

export interface PlannedMeal {
  slot: MealSlot;
  recipe: RecipeSummary;
  reason: string;
}

export interface AllergenSuggestion {
  allergen: AllergenInfo;
  recipe?: RecipeSummary;
  message: string;
}

export interface DailyPlan {
  date: string;
  ageMonths: number;
  stage: Stage;
  started: boolean;
  meals: PlannedMeal[];
  allergenSuggestion?: AllergenSuggestion;
  /** Yeni alerjen önerilmediğinde nedeni */
  allergenNote?: string;
  allergenMaintenance: AllergenInfo[];
  foodOfDay?: Food;
  tip: Tip;
  checklist: { id: string; text: string }[];
}

export interface ShoppingItem {
  name: string;
  group: ShoppingGroup;
  amounts: string[];
  recipes: string[];
}

export interface WeeklyPlan {
  days: DailyPlan[];
  shopping: ShoppingItem[];
}
