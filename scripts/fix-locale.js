const fs = require("fs");
const path = require("path");

function fixLocale(lang) {
  const filePath = path.join(__dirname, "..", "locales", lang + ".json");
  let raw = fs.readFileSync(filePath, "utf8");

  // Replace all typographic quotes with simple apostrophes
  raw = raw
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, "'")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u300C\u300D\u300E\u300F]/g, "'")
    .replace(/[\uFF02]/g, "'"); // fullwidth "

  const lines = raw.split("\n").filter(l => l.trim().length > 0);
  const pairs = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "{" || trimmed === "}") continue;
    let clean = trimmed.replace(/,\s*$/, "");
    if (!clean.startsWith('"') || !clean.includes(":")) continue;

    // Parse key: find the first ": " pattern that's after a closing quote
    const match = clean.match(/^("(?:[^"\\]|\\.)*")\s*:\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    let val = match[2].trim();

    // If value is a quoted string, fix any unescaped internal quotes
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      const inner = val.slice(1, -1);
      // First unescape any already-escaped quotes, then re-escape all
      const unescaped = inner.replace(/\\"/g, '"');
      // Now escape all internal quotes
      const escaped = unescaped.replace(/"/g, '\\"');
      val = '"' + escaped + '"';
    }

    pairs.push("  " + key + ": " + val);
  }

  const json = "{\n" + pairs.join(",\n") + "\n}\n";

  try {
    const parsed = JSON.parse(json);
    const keyCount = Object.keys(parsed).length;
    fs.writeFileSync(filePath, json, "utf8");
    console.log(lang + ".json: " + keyCount + " keys, valid JSON");
  } catch (e) {
    console.error(lang + ".json: STILL INVALID - " + e.message);
    // Write a debug version
    const debugPath = filePath + ".debug";
    fs.writeFileSync(debugPath, json, "utf8");
    console.error("  Debug file written to " + debugPath);
  }
}

const langs = process.argv.slice(2);
if (langs.length === 0) {
  console.log("Usage: node fix-locale.js de zh fr pt it ja");
  process.exit(1);
}

for (const lang of langs) {
  fixLocale(lang);
}
