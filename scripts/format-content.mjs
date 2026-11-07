// Formatea los JSON de contenido: estructura con sangría y cada ejercicio/palabra en una sola línea.
// Uso: node scripts/format-content.mjs content/a1/unit-02.json [...]
import { readFileSync, writeFileSync } from "node:fs";

const COMPACT_ARRAYS = new Set(["exercises", "vocab", "lines"]);

function fmt(value, indent, key) {
  const pad = " ".repeat(indent);
  const inner = " ".repeat(indent + 2);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (COMPACT_ARRAYS.has(key)) return `[\n${value.map((v) => inner + JSON.stringify(v)).join(",\n")}\n${pad}]`;
    if (value.every((v) => typeof v !== "object" || v === null)) return JSON.stringify(value);
    return `[\n${value.map((v) => inner + fmt(v, indent + 2)).join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    // Un diálogo se abre para que cada línea quede en su renglón.
    if (value.type === "dialogue" && Array.isArray(value.lines)) {
      const entries = Object.entries(value).map(([k, v]) => `${inner}${JSON.stringify(k)}: ${k === "lines" ? fmt(v, indent + 2, k) : JSON.stringify(v)}`);
      return `{\n${entries.join(",\n")}\n${pad}}`;
    }
    const entries = Object.entries(value).map(([k, v]) => `${inner}${JSON.stringify(k)}: ${fmt(v, indent + 2, k)}`);
    return `{\n${entries.join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

for (const file of process.argv.slice(2)) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  writeFileSync(file, `${fmt(data, 0)}\n`);
  console.log("✓", file);
}
