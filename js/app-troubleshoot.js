import { initLangToggle, tBi, t, getLang } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { initMobileNav } from "./ui/mobileNav.js";
import troubleshootGuide from "../data/troubleshootGuide.js";
import tutorials from "../data/tutorials/searchIndex.js";
import presets from "../data/presets/searchIndex.js";

initLangToggle();
initMobileNav();
initGlobalSearch();

const listEl = document.getElementById("troubleshoot-list");
const searchInput = document.getElementById("troubleshoot-search");

function matchesQuery(category, query) {
  if (!query) return true;
  const lang = getLang();
  const haystack = [
    category.symptom.zh, category.symptom.en,
    ...category.items.flatMap((item) => [item.cause.zh, item.cause.en, item.fix.zh, item.fix.en]),
  ].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function renderItem(item) {
  const wrap = document.createElement("div");
  wrap.className = "ts-item";

  const cause = document.createElement("div");
  cause.className = "ts-item-cause";
  cause.innerHTML = `<span class="ts-label">${t("troubleshoot.causeLabel")}</span>${tBi(item.cause)}`;
  wrap.appendChild(cause);

  const fix = document.createElement("div");
  fix.className = "ts-item-fix";
  fix.innerHTML = `<span class="ts-label">${t("troubleshoot.fixLabel")}</span>${tBi(item.fix)}`;
  wrap.appendChild(fix);

  if (item.tutorialId) {
    const tutorial = tutorials.find((tut) => tut.id === item.tutorialId);
    if (tutorial) {
      const link = document.createElement("a");
      link.className = "ts-item-link";
      link.href = `tutorials.html?tutorial=${encodeURIComponent(tutorial.id)}`;
      link.textContent = `${t("troubleshoot.seeTutorial")}${tBi(tutorial.name)} →`;
      wrap.appendChild(link);
    }
  } else if (item.presetId) {
    const preset = presets.find((p) => p.id === item.presetId);
    if (preset) {
      const link = document.createElement("a");
      link.className = "ts-item-link";
      link.href = `sandbox.html?preset=${encodeURIComponent(preset.id)}`;
      link.textContent = `${t("troubleshoot.seePreset")}${tBi(preset.name)} →`;
      wrap.appendChild(link);
    }
  } else if (item.linkHref) {
    const link = document.createElement("a");
    link.className = "ts-item-link";
    link.href = item.linkHref;
    link.textContent = `${t("troubleshoot.seeReference")} →`;
    wrap.appendChild(link);
  }

  return wrap;
}

function renderCategory(category, keepOpen) {
  const details = document.createElement("details");
  details.className = "ts-category";
  details.dataset.categoryId = category.id;
  if (keepOpen) details.open = true;

  const summary = document.createElement("summary");
  summary.className = "ts-category-symptom";
  summary.innerHTML = `
    <span>${tBi(category.symptom)}</span>
    <span class="ts-category-count"><span class="ts-chevron">▶</span> ${category.items.length}</span>
  `;
  details.appendChild(summary);

  const itemsWrap = document.createElement("div");
  itemsWrap.className = "ts-items";
  for (const item of category.items) itemsWrap.appendChild(renderItem(item));
  details.appendChild(itemsWrap);

  return details;
}

function render() {
  const query = searchInput.value.trim();
  listEl.innerHTML = "";
  const matched = troubleshootGuide.filter((category) => matchesQuery(category, query));
  if (matched.length === 0) {
    listEl.innerHTML = `<div class="ts-empty-hint">${t("troubleshoot.noResults")}</div>`;
    return;
  }
  for (const category of matched) {
    listEl.appendChild(renderCategory(category, Boolean(query)));
  }
}

searchInput.addEventListener("input", render);
document.addEventListener("langchange", render);

render();

// 從全站搜尋等外部連結跳轉過來時，直接展開並捲動到對應症狀分類。
// category 是不可信任的外部輸入，找不到對應分類就當作沒帶參數，不讓整頁掛掉。
const categoryParam = new URLSearchParams(location.search).get("category");
if (categoryParam) {
  const target = listEl.querySelector(`[data-category-id="${CSS.escape(categoryParam)}"]`);
  if (target) {
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  history.replaceState(null, "", location.pathname);
}
