import { renderPalette } from "./palette.js";
import { getLang } from "../i18n.js";
import { socketsCompatible } from "../core/socketTypes.js";

// Blender 的 Shift+A 會在游標附近開啟 Add 選單；從一條未完成的 noodle 放到空白處，
// 則開啟只包含相容節點的搜尋。沙盒與教學共用這個浮動選單，避免兩邊操作分歧。
export function mountNodeAddMenu(canvas, editor) {
  if (!canvas.hasAttribute("tabindex")) canvas.tabIndex = -1;
  const menu = document.createElement("div");
  menu.className = "node-add-popover";
  menu.hidden = true;
  menu.innerHTML = `
    <div class="node-add-popover-head">
      <strong></strong><kbd>Shift A</kbd>
    </div>
    <input type="search" autocomplete="off" />
    <div class="node-add-results palette-list" role="listbox"></div>
  `;
  document.body.appendChild(menu);

  const title = menu.querySelector("strong");
  const input = menu.querySelector("input");
  const results = menu.querySelector(".node-add-results");
  let request = null;
  let activeIndex = 0;

  const text = () => getLang() === "zh"
    ? { add: "新增節點", connect: "插入相容節點", search: "搜尋節點…" }
    : { add: "Add Node", connect: "Insert Compatible Node", search: "Search nodes…" };

  function compatible(typeDef) {
    if (typeDef.supported === false) return false;
    const connection = request?.connection;
    if (!connection) return true;
    if (connection.dir === "out") return typeDef.inputs.some((socket) => socketsCompatible(connection.type, socket.type));
    return typeDef.outputs.some((socket) => socketsCompatible(socket.type, connection.type));
  }

  function items() {
    return [...results.querySelectorAll(".palette-item:not(.unsupported)")];
  }

  function setActive(index) {
    const options = items();
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((item, itemIndex) => item.classList.toggle("keyboard-active", itemIndex === activeIndex));
    options[activeIndex].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", options[activeIndex].id);
  }

  function close(restoreFocus = false) {
    menu.hidden = true;
    request = null;
    input.value = "";
    input.removeAttribute("aria-activedescendant");
    if (restoreFocus) canvas.focus({ preventScroll: true });
  }

  function pick(typeId) {
    const current = request;
    close(true);
    if (!current) return;
    if (current.connection) {
      const point = editor.screenToGraph(current.clientX, current.clientY);
      editor.addConnectedNode(typeId, current.connection, point.x - 110, point.y - 35);
    } else {
      editor.startPlacingNode(typeId, current.clientX, current.clientY);
    }
  }

  function render() {
    renderPalette(results, input.value, pick, { filter: compatible });
    items().forEach((item, index) => {
      item.id = `node-add-option-${index}`;
      item.addEventListener("pointermove", () => setActive(index));
    });
    activeIndex = 0;
    setActive(0);
  }

  function open(detail = {}) {
    const rect = canvas.getBoundingClientRect();
    const fallbackX = rect.left + rect.width / 2;
    const fallbackY = rect.top + rect.height / 2;
    request = {
      clientX: Number.isFinite(detail.clientX) ? detail.clientX : fallbackX,
      clientY: Number.isFinite(detail.clientY) ? detail.clientY : fallbackY,
      connection: detail.connection || null,
    };
    const copy = text();
    title.textContent = request.connection ? copy.connect : copy.add;
    input.placeholder = copy.search;
    input.setAttribute("aria-label", copy.search);
    menu.hidden = false;
    render();
    const menuRect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(request.clientX, innerWidth - menuRect.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(request.clientY, innerHeight - menuRect.height - 8))}px`;
    input.focus();
  }

  canvas.addEventListener("nodeaddrequest", (event) => open(event.detail));
  input.addEventListener("input", render);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      items()[activeIndex]?.click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
  });
  menu.addEventListener("pointerdown", (event) => event.stopPropagation());
  document.addEventListener("pointerdown", (event) => {
    if (!menu.hidden && !menu.contains(event.target)) close();
  }, true);
  document.addEventListener("langchange", () => {
    if (!menu.hidden) open(request || {});
  });

  return { open, close };
}
