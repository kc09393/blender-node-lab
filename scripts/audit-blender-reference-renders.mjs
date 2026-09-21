import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const root = new URL("../tests/fixtures/blender-5.2.2-render-reference/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
const errors = [];
if (manifest.blenderVersion !== "5.2.2 LTS") errors.push(`Unexpected Blender version: ${manifest.blenderVersion}`);
if (manifest.blenderBuildHash !== "d13f752e3b9c") errors.push(`Unexpected Blender build: ${manifest.blenderBuildHash}`);
if (manifest.engine !== "BLENDER_EEVEE") errors.push(`Unexpected engine: ${manifest.engine}`);
if (manifest.cases?.length !== 12) errors.push(`Expected 12 render cases, got ${manifest.cases?.length}`);

const byId = new Map(manifest.cases?.map((item) => [item.id, item]) || []);
const imageDataUrls = new Map();
for (const item of manifest.cases || []) {
  const bytes = await readFile(new URL(item.file, root));
  imageDataUrls.set(item.id, `data:image/png;base64,${bytes.toString("base64")}`);
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== item.sha256) errors.push(`${item.file}: SHA-256 mismatch`);
  if (bytes.length < 1000) errors.push(`${item.file}: render is unexpectedly small`);
  if (!Array.isArray(item.meanRgb) || item.meanRgb.some((value) => !Number.isFinite(value))) errors.push(`${item.file}: invalid pixel statistics`);
}

// SHA 不同不代表畫面真的不同（metadata 也會改 hash）。把 PNG 解碼成像素後重新計算統計，
// 並逐 pixel 比較 A/B；這正是本站對外宣稱「效果確實獨立生效」時使用的驗證方式。
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const analyze = async (dataUrl) => page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const sums = [0, 0, 0];
    let min = 255;
    let max = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      for (let channel = 0; channel < 3; channel += 1) {
        const value = pixels[offset + channel];
        sums[channel] += value;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    const pixelCount = canvas.width * canvas.height;
    return {
      width: canvas.width,
      height: canvas.height,
      meanRgb: sums.map((sum) => sum / pixelCount / 255),
      minRgb: min / 255,
      maxRgb: max / 255,
      pixels: Array.from(pixels),
    };
  }, dataUrl);

  const decoded = new Map();
  for (const item of manifest.cases || []) {
    const stats = await analyze(imageDataUrls.get(item.id));
    decoded.set(item.id, stats);
    if (stats.width !== manifest.resolution[0] || stats.height !== manifest.resolution[1]) {
      errors.push(`${item.file}: expected ${manifest.resolution.join("x")}, got ${stats.width}x${stats.height}`);
    }
    const recorded = [...item.meanRgb, item.minRgb, item.maxRgb];
    const measured = [...stats.meanRgb, stats.minRgb, stats.maxRgb];
    if (recorded.some((value, index) => Math.abs(value - measured[index]) > 0.002)) {
      errors.push(`${item.file}: manifest pixel statistics do not match decoded PNG`);
    }
  }

  for (const [leftId, rightId] of manifest.differencePairs || []) {
    const left = byId.get(leftId);
    const right = byId.get(rightId);
    if (!left || !right) {
      errors.push(`Missing A/B render pair ${leftId} / ${rightId}`);
      continue;
    }
    const leftPixels = decoded.get(leftId)?.pixels;
    const rightPixels = decoded.get(rightId)?.pixels;
    if (!leftPixels || !rightPixels || leftPixels.length !== rightPixels.length) {
      errors.push(`Cannot compare A/B render pair ${leftId} / ${rightId}`);
      continue;
    }
    let changedPixels = 0;
    let absoluteDifference = 0;
    for (let offset = 0; offset < leftPixels.length; offset += 4) {
      let changed = false;
      for (let channel = 0; channel < 3; channel += 1) {
        const delta = Math.abs(leftPixels[offset + channel] - rightPixels[offset + channel]);
        absoluteDifference += delta;
        if (delta > 1) changed = true;
      }
      if (changed) changedPixels += 1;
    }
    const meanAbsoluteDifference = absoluteDifference / (leftPixels.length / 4) / 3;
    if (changedPixels === 0 || meanAbsoluteDifference < 0.1) {
      errors.push(`A/B render pair has no meaningful RGB difference: ${leftId} / ${rightId}`);
    }
  }
} catch (error) {
  errors.push(`Pixel audit could not run: ${error.message}`);
} finally {
  await browser?.close();
}

if (errors.length) {
  console.error(`Blender render reference audit failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Blender render reference audit passed: ${manifest.cases.length} Blender ${manifest.blenderVersion} renders and ${manifest.differencePairs.length} A/B pairs.`);
