import { initLangToggle } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { Preview3D } from "./ui/preview3d.js";
import { NodeEditor } from "./ui/nodeEditor.js";
import { renderPalette } from "./ui/palette.js";
import { renderInspector } from "./ui/inspector.js";
import { compileGraph, applyFragmentChunk, createPreviewMaterial, CompileError } from "./core/compiler.js";
import { Graph } from "./core/graphModel.js";
import { getNodeType } from "./core/nodeRegistry.js";
import presets from "../data/presets/index.js";
import presetCategories from "../data/presets/categories.js";
import { tBi, t } from "./i18n.js";
import { mountControlsHint } from "./ui/controlsHint.js";
import { initMobilePanelTabs } from "./ui/mobilePanels.js";
import { initMobileNav } from "./ui/mobileNav.js";
import { initMobilePreviewDock } from "./ui/mobilePreviewDock.js";
import { encodeGraphToShareParam, decodeShareParam } from "./core/shareLink.js";
import { downloadBlenderPython } from "./core/blenderPythonExport.js";

initLangToggle();
initMobileNav();
initGlobalSearch();

const previewContainer = document.getElementById("preview-container");
const preview = new Preview3D(previewContainer);
preview.setMaterial(createPreviewMaterial());
initMobilePreviewDock(
  document.querySelector(".sandbox-body"),
  previewContainer,
  document.getElementById("mini-preview-slot")
);

document.getElementById("mesh-select").addEventListener("change", (e) => {
  preview.setMesh(e.target.value);
});

const canvasEl = document.getElementById("graph-canvas");
const inspectorBody = document.getElementById("inspector-body");
const errorBox = document.getElementById("shader-error");
let abHighlightedNodeIds = new Set();
mountControlsHint(canvasEl.parentElement);

function showError(message) {
  if (!message) {
    errorBox.hidden = true;
    errorBox.textContent = "";
    return;
  }
  errorBox.hidden = false;
  errorBox.textContent = message;
}

const AUTOSAVE_KEY = "bml_sandbox_graph_v1";

function recompile(graph) {
  try {
    const result = compileGraph(graph);
    applyFragmentChunk(preview.getMaterial(), graph, result);
    showError(null);
  } catch (err) {
    if (err instanceof CompileError) {
      showError(err.message);
    } else {
      showError(`未預期的編譯錯誤: ${err.message}`);
      console.error(err);
    }
  }
}

function autosave(graph) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(graph.toJSON()));
  } catch {
    // localStorage 滿了或被封鎖時直接放棄自動保存，不影響編輯功能。
  }
}

const btnUndo = document.getElementById("btn-undo");
const btnRedo = document.getElementById("btn-redo");
function refreshUndoRedoButtons() {
  btnUndo.disabled = !editor.canUndo;
  btnRedo.disabled = !editor.canRedo;
}

const editor = new NodeEditor(canvasEl, {
  onChange: (graph) => {
    clearAbHighlights();
    recompile(graph);
    autosave(graph);
    refreshUndoRedoButtons();
  },
  onSelect: (nodeId) => renderInspector(inspectorBody, editor.graph, nodeId),
});

btnUndo.addEventListener("click", () => editor.undo());
btnRedo.addEventListener("click", () => editor.redo());
refreshUndoRedoButtons();

// 觸控裝置沒有實體鍵盤，Delete/Shift+D/Home 這三個鍵盤快捷鍵完全按不到——這三顆按鈕是
// 對應的滑鼠/觸控可點擊版本，桌面使用者一樣可以用（等於也是滑鼠使用者的額外方便），
// 內部方法本身在「沒有東西可以刪/複製/縮放」時都已經是安全的無動作，不用額外判斷。
document.getElementById("btn-delete").addEventListener("click", () => editor.removeSelected());
document.getElementById("btn-duplicate").addEventListener("click", () => editor.duplicateSelected());
document.getElementById("btn-frame-all").addEventListener("click", () => editor.frameAll());

initMobilePanelTabs(document.querySelector(".sandbox-body"));

// 起始範例圖：Principled BSDF -> Material Output，跟 Blender 新材質的預設狀態一致。
function loadStarterGraph() {
  const graph = new Graph();
  const output = graph.addNode("output_material", 520, 160);
  const principled = graph.addNode("shader_principled_bsdf", 200, 100);
  graph.addLink(principled.id, "bsdf", output.id, "surface");
  editor.loadGraph(graph);
}

// 頁面載入時優先還原上次自動保存的節點圖，沒有的話才用起始範例圖。
function loadInitialGraph() {
  let saved = null;
  try {
    saved = localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    // localStorage 本身被封鎖（例如舊版 Safari 私密瀏覽）時，getItem 會直接拋出例外
    // 而不是回傳 null；沒有這層防呆會讓整個沙盒頁面連起始畫面都出不來。
  }
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.nodes && data.nodes.length) {
        editor.loadGraph(Graph.fromJSON(data));
        return;
      }
    } catch {
      // 存檔壞掉就當作沒有，改用起始範例圖。
    }
  }
  loadStarterGraph();
}
loadInitialGraph();
// 開頁時還原自動保存/起始範例圖本身不算使用者的操作，不該讓復原鍵一開始就能按
// （按了會退回完全空白的畫布，第一次遇到會很困惑），所以載入完就清空復原歷史。
editor.clearHistory();
refreshUndoRedoButtons();

// 從節點百科點「在沙盒中試試看」跳轉過來時，把該節點加進目前的圖裡。
// addNode 這個網址參數是不可信任的外部輸入（使用者可能手動改網址、或連結指向
// 之後版本已改名/移除的節點類型），加入前先確認節點類型真的存在，
// 不然 graph.addNode 會直接拋出例外，讓這支 module script 後面所有初始化都不會執行。
const addNodeParam = new URLSearchParams(location.search).get("addNode");
if (addNodeParam && getNodeType(addNodeParam)) {
  addNodeNearCenter(addNodeParam);
}

// ---------- 節點面板（搜尋 + 拖放 / 點擊新增） ----------
const paletteList = document.getElementById("palette-list");
const paletteSearch = document.getElementById("palette-search");

function addNodeNearCenter(typeId) {
  const rect = canvasEl.getBoundingClientRect();
  const { x, y } = editor.screenToGraph(rect.left + rect.width / 2, rect.top + rect.height / 2);
  editor.addNode(typeId, x - 90, y - 40);
}

function refreshPalette() {
  // 點選節點面板的項目：節點會跟著游標移動，再點一次畫布才放置（比照 Blender 的 Shift+A 流程）。
  renderPalette(paletteList, paletteSearch.value, (typeId) => editor.startPlacingNode(typeId));
}
refreshPalette();
paletteSearch.addEventListener("input", refreshPalette);
document.addEventListener("langchange", refreshPalette);
// 切換語言只會重繪節點面板清單/工具列（靠 data-i18n 或各自的 langchange 監聽），已經放進畫布的
// 節點卡片本身（標籤/插槽名稱/下拉選單文字）是 createNodeElement() 在新增/編輯當下就把字串定案
// 進 DOM，不會自動跟著切換語言——沒有這行的話,使用者切語言時只有還沒放進畫布的節點看得到新語言,
// 已經擺在畫布上的舊節點會維持切換前的語言,兩者不一致。render() 是純重畫、不會動到 undo 歷史。
document.addEventListener("langchange", () => editor.render());

canvasEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});
canvasEl.addEventListener("drop", (e) => {
  e.preventDefault();
  const typeId = e.dataTransfer.getData("text/plain");
  if (!typeId) return;
  const { x, y } = editor.screenToGraph(e.clientX, e.clientY);
  editor.addNode(typeId, x - 90, y - 20);
});

// ---------- 工具列：預設材質 ----------
const presetSelect = document.getElementById("preset-select");
const presetDescriptionBox = document.getElementById("preset-description");
// 記錄「目前載入的是哪個預設材質」，讓下拉選單持續顯示材質名稱（而不是每次選完就跳回
// 「載入預設材質…」佔位字），並用來在切換語言時重新翻譯說明文字、在語言/清單重繪後還原選取狀態。
let currentPreset = null;

function showPresetDescription(preset) {
  currentPreset = preset;
  if (!preset || !preset.description) {
    presetDescriptionBox.hidden = true;
    presetDescriptionBox.textContent = "";
    return;
  }
  presetDescriptionBox.hidden = false;
  presetDescriptionBox.textContent = tBi(preset.description);
}

function refreshPresetOptions() {
  const placeholder = presetSelect.querySelector('option[value=""]');
  presetSelect.innerHTML = "";
  if (placeholder) presetSelect.appendChild(placeholder);

  // 依 data/presets/categories.js 的分組建立 <optgroup>，材質數量一多放進一個扁平長選單
  // 難以掃視；分類清單本身跟材質資料是分開維護的（見該檔案開頭註解），這裡防呆處理
  //「材質存在但沒被分進任何類別」的情況（例如漏改分類清單），全部歸進最後的「其他」，
  // 保證不會有材質從下拉選單裡悄悄消失。
  const usedIds = new Set();
  for (const cat of presetCategories) {
    const items = cat.presetIds.map((id) => presets.find((p) => p.id === id)).filter(Boolean);
    if (items.length === 0) continue;
    const group = document.createElement("optgroup");
    group.label = tBi(cat.label);
    for (const preset of items) {
      usedIds.add(preset.id);
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = tBi(preset.name);
      group.appendChild(opt);
    }
    presetSelect.appendChild(group);
  }
  const leftover = presets.filter((p) => !usedIds.has(p.id));
  if (leftover.length > 0) {
    const group = document.createElement("optgroup");
    group.label = tBi({ zh: "其他", en: "Other" });
    for (const preset of leftover) {
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = tBi(preset.name);
      group.appendChild(opt);
    }
    presetSelect.appendChild(group);
  }

  if (currentPreset) presetSelect.value = currentPreset.id;
}
refreshPresetOptions();
document.addEventListener("langchange", () => {
  refreshPresetOptions();
  if (currentPreset) showPresetDescription(currentPreset);
});

presetSelect.addEventListener("change", () => {
  const preset = presets.find((p) => p.id === presetSelect.value);
  if (!preset) return;
  editor.loadGraph(Graph.fromJSON(preset.graph));
  showPresetDescription(preset);
  const url = new URL(location.href);
  url.searchParams.delete("g");
  url.searchParams.delete("addNode");
  url.searchParams.set("preset", preset.id);
  history.replaceState({ preset: preset.id }, "", `${url.pathname}${url.search}${url.hash}`);
});

// 從首頁的材質畫廊點縮圖跳轉過來時，直接載入該預設材質。網址參數是不可信任的外部輸入，
// 找不到對應 id 就當作沒帶參數，正常顯示起始畫面，不讓整支 module script 掛掉。
const presetParam = new URLSearchParams(location.search).get("preset");
if (presetParam) {
  const preset = presets.find((p) => p.id === presetParam);
  if (preset) {
    editor.loadGraph(Graph.fromJSON(preset.graph));
    editor.clearHistory();
    showPresetDescription(preset);
    // refreshPresetOptions() 已經在上面跑過一次了，這裡是唯一一次「用網址參數載入」的
    // 路徑，下拉選單不會自己知道要顯示這個材質名稱（不像使用者手動選單，瀏覽器原生 <select>
    // 會自動同步顯示值）——手動同步一次，否則選單會停在「載入預設材質…」佔位字，
    // 但畫布跟說明文字卻已經是正確的材質，兩者對不上。
    presetSelect.value = preset.id;
  }
}

// 別人分享過來的節點圖（?g=）。跟 ?preset= 同一套「不可信任外部輸入」防呆，
// 用非同步 IIFE（不是 top-level await）處理，才不會讓這支 module script 後面
// 其他初始化（節點面板、教學提示等）等這個解碼跑完才繼續執行。
const shareParam = new URLSearchParams(location.search).get("g");
if (shareParam) {
  (async () => {
    const data = await decodeShareParam(shareParam);
    if (!data) return; // 解碼失敗（壞連結/舊瀏覽器不支援）就靜靜維持原本的起始畫面，不彈錯誤訊息嚇使用者
    editor.loadGraph(Graph.fromJSON(data));
    editor.clearHistory();
    presetSelect.value = "";
    currentPreset = null;
    presetDescriptionBox.hidden = false;
    presetDescriptionBox.textContent = tBi({
      zh: "有人跟你分享了這個材質圖，可以直接修改看看！",
      en: "Someone shared this material graph with you — feel free to tweak it!",
    });
  })();
}

// ---------- 工具列：清空 / 匯出 / 匯入 ----------
document.getElementById("btn-clear").addEventListener("click", () => {
  if (confirm("清空目前的節點圖？此動作無法復原。")) {
    loadStarterGraph();
    presetSelect.value = "";
    showPresetDescription(null);
  }
});

const btnShare = document.getElementById("btn-share");
btnShare.addEventListener("click", async () => {
  const encoded = await encodeGraphToShareParam(editor.graph);
  const url = `${location.origin}${location.pathname}?g=${encoded}`;
  const showCopiedFeedback = () => {
    btnShare.textContent = tBi({ zh: "已複製 ✓", en: "Copied ✓" });
    // 用 t() 現查字典而不是快取一個字串，避免使用者在這 1.5 秒內切換語言時，
    // 復原回去的文字是切換前那個語言的舊版本（跟 controlsHint.js 同一個已知陷阱）。
    setTimeout(() => {
      btnShare.textContent = t("sandbox.share");
    }, 1500);
  };
  try {
    await navigator.clipboard.writeText(url);
    showCopiedFeedback();
  } catch {
    // Clipboard API 在非 https/不安全來源或使用者未授權時會拒絕——退回瀏覽器原生
    // prompt() 讓使用者自己手動複製，不讓分享功能整個失效。
    prompt(tBi({ zh: "複製這個連結分享給朋友：", en: "Copy this link to share:" }), url);
  }
});

document.getElementById("btn-export").addEventListener("click", () => {
  const data = JSON.stringify(editor.graph.toJSON(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "material-graph.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("btn-blender-export").addEventListener("click", () => {
  downloadBlenderPython(editor.graph, {
    materialName: currentPreset ? tBi(currentPreset.name) : "Node Lab Material",
  });
});

document.getElementById("btn-blender-library").addEventListener("click", () => {
  location.href = "downloads/blender-node-lab-material-library-5.2.2.blend";
});

let abSnapshot = null;
const abCompareButton = document.getElementById("btn-ab-compare");
const abDialog = document.getElementById("ab-dialog");
const abWipe = document.getElementById("ab-wipe");
const abSlider = document.getElementById("ab-slider");
const abChanges = document.getElementById("ab-changes");
function capturePreview() {
  try {
    return preview.renderer.domElement.toDataURL("image/jpeg", 0.9);
  } catch {
    return "";
  }
}

function cloneGraphData(graph) {
  return typeof structuredClone === "function" ? structuredClone(graph) : JSON.parse(JSON.stringify(graph));
}

function linkSignature(link) {
  return `${link.fromNode}:${link.fromSocket}>${link.toNode}:${link.toSocket}`;
}

function valueLabel(value) {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return tBi(value ? { zh: "開", en: "On" } : { zh: "關", en: "Off" });
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
  if (Array.isArray(value)) return value.map(valueLabel).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function nodeLabel(node) {
  return tBi(getNodeType(node.typeId)?.name || { zh: node.typeId, en: node.typeId });
}

function graphDifference(left, right) {
  const leftNodes = new Map(left.nodes.map((node) => [node.id, node]));
  const rightNodes = new Map(right.nodes.map((node) => [node.id, node]));
  const changedNodes = [];
  for (const node of right.nodes) {
    const previous = leftNodes.get(node.id);
    if (!previous) continue;
    const typeDef = getNodeType(node.typeId);
    const definitions = [...(typeDef?.inputs || []), ...(typeDef?.settings || [])];
    const definitionByKey = new Map(definitions.map((definition) => [definition.key, definition]));
    const params = [];
    const keys = new Set([...Object.keys(previous.params || {}), ...Object.keys(node.params || {})]);
    for (const key of keys) {
      if (JSON.stringify(previous.params?.[key]) === JSON.stringify(node.params?.[key])) continue;
      const definition = definitionByKey.get(key);
      params.push({
        key,
        label: definition?.label ? tBi(definition.label) : key,
        before: previous.params?.[key],
        after: node.params?.[key],
      });
    }
    if (params.length) changedNodes.push({ id: node.id, label: nodeLabel(node), params });
  }
  const addedNodes = right.nodes.filter((node) => !leftNodes.has(node.id));
  const removedNodes = left.nodes.filter((node) => !rightNodes.has(node.id));
  const leftLinks = new Set(left.links.map(linkSignature));
  const rightLinks = new Set(right.links.map(linkSignature));
  const addedLinks = right.links.filter((link) => !leftLinks.has(linkSignature(link)));
  const removedLinks = left.links.filter((link) => !rightLinks.has(linkSignature(link)));
  return {
    addedNodes,
    removedNodes,
    addedLinks,
    removedLinks,
    changedNodes,
    changedParams: changedNodes.reduce((sum, node) => sum + node.params.length, 0),
  };
}

function clearAbHighlights() {
  abHighlightedNodeIds.clear();
  canvasEl.querySelectorAll(".node-card.ab-diff-changed, .node-card.ab-diff-added").forEach((node) => {
    node.classList.remove("ab-diff-changed", "ab-diff-added");
  });
}

function applyAbHighlights(difference) {
  clearAbHighlights();
  const changed = new Set(difference.changedNodes.map((node) => node.id));
  const added = new Set(difference.addedNodes.map((node) => node.id));
  for (const link of difference.addedLinks) {
    if (editor.graph.nodes.has(link.fromNode)) changed.add(link.fromNode);
    if (editor.graph.nodes.has(link.toNode)) changed.add(link.toNode);
  }
  for (const id of changed) {
    const node = canvasEl.querySelector(`.node-card[data-node-id="${id}"]`);
    if (node) node.classList.add("ab-diff-changed");
    abHighlightedNodeIds.add(id);
  }
  for (const id of added) {
    const node = canvasEl.querySelector(`.node-card[data-node-id="${id}"]`);
    if (node) node.classList.add("ab-diff-added");
    abHighlightedNodeIds.add(id);
  }
}

function appendChangeCard(title, items, kind = "changed") {
  const article = document.createElement("article");
  article.className = `ab-change-card ab-change-${kind}`;
  const heading = document.createElement("h3");
  heading.textContent = title;
  article.appendChild(heading);
  if (items.length) {
    const list = document.createElement("ul");
    for (const item of items) {
      const row = document.createElement("li");
      if (item.label) {
        const label = document.createElement("strong");
        label.textContent = `${item.label}：`;
        row.append(label, document.createTextNode(`${valueLabel(item.before)} → ${valueLabel(item.after)}`));
      } else {
        row.textContent = item.text;
      }
      list.appendChild(row);
    }
    article.appendChild(list);
  }
  abChanges.appendChild(article);
}

function renderAbChanges(difference) {
  abChanges.replaceChildren();
  for (const node of difference.changedNodes) appendChangeCard(node.label, node.params, "changed");
  if (difference.addedNodes.length) {
    appendChangeCard(
      tBi({ zh: "新增節點", en: "Added nodes" }),
      difference.addedNodes.map((node) => ({ text: nodeLabel(node) })),
      "added",
    );
  }
  if (difference.removedNodes.length) {
    appendChangeCard(
      tBi({ zh: "移除節點", en: "Removed nodes" }),
      difference.removedNodes.map((node) => ({ text: nodeLabel(node) })),
      "removed",
    );
  }
  if (difference.addedLinks.length || difference.removedLinks.length) {
    appendChangeCard(tBi({ zh: "連線變更", en: "Link changes" }), [{
      text: tBi({
        zh: `新增 ${difference.addedLinks.length} 條，移除 ${difference.removedLinks.length} 條`,
        en: `${difference.addedLinks.length} added, ${difference.removedLinks.length} removed`,
      }),
    }], "links");
  }
  if (!abChanges.childElementCount) {
    const empty = document.createElement("div");
    empty.className = "ab-change-empty";
    empty.textContent = tBi({ zh: "節點與參數沒有變動，可拖曳上方分界檢查視覺差異。", en: "No node or parameter changes. Drag the divider above to inspect visual differences." });
    abChanges.appendChild(empty);
  }
}

function updateAbSplit() {
  const value = Number(abSlider.value);
  abWipe.style.setProperty("--split", `${value}%`);
  abSlider.setAttribute("aria-valuetext", tBi({ zh: `顯示 ${value}% 的 A 材質`, en: `Showing ${value}% of material A` }));
}
abSlider.addEventListener("input", updateAbSplit);

document.getElementById("btn-ab-save").addEventListener("click", () => {
  clearAbHighlights();
  // Graph.toJSON() 保留 params 內部陣列/物件的參照；必須再深複製，否則儲存 A 後
  // 編輯 B 會同步改到 A，差異檢查永遠誤判為「沒有變更」。
  abSnapshot = { graph: cloneGraphData(editor.graph.toJSON()), image: capturePreview() };
  abCompareButton.disabled = false;
  const button = document.getElementById("btn-ab-save");
  button.textContent = tBi({ zh: "A 已更新 ✓", en: "A Updated ✓" });
  setTimeout(() => { button.textContent = t("sandbox.abSave"); }, 1200);
});
abCompareButton.addEventListener("click", () => {
  if (!abSnapshot) return;
  const current = editor.graph.toJSON();
  const difference = graphDifference(abSnapshot.graph, current);
  document.getElementById("ab-dialog-title").textContent = tBi({ zh: "材質 A/B 比較", en: "Material A/B Comparison" });
  document.getElementById("ab-label-a").textContent = tBi({ zh: "A · 儲存基準", en: "A · Saved Baseline" });
  document.getElementById("ab-label-b").textContent = tBi({ zh: "B · 目前材質", en: "B · Current Material" });
  document.getElementById("ab-image-a").src = abSnapshot.image;
  document.getElementById("ab-image-b").src = capturePreview();
  document.getElementById("ab-summary").textContent = tBi({
    zh: `參數變更 ${difference.changedParams} 項 · 新增節點 ${difference.addedNodes.length} · 移除節點 ${difference.removedNodes.length} · 連線新增 ${difference.addedLinks.length}／移除 ${difference.removedLinks.length}`,
    en: `${difference.changedParams} parameter changes · ${difference.addedNodes.length} nodes added · ${difference.removedNodes.length} removed · ${difference.addedLinks.length} links added / ${difference.removedLinks.length} removed`,
  });
  abSlider.value = "50";
  updateAbSplit();
  renderAbChanges(difference);
  applyAbHighlights(difference);
  abDialog.showModal();
});
document.getElementById("ab-dialog-close").addEventListener("click", () => abDialog.close());
abDialog.addEventListener("click", (event) => { if (event.target === abDialog) abDialog.close(); });

const fileImport = document.getElementById("file-import");
document.getElementById("btn-import").addEventListener("click", () => fileImport.click());
fileImport.addEventListener("change", async () => {
  const file = fileImport.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    editor.loadGraph(Graph.fromJSON(data));
    presetSelect.value = "";
    showPresetDescription(null);
  } catch (err) {
    alert(`匯入失敗：${err.message}`);
  } finally {
    fileImport.value = "";
  }
});

// 也讓教學模式（app-tutorials.js）可以重用同一套沙盒元件。
window.__bmlSandbox = { editor, preview, recompile };
