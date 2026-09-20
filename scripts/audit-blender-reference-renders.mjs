import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../tests/fixtures/blender-5.2.2-render-reference/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
const errors = [];
if (manifest.blenderVersion !== "5.2.2 LTS") errors.push(`Unexpected Blender version: ${manifest.blenderVersion}`);
if (manifest.blenderBuildHash !== "d13f752e3b9c") errors.push(`Unexpected Blender build: ${manifest.blenderBuildHash}`);
if (manifest.engine !== "BLENDER_EEVEE") errors.push(`Unexpected engine: ${manifest.engine}`);
if (manifest.cases?.length !== 12) errors.push(`Expected 12 render cases, got ${manifest.cases?.length}`);

const byId = new Map(manifest.cases?.map((item) => [item.id, item]) || []);
for (const item of manifest.cases || []) {
  const bytes = await readFile(new URL(item.file, root));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== item.sha256) errors.push(`${item.file}: SHA-256 mismatch`);
  if (bytes.length < 1000) errors.push(`${item.file}: render is unexpectedly small`);
  if (!Array.isArray(item.meanRgb) || item.meanRgb.some((value) => !Number.isFinite(value))) errors.push(`${item.file}: invalid pixel statistics`);
}
for (const [leftId, rightId] of manifest.differencePairs || []) {
  const left = byId.get(leftId);
  const right = byId.get(rightId);
  if (!left || !right) errors.push(`Missing A/B render pair ${leftId} / ${rightId}`);
  else if (left.sha256 === right.sha256) errors.push(`A/B render pair is pixel-identical: ${leftId} / ${rightId}`);
}

if (errors.length) {
  console.error(`Blender render reference audit failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Blender render reference audit passed: ${manifest.cases.length} Blender ${manifest.blenderVersion} renders and ${manifest.differencePairs.length} A/B pairs.`);
