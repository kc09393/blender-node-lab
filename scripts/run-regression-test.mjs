// Headlessly runs dev-regression-test.html (structure + compileGraph() checks for every
// preset/tutorial) and exits non-zero if anything actually fails. Used by CI
// (.github/workflows/regression-test.yml) and can be run locally with `npm test`.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const PORT = 8931;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const filePath = path.join(repoRoot, urlPath === "/" ? "/dev-regression-test.html" : urlPath);
      if (!filePath.startsWith(repoRoot)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const server = await startServer();
// channel: "chromium" forces the regular Chromium binary that `playwright install chromium`
// downloads, instead of Playwright's separate (and separately-downloaded) headless-shell variant.
const browser = await chromium.launch({ channel: "chromium" });
let exitCode = 0;
try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  await page.goto(`http://localhost:${PORT}/dev-regression-test.html`, { waitUntil: "load" });
  await page.waitForSelector("#summary .stat", { timeout: 20000 });
  // 頁面載入後才開始跑非同步的逐項編譯檢查，等一段時間讓它跑完，而不是抓到剛掛上去的 0/0/0/0。
  await page.waitForFunction(
    () => document.querySelector("#summary .stat b")?.textContent.trim() !== "",
    { timeout: 20000 }
  );
  await page.waitForTimeout(500);

  const okCount = Number(await page.textContent(".stat.ok b"));
  const warnCount = Number(await page.textContent(".stat.warn b"));
  const errCount = Number(await page.textContent(".stat.err b"));
  const total = Number(await page.textContent(".stat:last-child b"));

  console.log(`regression test: ${okCount} ok / ${warnCount} warn / ${errCount} error / ${total} total`);

  if (consoleErrors.length) {
    console.error("Uncaught page errors while running the regression test:");
    for (const msg of consoleErrors) console.error(" -", msg);
    exitCode = 1;
  }

  // 目前基準線是 0 warn / 0 error（見 dev-regression-test.html 內對 warn/err 的判定邏輯）；
  // warn 雖然沒有讓 compileGraph() 直接拋例外，但代表資料本身有結構性問題（例如引用了不存在的
  // typeId 而被 Graph.fromJSON() 悄悄丟棄），CI 上直接當失敗處理，不要讓它悄悄合併進去。
  if (errCount > 0 || warnCount > 0) {
    const failingRows = await page.$$eval("#rows tr.status-err, #rows tr.status-warn", (rows) =>
      rows.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim()).join(" | "))
    );
    console.error(`${errCount + warnCount} item(s) need attention:`);
    for (const row of failingRows) console.error(" -", row);
    exitCode = 1;
  }

  if (total === 0) {
    console.error("Regression test reported 0 total items — the test harness itself likely broke.");
    exitCode = 1;
  }
} catch (err) {
  console.error("Regression test runner crashed:", err);
  exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
process.exit(exitCode);
