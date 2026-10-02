// dist-artifact çıktısını tek bir, kendi kendine yeten HTML gövdesine dönüştürür (Claude Artifact sayfa sözleşmesi:
// doctype/html/head/body yok; başlık, stil ve betik satır içi).
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("dist-artifact/assets");
const files = readdirSync(dir);
const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(path.join(dir, f), "utf8")).join("\n");
const jsFiles = files.filter((f) => f.endsWith(".js"));
if (jsFiles.length !== 1) throw new Error(`Tek bir JS paketi bekleniyordu, bulunan: ${jsFiles.join(", ")}`);
const js = readFileSync(path.join(dir, jsFiles[0]), "utf8");

const page = `<title>Minik Tabak</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">
<style>${css.replace(/<\/style/gi, "<\\/style")}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, "<\\/script")}</script>
`;

mkdirSync("artifact", { recursive: true });
writeFileSync("artifact/minik-tabak.html", page);
console.log(`artifact/minik-tabak.html → ${(page.length / 1024).toFixed(0)} KB`);
