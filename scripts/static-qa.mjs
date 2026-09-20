import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirs = new Set([".git", "node_modules"]);

function walk(directory, extensions) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (ignoredDirs.has(entry)) continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full, extensions));
    else if (extensions.has(extname(entry).toLowerCase())) files.push(full);
  }
  return files;
}

const jsFiles = walk(root, new Set([".js", ".mjs"]));
for (const file of jsFiles) execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });

const missing = [];
const htmlFiles = walk(root, new Set([".html"]));
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|javascript:|#)/i.test(raw)) continue;
    const pathname = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (!pathname) continue;
    const target = pathname.startsWith("/") ? join(root, pathname.slice(1)) : resolve(dirname(file), pathname);
    if (!existsSync(target)) missing.push(`${file.slice(root.length + 1)} -> ${raw}`);
  }
}

if (missing.length) {
  console.error(`Missing local references (${missing.length}):\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`Static QA passed: ${jsFiles.length} scripts parsed; ${htmlFiles.length} HTML files checked.`);
