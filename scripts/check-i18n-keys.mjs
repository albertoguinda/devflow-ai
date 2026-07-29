/**
 * check-i18n-keys.mjs — falla si alguna clave de traducción no existe.
 *
 * Por qué hace falta, además de `check-parity.js`: `useTranslation` resuelve
 * `dict[key] ?? en[key] ?? key`. Ese último `?? key` significa que una clave que
 * falta NO peta ni deja hueco: pinta el identificador en crudo en la interfaz.
 * Se colaron 35 así (todo `color.*`, `password.*`, `diff.swap`, `common.yes/no`,
 * `cmdPalette.title` y las cuatro `color.palette.*`), visibles en producción.
 *
 * Cubre dos formas:
 *   1. Literales    — t("color.pass")
 *   2. Plantillas   — t(`color.palette.${x}`) → se expande con los valores del
 *      union declarado en types/, que es de donde salen esas variables.
 *
 * Uso: node scripts/check-i18n-keys.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const LOCALES = ["en", "es", "fr", "pt", "de", "it", "zh", "ja"];
const DIRS = ["app", "components", "hooks", "config", "lib"];

/**
 * Familias de claves dinámicas. Cada entrada dice qué prefijo se construye en
 * tiempo de ejecución y con qué valores, para poder comprobarlas igual que las
 * literales. Si se añade un `t(\`algo.${x}\`)` nuevo, va aquí.
 */
const DINAMICAS = [
  { prefijo: "color.palette.", valores: ["complementary", "analogous", "triadic", "shades"] },
  { prefijo: "jsonFmt.mode.", valores: ["format", "minify", "to-yaml", "to-xml", "to-csv"] },
  { prefijo: "httpStatus.category.", valores: ["1xx", "2xx", "3xx", "4xx", "5xx"] },
  { prefijo: "settings.", valores: ["light", "dark", "system"] },
  {
    prefijo: "tools.",
    valores: [
      "analysis",
      "review",
      "calculation",
      "visualization",
      "management",
      "generation",
      "formatting",
    ],
  },
];

function ficheros(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name === "node_modules" || entrada.name.startsWith(".")) continue;
      salida.push(...ficheros(ruta));
    } else if (extname(entrada.name) === ".ts" || extname(entrada.name) === ".tsx") {
      salida.push(ruta);
    }
  }
  return salida;
}

const dicts = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`locales/${l}.json`, "utf8"))]),
);
const en = dicts["en"];
const prefijosConocidos = new Set(Object.keys(en).map((k) => k.split(".")[0]));

const usadas = new Map(); // clave -> fichero donde aparece

for (const dir of DIRS) {
  for (const f of ficheros(dir)) {
    const src = readFileSync(f, "utf8");
    // Literales: t("a.b.c"). El lookbehind evita cazar el final de
    // querySelector("input") y compañía.
    for (const m of src.matchAll(/(?<![A-Za-z0-9_])t\(\s*"([a-zA-Z0-9_]+\.[a-zA-Z0-9_.-]+)"/g)) {
      const clave = m[1];
      if (prefijosConocidos.has(clave.split(".")[0]) && !usadas.has(clave)) usadas.set(clave, f);
    }
  }
}

// Familias dinámicas, expandidas
for (const { prefijo, valores } of DINAMICAS) {
  for (const v of valores) usadas.set(prefijo + v, "(clave dinámica)");
}

const faltan = [];
for (const [clave, fichero] of usadas) {
  if (!(clave in en)) faltan.push(`${clave}  (usada en ${fichero})`);
}

// Paridad entre los 8 idiomas
const desparejadas = [];
for (const l of LOCALES) {
  if (l === "en") continue;
  const sobran = Object.keys(dicts[l]).filter((k) => !(k in en));
  const ausentes = Object.keys(en).filter((k) => !(k in dicts[l]));
  if (ausentes.length || sobran.length) {
    desparejadas.push(`${l}: faltan ${ausentes.length}, sobran ${sobran.length}`);
    for (const k of ausentes.slice(0, 10)) desparejadas.push(`    falta  ${k}`);
    for (const k of sobran.slice(0, 10)) desparejadas.push(`    sobra  ${k}`);
  }
}

if (faltan.length || desparejadas.length) {
  if (faltan.length) {
    console.error(`\n${faltan.length} clave(s) usada(s) que no existen en en.json:`);
    for (const f of faltan) console.error(`  ${f}`);
    console.error("\nSin la clave, useTranslation pinta el identificador en crudo en pantalla.");
  }
  if (desparejadas.length) {
    console.error("\nLos 8 idiomas no están a la par:");
    for (const d of desparejadas) console.error(`  ${d}`);
  }
  process.exit(1);
}

console.log(
  `i18n OK — ${usadas.size} claves usadas, ${Object.keys(en).length} definidas, ${LOCALES.length} idiomas a la par.`,
);
