import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml; charset=utf-8" };
const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname).replace(/^\/+/, "");
  const target = normalize(join(root, relative));
  if (!target.startsWith(root) || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(target).pipe(response);
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});

try {
  await page.goto(`http://127.0.0.1:${port}/dev-regression-test.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".stat.err b")?.textContent === "0", null, { timeout: 30000 });
  const summary = await page.locator("#summary").innerText();
  const regressionRows = await page.locator("#rows tr").count();
  const reportedTotal = Number(await page.locator("#summary .stat").last().locator("b").textContent());
  if (regressionRows < 187 || reportedTotal !== regressionRows) errors.push(`unexpected regression total: ${summary}`);

  await page.goto(`http://127.0.0.1:${port}/tutorials.html`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-learning-view="courses"]:not([hidden])');
  if (!await page.locator('[data-learning-view="review"]').first().isHidden()) errors.push("review content should not clutter the default course view");
  await page.locator('[data-learning-view-target="review"]').click();
  await page.waitForSelector(".skill-row");
  if (await page.locator(".skill-row").count() !== 6) errors.push("skill map should contain 6 skills");
  await page.locator("#assessment-start-btn").click();
  if (await page.locator(".assessment-form fieldset").count() !== 30) errors.push("assessment should contain 30 diagnostic questions");
  await page.locator("#learning-dialog-close").click();
  await page.locator('[data-learning-view-target="challenges"]').click();
  if (!page.url().includes("view=challenges")) errors.push("challenge view URL is not shareable");
  await page.waitForFunction(() => document.querySelector("#challenge-cards .activity-thumb")?.src?.startsWith("data:image/"), null, { timeout: 30000 });
  if (await page.locator("#challenge-cards .activity-thumb.failed").count()) errors.push("challenge material preview failed to render");
  if (await page.locator("#challenge-topic option").count() < 3) errors.push("challenge topic filter was not populated");
  await page.locator(".activity-favorite").first().click();
  if ((await page.locator(".activity-favorite").first().getAttribute("aria-pressed")) !== "true") errors.push("favorite toggle did not update");
  await page.locator("#challenge-favorites").check();
  if (await page.locator("#challenge-cards .activity-card").count() !== 1) errors.push("favorites-only filter did not narrow the list");
  await page.locator("#challenge-favorites").uncheck();
  await page.locator("#challenge-topic").selectOption("pbr");
  if (await page.locator("#challenge-cards .activity-card").count() < 2) errors.push("topic filter returned too few PBR activities");
  await page.locator("#challenge-topic").selectOption("");
  await page.locator('[data-learning-view-target="review"]').click();

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#progress-backup-btn").click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  const backup = JSON.parse(readFileSync(backupPath, "utf8"));
  if (backup.format !== "blender-material-node-lab-learning-backup" || !backup.state) errors.push("progress export is not a valid backup");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#progress-restore-input").setInputFiles(backupPath);
  await page.waitForFunction(() => document.querySelector("#learning-dialog-title")?.textContent?.includes("匯入完成"));
  await page.locator("#learning-dialog-close").click();

  await page.locator("#smart-practice-btn").click();
  await page.waitForSelector("#tutorial-run-view.active");
  if (!await page.locator("#tutorial-overlay .step-count").textContent()) errors.push("recommended activity did not open");
  await page.locator("#t-back-to-list").click();
  await page.locator("#lang-toggle").click();
  if (await page.locator("html").getAttribute("lang") !== "en") errors.push("English language switch did not update document language");
  if (!/All Topics/.test(await page.locator("#challenge-topic option").first().textContent())) errors.push("topic filter did not translate to English");

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow !== 0) errors.push(`mobile horizontal overflow: ${overflow}px`);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`http://127.0.0.1:${port}/sandbox.html`, { waitUntil: "networkidle" });
  await page.locator("#btn-ab-save").click();
  if (await page.locator("#btn-ab-compare").isDisabled()) errors.push("A/B compare did not enable after saving baseline A");
  await page.locator("#btn-ab-compare").click();
  if (!await page.locator("#ab-dialog").evaluate((dialog) => dialog.open)) errors.push("A/B comparison dialog did not open");
  if (!String(await page.locator("#ab-image-a").getAttribute("src")).startsWith("data:image/")) errors.push("A/B baseline image was not captured");
  await page.locator("#ab-dialog-close").click();
  const python = await page.evaluate(async () => {
    const { graphToBlenderPython } = await import("./js/core/blenderPythonExport.js");
    return graphToBlenderPython(window.__bmlSandbox.editor.graph);
  });
  if (!python.includes("Blender 5.2.2 LTS") || !python.includes("ShaderNodeOutputMaterial")) errors.push("Blender Python export is incomplete");
  const libraryBytes = await page.evaluate(async () => (await fetch("./downloads/blender-node-lab-material-library-5.2.2.blend")).arrayBuffer().then((buffer) => buffer.byteLength));
  if (libraryBytes < 100000) errors.push("Blender asset library download is unexpectedly small");

  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Browser QA passed. ${summary.replace(/\s+/g, " ").trim()}; mobile overflow 0px.`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
