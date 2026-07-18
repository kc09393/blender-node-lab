import { listByCategory, CATEGORY_LABELS, searchNodeTypes } from "../core/nodeRegistry.js";
import { tBi, getLang } from "../i18n.js";

export function renderPalette(container, query, onPick) {
  container.innerHTML = "";
  const lang = getLang();
  const filtered = query ? new Set(searchNodeTypes(query, lang).map((n) => n.id)) : null;
  const byCategory = listByCategory();

  for (const [category, types] of byCategory) {
    const visible = filtered ? types.filter((t) => filtered.has(t.id)) : types;
    if (visible.length === 0) continue;

    const group = document.createElement("div");
    group.className = "palette-group";

    const title = document.createElement("div");
    title.className = "palette-group-title";
    title.style.background = `var(--cat-${category})`;
    title.innerHTML = `<span>${tBi(CATEGORY_LABELS[category])}</span><span>${visible.length}</span>`;
    group.appendChild(title);

    const list = document.createElement("div");
    for (const typeDef of visible) {
      const item = document.createElement("div");
      item.className = "palette-item";
      item.draggable = true;
      item.title = tBi(typeDef.summary);
      item.innerHTML = `<span class="dot" style="background:var(--cat-${category})"></span><span>${tBi(typeDef.name)}</span>`;
      if (typeDef.supported === false) item.classList.add("unsupported");
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", typeDef.id);
        e.dataTransfer.effectAllowed = "copy";
      });
      item.addEventListener("click", () => onPick(typeDef.id));
      list.appendChild(item);
    }
    group.appendChild(list);
    container.appendChild(group);
  }

  if (container.children.length === 0) {
    const hint = document.createElement("div");
    hint.className = "empty-hint";
    hint.textContent = "找不到符合的節點";
    container.appendChild(hint);
  }
}
