// 在 CI 用 headless 瀏覽器跑 dev-regression-test.html，把「❌ 失敗」筆數當成 CI 是否通過的依據。
import { chromium } from "playwright";

const url = process.env.TEST_URL || "http://localhost:5173/dev-regression-test.html";

const browser = await chromium.launch();
const page = await browser.newPage();

let fatalError = null;
page.on("pageerror", (err) => {
  fatalError ??= err;
});

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("#summary .stat.err b", { timeout: 30000 });
} catch (err) {
  console.error(`頁面載入或初始化失敗：${err.message}`);
  await browser.close();
  process.exit(1);
}

if (fatalError) {
  console.error(`頁面拋出未捕捉例外：${fatalError.message}`);
  await browser.close();
  process.exit(1);
}

const okCount = await page.$eval("#summary .stat.ok b", (el) => Number(el.textContent));
const warnCount = await page.$eval("#summary .stat.warn b", (el) => Number(el.textContent));
const errCount = await page.$eval("#summary .stat.err b", (el) => Number(el.textContent));
const totalCount = await page.$eval("#summary .stat:last-child b", (el) => Number(el.textContent));

console.log(`回歸測試結果：${okCount} 通過 / ${warnCount} 參考警告 / ${errCount} 真正失敗（共 ${totalCount} 項）`);

if (errCount > 0) {
  const failures = await page.$$eval("tr.status-err", (rows) => rows.map((r) => r.innerText.replace(/\s+/g, " ").trim()));
  console.error("\n失敗項目：\n" + failures.join("\n"));
  await browser.close();
  process.exit(1);
}

await browser.close();
console.log("全數通過。");
