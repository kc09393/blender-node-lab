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
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
const requestedUrls = [];
function watchPage(activePage) {
  activePage.on("request", (request) => requestedUrls.push(request.url()));
  activePage.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  activePage.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
}
watchPage(page);

try {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".hero-preview-poster")?.complete && document.querySelector(".hero-preview-poster")?.naturalWidth > 0);
  if (await page.locator(".pathway-card").count() !== 4) errors.push("homepage should offer 4 task-based entry paths");
  if (await page.locator(".gallery-card").count() !== 6) errors.push("homepage gallery should show 6 focused material examples");
  if (!String(await page.locator(".gallery-thumb").first().getAttribute("src")).endsWith(".jpg")) errors.push("homepage gallery does not use static material posters");
  if (await page.locator("#hero-preview-container canvas").count()) errors.push("homepage mobile view created WebGL before user consent");
  if (requestedUrls.some((url) => url.includes("three.module.js"))) errors.push("homepage mobile view downloaded Three.js before user consent");
  if (await page.locator(".version-badge").count()) errors.push("homepage still exposes the old technical version badge");
  const statValues = await page.locator("#hero-stats b").allTextContents();
  if (statValues.join(",") !== "90,83,80") errors.push(`unexpected homepage learning stats: ${statValues.join(",")}`);
  const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (homeOverflow !== 0) errors.push(`homepage mobile horizontal overflow: ${homeOverflow}px`);
  await page.locator("#hero-enable-3d").click();
  await page.waitForSelector("#hero-preview-container.live canvas", { timeout: 30000 });
  if (!requestedUrls.some((url) => url.includes("three.module.js"))) errors.push("homepage 3D opt-in did not load Three.js");
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto(`http://127.0.0.1:${port}/dev-regression-test.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".stat.err b")?.textContent === "0", null, { timeout: 30000 });
  const summary = await page.locator("#summary").innerText();
  const regressionRows = await page.locator("#rows tr").count();
  const reportedTotal = Number(await page.locator("#summary .stat").last().locator("b").textContent());
  if (regressionRows < 187 || reportedTotal !== regressionRows) errors.push(`unexpected regression total: ${summary}`);

  await page.goto(`http://127.0.0.1:${port}/tutorials.html`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-learning-view="courses"]:not([hidden])');
  await page.waitForSelector(".path-stage[open]");
  if (await page.locator(".path-stage[open]").count() !== 1) errors.push("learning path should expand only the current stage");
  if (await page.locator(".browse-all-details").evaluate((details) => details.open)) errors.push("all tutorials should stay collapsed until requested");
  await page.locator(".browse-all-details > summary").click();
  if (await page.locator("#tutorial-cards .tutorial-card").count() !== 83) errors.push("collapsed tutorial directory did not preserve all 83 lessons");
  await page.locator(".browse-all-details > summary").click();
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

  await page.locator("#smart-practice-btn").click();
  await page.waitForSelector("#tutorial-run-view.active");
  if (!await page.locator("#tutorial-overlay .step-count").textContent()) errors.push("recommended activity did not open");
  await page.locator("#t-back-to-list").click();

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
  await page.waitForFunction(() => !document.querySelector("#learning-dialog")?.open);
  // 教學頁此時仍保留多張 WebGL 縮圖，Playwright 的 locator.click() 偶爾會在「已完成 click、
  // 正等畫面穩定」階段耗盡 30 秒；直接觸發同一個 DOM click，再明確等待語言狀態最可靠。
  await page.evaluate(() => {
    const url = new URL(location.href);
    url.searchParams.set("lang", "zh");
    history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
    localStorage.setItem("bml_lang", "zh");
    document.querySelector("#lang-toggle").click();
  });
  await page.waitForFunction(() => document.documentElement.lang === "en");
  if (await page.locator("html").getAttribute("lang") !== "en") errors.push("English language switch did not update document language");
  if (!/All Topics/.test(await page.locator("#challenge-topic option").first().textContent())) errors.push("topic filter did not translate to English");

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow !== 0) errors.push(`mobile horizontal overflow: ${overflow}px`);

  // 教學中心同時保留多張 WebGL 縮圖；關掉該頁、用乾淨頁面測沙盒，避免 GPU 工作
  // 讓下一次導覽的 lifecycle 事件在負載較高的機器上偶發逾時。
  await page.close();
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  watchPage(page);
  await page.goto(`http://127.0.0.1:${port}/sandbox.html`, { waitUntil: "commit" });
  await page.waitForFunction(() => Boolean(window.__bmlSandbox?.editor), null, { timeout: 60000 });
  if (await page.locator("#btn-export").isVisible()) errors.push("secondary file tools should not clutter the default sandbox toolbar");
  await page.locator(".toolbar-more > summary").click();
  if (!await page.locator("#btn-export").isVisible()) errors.push("more-tools menu did not reveal JSON tools");
  await page.locator(".toolbar-more > summary").click();
  await page.keyboard.press("Shift+A");
  if (!await page.locator(".node-add-popover").isVisible()) errors.push("Shift+A did not open a cursor-local add menu like Blender");
  if (!await page.locator(".node-add-popover input").evaluate((input) => document.activeElement === input)) errors.push("Shift+A add menu did not focus search");
  await page.locator(".node-add-popover input").fill("Noise Texture");
  if (await page.locator(".node-add-popover .palette-item:not(.unsupported)").count() < 1) errors.push("Shift+A add menu search returned no nodes");
  await page.keyboard.press("Escape");
  if (await page.locator(".node-add-popover").isVisible()) errors.push("Escape did not close the add-node menu");

  const nodeCountBeforeAdd = await page.locator(".node-card").count();
  await page.keyboard.press("Shift+A");
  await page.locator(".node-add-popover input").fill("Noise Texture");
  await page.keyboard.press("Enter");
  if (!await page.evaluate(() => Boolean(window.__bmlSandbox.editor.placingTypeId))) errors.push("choosing a Shift+A result did not enter Blender-style placement mode");
  const addCanvasBox = await page.locator("#graph-canvas").boundingBox();
  await page.mouse.click(addCanvasBox.x + addCanvasBox.width * 0.48, addCanvasBox.y + addCanvasBox.height * 0.78);
  if (await page.locator(".node-card").count() !== nodeCountBeforeAdd + 1) errors.push("Shift+A placement did not add the chosen node on click");
  await page.keyboard.press("Control+z");

  const nodeCountBeforeDelete = await page.locator(".node-card").count();
  const editableNodeId = await page.evaluate(() => [...window.__bmlSandbox.editor.graph.nodes.values()].find((node) => node.typeId !== "output_material")?.id);
  await page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`).click();

  // G：跟 Blender 一樣進入 modal move，滑鼠移動後左鍵確認；Ctrl+Z 應只撤銷這次移動。
  const moveHeader = page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`);
  const moveBox = await moveHeader.boundingBox();
  const positionBeforeG = await page.evaluate((id) => ({ ...window.__bmlSandbox.editor.graph.nodes.get(id) }), editableNodeId);
  await page.mouse.move(moveBox.x + moveBox.width / 2, moveBox.y + moveBox.height / 2);
  await page.keyboard.press("g");
  await page.mouse.move(moveBox.x + moveBox.width / 2 + 100, moveBox.y + moveBox.height / 2 + 45);
  await page.mouse.click(moveBox.x + moveBox.width / 2 + 100, moveBox.y + moveBox.height / 2 + 45);
  const positionAfterG = await page.evaluate((id) => ({ ...window.__bmlSandbox.editor.graph.nodes.get(id) }), editableNodeId);
  if (Math.abs(positionAfterG.x - positionBeforeG.x) < 50 || Math.abs(positionAfterG.y - positionBeforeG.y) < 20) errors.push("G did not move selected nodes with Blender-style modal transform");
  await page.keyboard.press("Control+z");
  const positionAfterMoveUndo = await page.evaluate((id) => ({ ...window.__bmlSandbox.editor.graph.nodes.get(id) }), editableNodeId);
  if (positionAfterMoveUndo.x !== positionBeforeG.x || positionAfterMoveUndo.y !== positionBeforeG.y) errors.push("undo did not restore a G move in one step");

  // Shift+D：先複製到原位，再跟著游標移動並用左鍵確認。
  await page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`).click();
  const duplicateBox = await page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`).boundingBox();
  await page.mouse.move(duplicateBox.x + duplicateBox.width / 2, duplicateBox.y + duplicateBox.height / 2);
  await page.keyboard.press("Shift+d");
  await page.mouse.move(duplicateBox.x + duplicateBox.width / 2 + 90, duplicateBox.y + duplicateBox.height / 2 + 35);
  await page.mouse.click(duplicateBox.x + duplicateBox.width / 2 + 90, duplicateBox.y + duplicateBox.height / 2 + 35);
  if (await page.locator(".node-card").count() !== nodeCountBeforeDelete + 1) errors.push("Shift+D did not duplicate the selected node");
  await page.keyboard.press("Control+z");
  if (await page.locator(".node-card").count() !== nodeCountBeforeDelete) errors.push("undo did not remove a Shift+D duplicate in one step");

  // L / Shift+L：分別沿輸入與輸出方向擴張選取。
  const outputNodeId = await page.evaluate(() => [...window.__bmlSandbox.editor.graph.nodes.values()].find((node) => node.typeId === "output_material")?.id);
  await page.keyboard.press("Alt+a");
  await page.locator(`.node-card[data-node-id="${outputNodeId}"] .node-header`).click();
  await page.keyboard.press("l");
  if (await page.locator(".node-card.selected").count() !== 2) errors.push("L did not select upstream linked nodes");
  await page.keyboard.press("Alt+a");
  await page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`).click();
  await page.keyboard.press("Shift+l");
  if (await page.locator(".node-card.selected").count() !== 2) errors.push("Shift+L did not select downstream linked nodes");

  // B 框選與 Ctrl+I 反轉選取。
  await page.keyboard.press("Alt+a");
  const boxNode = await page.locator(`.node-card[data-node-id="${editableNodeId}"]`).boundingBox();
  await page.keyboard.press("b");
  await page.mouse.move(boxNode.x - 8, boxNode.y - 8);
  await page.mouse.down();
  await page.mouse.move(boxNode.x + boxNode.width + 8, boxNode.y + boxNode.height + 8, { steps: 5 });
  await page.mouse.up();
  if (await page.locator(".node-card.selected").count() !== 1) errors.push("B did not box-select nodes like Blender");
  await page.keyboard.press("Control+i");
  if (!await page.locator(`.node-card[data-node-id="${outputNodeId}"]`).evaluate((node) => node.classList.contains("selected"))) errors.push("Ctrl+I did not invert node selection");

  await page.keyboard.press("Alt+a");
  await page.locator(`.node-card[data-node-id="${editableNodeId}"] .node-header`).click();
  await page.keyboard.press("x");
  if (await page.locator(".node-card").count() !== nodeCountBeforeDelete - 1) errors.push("X did not delete the selected node like Blender");
  await page.keyboard.press("Control+z");
  if (await page.locator(".node-card").count() !== nodeCountBeforeDelete) errors.push("undo did not restore the node deleted with X");
  const cutGesture = await page.evaluate(() => {
    const editor = window.__bmlSandbox.editor;
    const link = [...editor.graph.links.values()][0];
    const from = document.querySelector(`.socket[data-node-id="${link.fromNode}"][data-socket-key="${link.fromSocket}"][data-dir="out"]`).getBoundingClientRect();
    const to = document.querySelector(`.socket[data-node-id="${link.toNode}"][data-socket-key="${link.toSocket}"][data-dir="in"]`).getBoundingClientRect();
    const x = ((from.left + from.right) / 2 + (to.left + to.right) / 2) / 2;
    const y = ((from.top + from.bottom) / 2 + (to.top + to.bottom) / 2) / 2;
    return { x, y, linkCount: editor.graph.links.size };
  });
  await page.keyboard.down("Control");
  await page.mouse.move(cutGesture.x, cutGesture.y - 70);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(cutGesture.x, cutGesture.y + 70, { steps: 8 });
  await page.mouse.up({ button: "right" });
  await page.keyboard.up("Control");
  const linkCountAfterCut = await page.evaluate(() => window.__bmlSandbox.editor.graph.links.size);
  if (linkCountAfterCut !== cutGesture.linkCount - 1) errors.push("Ctrl+right-drag did not cut a link like Blender");
  await page.keyboard.press("Control+z");

  // 從 noodle 拖到空白處，應出現只含相容節點的搜尋；選取後自動新增並接線。
  const noodleDrop = await page.evaluate(() => {
    const editor = window.__bmlSandbox.editor;
    const principled = [...editor.graph.nodes.values()].find((node) => node.typeId === "shader_principled_bsdf");
    const socket = document.querySelector(`.socket[data-node-id="${principled.id}"][data-socket-key="bsdf"][data-dir="out"]`).getBoundingClientRect();
    const canvas = document.querySelector("#graph-canvas").getBoundingClientRect();
    return {
      from: { x: (socket.left + socket.right) / 2, y: (socket.top + socket.bottom) / 2 },
      to: { x: canvas.left + canvas.width * 0.48, y: canvas.top + canvas.height * 0.78 },
      nodes: editor.graph.nodes.size,
      links: editor.graph.links.size,
    };
  });
  await page.mouse.move(noodleDrop.from.x, noodleDrop.from.y);
  await page.mouse.down();
  await page.mouse.move(noodleDrop.to.x, noodleDrop.to.y, { steps: 8 });
  await page.mouse.up();
  if (!await page.locator(".node-add-popover").isVisible()) errors.push("dropping a noodle on empty space did not open compatible-node search");
  await page.locator(".node-add-popover input").fill("Mix Shader");
  await page.keyboard.press("Enter");
  const afterNoodleInsert = await page.evaluate(() => ({ nodes: window.__bmlSandbox.editor.graph.nodes.size, links: window.__bmlSandbox.editor.graph.links.size }));
  if (afterNoodleInsert.nodes !== noodleDrop.nodes + 1 || afterNoodleInsert.links !== noodleDrop.links + 1) errors.push("compatible-node search did not insert and connect a node");
  await page.keyboard.press("Control+z");

  // Ctrl+中鍵上下拖曳縮放，補齊 Blender 除滾輪之外的第二套縮放方式。
  const zoomBefore = await page.evaluate(() => window.__bmlSandbox.editor.scale);
  const canvasBox = await page.locator("#graph-canvas").boundingBox();
  await page.keyboard.down("Control");
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.7, canvasBox.y + canvasBox.height * 0.55);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.7, canvasBox.y + canvasBox.height * 0.4, { steps: 6 });
  await page.mouse.up({ button: "middle" });
  await page.keyboard.up("Control");
  const zoomAfter = await page.evaluate(() => window.__bmlSandbox.editor.scale);
  if (zoomAfter <= zoomBefore) errors.push("Ctrl+middle-drag did not zoom like Blender");

  await page.locator("#btn-ab-save").click();
  if (await page.locator("#btn-ab-compare").isDisabled()) errors.push("A/B compare did not enable after saving baseline A");
  await page.evaluate(() => {
    const { editor, recompile } = window.__bmlSandbox;
    const principled = [...editor.graph.nodes.values()].find((node) => node.typeId === "shader_principled_bsdf");
    principled.params.roughness = principled.params.roughness === 0.17 ? 0.73 : 0.17;
    editor.render();
    recompile(editor.graph);
  });
  await page.locator("#btn-ab-compare").click();
  if (!await page.locator("#ab-dialog").evaluate((dialog) => dialog.open)) errors.push("A/B comparison dialog did not open");
  if (!String(await page.locator("#ab-image-a").getAttribute("src")).startsWith("data:image/")) errors.push("A/B baseline image was not captured");
  if (await page.locator("#ab-changes .ab-change-card").count() < 1) errors.push("A/B comparison did not explain changed parameters");
  if (await page.locator(".node-card.ab-diff-changed").count() < 1) errors.push("A/B comparison did not highlight changed nodes");
  await page.locator("#ab-slider").fill("25");
  if ((await page.locator("#ab-wipe").getAttribute("style"))?.includes("25%") !== true) errors.push("A/B draggable divider did not update");
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
