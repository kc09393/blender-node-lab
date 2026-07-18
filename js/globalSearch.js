// 全站統一搜尋（Ctrl/Cmd+K）：跨節點百科／預設材質／引導教學／疑難排解四種內容一起搜，
// 點結果或按 Enter 直接跳轉到對應頁面的深連結（沿用各頁面既有的 ?node=/?preset=/?tutorial=/?category= 慣例）。
// 每個頁面的 app-*.js 只需要呼叫一次 initGlobalSearch()，索引資料在這個模組內部組好、跨頁共用同一份邏輯。
import { listNodeTypes } from "./core/nodeRegistry.js";
import { tBi, t, getLang } from "./i18n.js";
import presets from "../data/presets/index.js";
import tutorials from "../data/tutorials/index.js";
import troubleshootGuide from "../data/troubleshootGuide.js";

const MAX_PER_GROUP = 6;

function buildIndex() {
  return [
    ...listNodeTypes().map((n) => ({
      group: "node", name: n.name, sub: n.summary,
      dot: `var(--cat-${n.category})`, href: `encyclopedia.html?node=${encodeURIComponent(n.id)}`,
    })),
    ...presets.map((p) => ({
      group: "preset", name: p.name, sub: p.description,
      dot: "var(--accent)", href: `sandbox.html?preset=${encodeURIComponent(p.id)}`,
    })),
    ...tutorials.map((tut) => ({
      group: "tutorial", name: tut.name, sub: tut.description,
      dot: "var(--accent-2)", href: `tutorials.html?tutorial=${encodeURIComponent(tut.id)}`,
    })),
    ...troubleshootGuide.map((cat) => ({
      group: "troubleshoot", name: cat.symptom, sub: null,
      dot: "var(--danger)", href: `troubleshoot.html?category=${encodeURIComponent(cat.id)}`,
    })),
  ];
}

const GROUP_LABEL_KEY = {
  node: "search.groupNode",
  preset: "search.groupPreset",
  tutorial: "search.groupTutorial",
  troubleshoot: "search.groupTroubleshoot",
};
const GROUP_ORDER = ["node", "preset", "tutorial", "troubleshoot"];

function haystack(item) {
  return [item.name.zh, item.name.en, item.sub?.zh, item.sub?.en].filter(Boolean).join(" ").toLowerCase();
}

export function initGlobalSearch() {
  const trigger = document.getElementById("global-search-btn");
  if (!trigger) return;

  const index = buildIndex();

  const overlay = document.createElement("div");
  overlay.className = "gs-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="gs-panel">
      <div class="gs-input-row">
        <input type="text" class="gs-input" />
      </div>
      <div class="gs-results" id="gs-results-listbox" role="listbox"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector(".gs-input");
  const resultsEl = overlay.querySelector(".gs-results");
  let activeIndex = -1;
  let visibleItems = [];
  let optionIdCounter = 0;

  function close() {
    overlay.hidden = true;
    input.value = "";
    trigger.focus();
  }

  function open() {
    overlay.hidden = false;
    overlay.setAttribute("aria-label", t("search.placeholder"));
    input.placeholder = t("search.placeholder");
    input.setAttribute("aria-label", t("search.placeholder"));
    render();
    input.focus();
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    resultsEl.innerHTML = "";
    activeIndex = -1;
    visibleItems = [];

    if (!query) {
      resultsEl.innerHTML = `<div class="gs-idle-hint">${t("search.idleHint")}</div>`;
      return;
    }

    const matched = index.filter((item) => haystack(item).includes(query));
    if (matched.length === 0) {
      resultsEl.innerHTML = `<div class="gs-empty-hint">${t("search.noResults")}</div>`;
      return;
    }

    for (const group of GROUP_ORDER) {
      const items = matched.filter((item) => item.group === group).slice(0, MAX_PER_GROUP);
      if (items.length === 0) continue;

      const label = document.createElement("div");
      label.className = "gs-group-label";
      label.textContent = t(GROUP_LABEL_KEY[group]);
      resultsEl.appendChild(label);

      for (const item of items) {
        const row = document.createElement("div");
        row.className = "gs-result";
        row.id = `gs-option-${optionIdCounter++}`;
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", "false");
        row.innerHTML = `
          <span class="gs-dot" style="background:${item.dot}"></span>
          <span class="gs-name">${tBi(item.name)}</span>
          <span class="gs-sub">${item.sub ? tBi(item.sub) : ""}</span>
        `;
        row.addEventListener("click", () => navigateTo(item));
        row.addEventListener("mouseenter", () => setActive(visibleItems.indexOf(row)));
        resultsEl.appendChild(row);
        visibleItems.push(row);
      }
    }
  }

  function setActive(i) {
    if (activeIndex >= 0 && visibleItems[activeIndex]) {
      visibleItems[activeIndex].classList.remove("gs-active");
      visibleItems[activeIndex].setAttribute("aria-selected", "false");
    }
    activeIndex = i;
    if (activeIndex >= 0 && visibleItems[activeIndex]) {
      const el = visibleItems[activeIndex];
      el.classList.add("gs-active");
      el.setAttribute("aria-selected", "true");
      el.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", el.id);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function navigateTo(item) {
    window.location.href = item.href;
  }

  trigger.addEventListener("click", open);
  input.addEventListener("input", render);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    const isOpenShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
    if (isOpenShortcut) {
      e.preventDefault();
      overlay.hidden ? open() : close();
      return;
    }
    if (overlay.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, visibleItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetIndex = activeIndex >= 0 ? activeIndex : 0;
      const el = visibleItems[targetIndex];
      if (el) el.dispatchEvent(new MouseEvent("click"));
    } else if (e.key === "Tab") {
      // 對話框裡唯一原生可 focus 的元素就是搜尋框本身（結果是 div，不搶 Tab 順序），
      // 直接擋掉 Tab 讓焦點留在輸入框，避免鍵盤操作把焦點帶到視覺上被遮住的背景頁面元素。
      e.preventDefault();
      input.focus();
    }
  });

  document.addEventListener("langchange", () => {
    if (!overlay.hidden) render();
  });
}
