#!/usr/bin/env node
/**
 * Static checks that do not need a YAML parser.
 *
 * Scope, stated so nobody over-reads it: this verifies the manifest is
 * self-consistent, that every file it points at exists, and that the patch still
 * expresses the three decisions this bundle exists for. Real YAML syntax is
 * parsed in CI; a structural check here runs anywhere, including a bare clone.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fail = [];
const ok = [];

function check(name, condition, detail = "") {
  (condition ? ok : fail).push(detail ? `${name}: ${detail}` : name);
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

check("name is dsh-web-tune", pkg.name === "dsh-web-tune", pkg.name);
check("type is module", pkg.type === "module", String(pkg.type));
check("main is declared", typeof pkg.main === "string" && pkg.main.length > 0);
check("exports['.'] is declared", Boolean(pkg.exports && pkg.exports["."]));
check("engines.dsh is declared", Boolean(pkg.engines && pkg.engines.dsh), String(pkg.engines?.dsh));
check("bundle patch is declared", Boolean(pkg.dsh?.bundle?.patch), String(pkg.dsh?.bundle?.patch));
check("bundle patch path is relative", String(pkg.dsh?.bundle?.patch).startsWith("./"), String(pkg.dsh?.bundle?.patch));
check("license is MIT", pkg.license === "MIT", String(pkg.license));

for (const f of ["index.js", "cordis.patch.yml", "README.md", "LICENSE"]) {
  check(`file exists: ${f}`, existsSync(join(root, f)));
}

for (const f of pkg.files ?? []) {
  check(`files[] entry exists: ${f}`, existsSync(join(root, f)));
}

const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
const required = [
  ["own row", "id: web-tune"],
  ["free-search row", "id: web-search-free"],
  ["web seam row", "id: web"],
];
for (const [label, needle] of required) {
  check(`patch targets ${label}`, patch.includes(needle), needle);
}

const policy = [
  ["auto engine pool", "provider: auto"],
  ["fetch takeover disabled", "fetchProviderTakeover: false"],
  ["search provider is the shipped default", "searchProvider: deepseek-official"],
  ["fetch provider is http", "fetchProvider: http"],
];
for (const [label, needle] of policy) {
  check(`patch keeps ${label}`, patch.includes(needle), needle);
}

for (const line of ok) console.log(`ok    ${line}`);
for (const line of fail) console.error(`FAIL  ${line}`);
console.log(`\n${ok.length} passed, ${fail.length} failed`);
process.exit(fail.length === 0 ? 0 : 1);
