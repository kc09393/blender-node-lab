import { initLangToggle, tBi, getLang, t } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { Preview3D } from "./ui/preview3d.js";
import { compileGraph, applyFragmentChunk, createPreviewMaterial } from "./core/compiler.js";
import { Graph } from "./core/graphModel.js";
import { listNodeTypes } from "./core/nodeRegistry.js";
import presets from "../data/presets/index.js";
import tutorials from "../data/tutorials/index.js";

initLangToggle();
initGlobalSearch();

// ---------- 統計數字：直接算真實資料筆數，不寫死數字，內容增加時不會忘記同步 ----------
function renderStats() {
  const statsEl = document.getElementById("hero-stats");
  const nodeCount = listNodeTypes().length;
  statsEl.innerHTML = `
    <div class="stat-chip"><b>${nodeCount}</b>${t("landing.statsNodes")}</div>
    <div class="stat-chip"><b>${presets.length}</b>${t("landing.statsPresets")}</div>
    <div class="stat-chip"><b>${tutorials.length}</b>${t("landing.statsTutorials")}</div>
  `;
}

// ---------- Hero 即時預覽：挑一個視覺效果最搶眼的預設材質，慢慢自動旋轉 ----------
const HERO_PRESET_ID = "peacock_feather";
let heroPreview = null;
function initHeroPreview() {
  const container = document.getElementById("hero-preview-container");
  if (!container) return;
  heroPreview = new Preview3D(container);
  heroPreview.setMaterial(createPreviewMaterial());
  heroPreview.controls.autoRotate = true;
  heroPreview.controls.autoRotateSpeed = 2.2;
  heroPreview.controls.enableZoom = false;

  const preset = presets.find((p) => p.id === HERO_PRESET_ID) || presets[0];
  try {
    const graph = Graph.fromJSON(preset.graph);
    const result = compileGraph(graph);
    applyFragmentChunk(heroPreview.getMaterial(), graph, result);
  } catch (err) {
    console.error("首頁預覽渲染失敗:", err);
  }
  updateHeroCaption(preset);
}
function updateHeroCaption(preset) {
  const captionEl = document.getElementById("hero-preview-caption");
  if (captionEl) captionEl.textContent = tBi(preset.name);
}

// ---------- 材質縮圖畫廊：跟教學列表用同一套「隱藏畫布依序渲染」手法 ----------
const GALLERY_PRESET_IDS = [
  "peacock_feather", "holographic_foil", "molten_gold", "jade_stone",
  "dragon_scale_armor", "alien_meteorite", "aurora", "iridescent_beetle",
];

let thumbPreview = null;
function ensureThumbPreview() {
  if (thumbPreview) return thumbPreview;
  const container = document.getElementById("thumb-render-container");
  thumbPreview = new Preview3D(container);
  thumbPreview.setMaterial(createPreviewMaterial());
  thumbPreview.setMesh("sphere");
  return thumbPreview;
}

function renderPresetThumbnail(preset) {
  try {
    const preview = ensureThumbPreview();
    const graph = Graph.fromJSON(preset.graph);
    const result = compileGraph(graph);
    applyFragmentChunk(preview.getMaterial(), graph, result);
    preview._resize();
    preview.renderer.render(preview.scene, preview.camera);
    return preview.renderer.domElement.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.error(`首頁畫廊縮圖渲染失敗（${preset.id}）:`, err);
    return null;
  }
}

// 縮圖快取：語言切換時只要重繪文字標籤，圖片不用重新跑一次 WebGL render。
const thumbCache = new Map();
function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  const items = GALLERY_PRESET_IDS.map((id) => presets.find((p) => p.id === id)).filter(Boolean);
  grid.innerHTML = "";
  for (const preset of items) {
    const card = document.createElement("a");
    card.className = "gallery-card";
    card.href = `sandbox.html?preset=${encodeURIComponent(preset.id)}`;
    const thumb = document.createElement("img");
    const cached = thumbCache.get(preset.id);
    thumb.className = cached ? "gallery-thumb" : "gallery-thumb loading";
    if (cached) thumb.src = cached;
    thumb.alt = tBi(preset.name);
    card.appendChild(thumb);
    const label = document.createElement("div");
    label.className = "gallery-label";
    label.textContent = tBi(preset.name);
    card.appendChild(label);
    grid.appendChild(card);
  }

  // 縮圖依序同步渲染（同一個隱藏 WebGL context 一次只能畫一張），比照教學列表頁的做法；
  // 已經快取過的直接跳過，不重新渲染。
  const thumbEls = grid.querySelectorAll(".gallery-thumb");
  for (let i = 0; i < items.length; i++) {
    if (thumbCache.has(items[i].id)) continue;
    const dataUrl = renderPresetThumbnail(items[i]);
    if (dataUrl) {
      thumbCache.set(items[i].id, dataUrl);
      if (thumbEls[i]) {
        thumbEls[i].src = dataUrl;
        thumbEls[i].classList.remove("loading");
      }
    }
  }
}

renderStats();
initHeroPreview();
renderGallery();

document.addEventListener("langchange", () => {
  renderStats();
  const preset = presets.find((p) => p.id === HERO_PRESET_ID) || presets[0];
  updateHeroCaption(preset);
  renderGallery();
});
