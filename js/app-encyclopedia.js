import { initLangToggle, tBi, getLang, t } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { initMobileNav } from "./ui/mobileNav.js";
import { listByCategory, CATEGORY_ORDER, CATEGORY_LABELS, searchNodeTypes, getNodeType } from "./core/nodeRegistry.js";
import { renderNodeDoc } from "./ui/nodeCard.js";
import { glossNodeNames } from "./core/glossary.js";
import tutorials from "../data/tutorials/searchIndex.js";
import nodeTutorialIndex from "../data/tutorials/nodeIndex.js";
import presets from "../data/presets/searchIndex.js";
import nodeTypeUsage from "../data/presets/nodeTypeUsage.js";

initLangToggle();
initMobileNav();
initGlobalSearch();

const categoryList = document.getElementById("category-list");
const nodeGrid = document.getElementById("node-grid");
const detailPanel = document.getElementById("detail-panel");
const searchInput = document.getElementById("encyclopedia-search");

let activeCategory = "all";
let selectedNodeId = null;

function renderCategoryList() {
  categoryList.innerHTML = "";
  const byCategory = listByCategory();
  const totalCount = [...byCategory.values()].reduce((sum, list) => sum + list.length, 0);

  const allItem = document.createElement("div");
  allItem.className = `category-item${activeCategory === "all" ? " active" : ""}`;
  allItem.innerHTML = `<span>${getLang() === "zh" ? "全部節點" : "All Nodes"}</span><span class="count">${totalCount}</span>`;
  allItem.addEventListener("click", () => {
    activeCategory = "all";
    renderCategoryList();
    renderGrid();
  });
  categoryList.appendChild(allItem);

  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category) || [];
    const item = document.createElement("div");
    item.className = `category-item${activeCategory === category ? " active" : ""}`;
    item.innerHTML = `<span><span class="dot" style="background:var(--cat-${category})"></span>${tBi(CATEGORY_LABELS[category])}</span><span class="count">${list.length}</span>`;
    item.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryList();
      renderGrid();
    });
    categoryList.appendChild(item);
  }
}

function currentNodeList() {
  const lang = getLang();
  const query = searchInput.value.trim();
  const base = query ? searchNodeTypes(query, lang) : listByCategory().get(activeCategory === "all" ? "" : activeCategory);
  if (query) {
    return activeCategory === "all" ? base : base.filter((n) => n.category === activeCategory);
  }
  if (activeCategory === "all") {
    return CATEGORY_ORDER.flatMap((c) => listByCategory().get(c) || []);
  }
  return base || [];
}

function renderGrid() {
  nodeGrid.innerHTML = "";
  const list = currentNodeList();
  if (list.length === 0) {
    nodeGrid.innerHTML = '<div class="empty-hint">找不到符合的節點 / No matching nodes</div>';
    return;
  }
  for (const typeDef of list) {
    const card = document.createElement("div");
    card.className = "node-grid-item";
    card.innerHTML = `
      <div class="n-name">${tBi(typeDef.name)}</div>
      <div class="n-name-sub">${typeDef.name.zh} · ${typeDef.name.en}</div>
      <div class="n-desc">${glossNodeNames(tBi(typeDef.summary), getLang())}</div>
      ${typeDef.supported === false ? `<span class="badge-unsupported">${t("encyclopedia.notSupportedYet") || "沙盒尚未支援即時預覽"}</span>` : ""}
    `;
    card.addEventListener("click", () => {
      selectedNodeId = typeDef.id;
      renderDetail();
      // 窄螢幕下三個面板（分類/節點格/詳解）是上下堆疊，詳解面板在節點格下方、通常還在
      // 螢幕外——點了節點卡片卻「畫面上什麼都沒變」，使用者容易以為沒點到。桌面版三欄
      // 並排本來就都看得到，不需要也不該自動捲動（會打斷使用者原本正在看的位置）。
      if (window.matchMedia("(max-width: 900px)").matches) {
        detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    nodeGrid.appendChild(card);
  }
}

function renderDetail() {
  detailPanel.innerHTML = "";
  if (!selectedNodeId) {
    detailPanel.innerHTML = '<div class="empty-hint">點選左方節點以查看詳解</div>';
    return;
  }
  const typeDef = getNodeType(selectedNodeId);
  const wrap = document.createElement("div");
  wrap.className = "node-doc";
  renderNodeDoc(typeDef, getLang(), wrap);
  const tryBtn = document.createElement("a");
  tryBtn.className = "try-sandbox-btn";
  tryBtn.href = `sandbox.html?addNode=${encodeURIComponent(typeDef.id)}`;
  tryBtn.textContent = t("encyclopedia.tryInSandbox");
  wrap.appendChild(tryBtn);

  // 這個節點如果有對應的引導教學（見 data/tutorials/nodeIndex.js），額外顯示一個直達連結——
  // 只有真的找得到教學（id 沒對不上，例如教學被移除改名）才顯示，不留一個點了沒反應的死連結。
  const tutorialId = nodeTutorialIndex[typeDef.id];
  const tutorial = tutorialId ? tutorials.find((t) => t.id === tutorialId) : null;
  if (tutorial) {
    const learnBtn = document.createElement("a");
    learnBtn.className = "try-sandbox-btn learn-tutorial-btn";
    learnBtn.href = `tutorials.html?tutorial=${encodeURIComponent(tutorial.id)}`;
    learnBtn.textContent = t("encyclopedia.learnInTutorial");
    wrap.appendChild(learnBtn);
  }

  // 這個節點實際被用在哪些預設材質裡——nodeTypeUsage.js 是 scripts/generate-search-index.mjs
  // 從全部 preset 的節點圖預先算好的反查表（typeId -> presetId[]），跟 nodeIndex.js 不同
  // （那個是人工精選「最推薦」單篇教學），這裡是要盡量列出全部真實用例，讓使用者看到同一個
  // 節點在不同材質裡的實際用法。用預先算好的反查表，這個頁面就不用載入全部 preset 的完整節點圖。
  const usingPresetIds = nodeTypeUsage[typeDef.id] || [];
  const usingPresets = usingPresetIds.map((id) => presets.find((p) => p.id === id)).filter(Boolean);
  if (usingPresets.length > 0) {
    const section = document.createElement("div");
    section.className = "used-in-presets";
    const heading = document.createElement("h4");
    heading.textContent = t("encyclopedia.usedInPresets");
    section.appendChild(heading);
    const chipList = document.createElement("div");
    chipList.className = "preset-chip-list";
    for (const preset of usingPresets) {
      const chip = document.createElement("a");
      chip.className = "preset-chip";
      chip.href = `sandbox.html?preset=${encodeURIComponent(preset.id)}`;
      chip.textContent = tBi(preset.name);
      chipList.appendChild(chip);
    }
    section.appendChild(chipList);
    wrap.appendChild(section);
  }

  detailPanel.appendChild(wrap);
}

searchInput.addEventListener("input", renderGrid);
document.addEventListener("langchange", () => {
  renderCategoryList();
  renderGrid();
  renderDetail();
});

// 從全站搜尋等外部連結跳轉過來時，直接定位到該節點的詳解面板。
// node 這個網址參數是不可信任的外部輸入，先確認節點類型真的存在再套用，
// 不然後面的 renderDetail() 會拿 undefined 的 typeDef 直接出錯。
const nodeParam = new URLSearchParams(location.search).get("node");
const nodeParamType = nodeParam ? getNodeType(nodeParam) : null;
if (nodeParamType) {
  activeCategory = nodeParamType.category;
  selectedNodeId = nodeParamType.id;
}
if (nodeParam) history.replaceState(null, "", location.pathname);

renderCategoryList();
renderGrid();
renderDetail();
