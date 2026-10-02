/** Türkçe karakterlerden bağımsız arama için normalleştirme */
export function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const BACK_VOWELS = "aıou";
const FRONT_VOWELS = "eiöü";

/** İsme Türkçe ünlü uyumuna göre tamlayan eki ekler: Ela → Ela'nın, Can → Can'ın, Deniz → Deniz'in */
export function genitive(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLocaleLowerCase("tr");
  const vowels = [...lower].filter((c) => BACK_VOWELS.includes(c) || FRONT_VOWELS.includes(c));
  const last = vowels[vowels.length - 1] ?? "e";
  const suffixVowel = { a: "ı", ı: "ı", o: "u", u: "u", e: "i", i: "i", ö: "ü", ü: "ü" }[last] ?? "i";
  const endsWithVowel = BACK_VOWELS.includes(lower.at(-1)!) || FRONT_VOWELS.includes(lower.at(-1)!);
  return `${trimmed}'${endsWithVowel ? "n" : ""}${suffixVowel}n`;
}
