// 節點編輯畫布：拖拉節點、連線、縮放平移、框選多個節點。
// 互動方式盡量比照 Blender 的節點編輯器：滑鼠中鍵（或按住空白鍵）拖曳＝平移、
// 左鍵在空白處拖曳＝框選、從節點面板點選節點會讓節點跟著游標、再點一次畫布才放置。
// 刻意不用 Rete.js / React Flow 等套件，因為要跟 socket 型別系統與 GLSL 編譯器緊密配合，
// 專門為 shader graph 打造的輕量版更好掌控（見 plan 的技術取捨說明）。
import { Graph } from "../core/graphModel.js";
import { getNodeType } from "../core/nodeRegistry.js";
import { socketsCompatible } from "../core/socketTypes.js";
import { createNodeElement } from "./nodeCard.js";
import { tBi } from "../i18n.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export class NodeEditor {
  constructor(container, { onChange, onError, onSelect } = {}) {
    this.container = container;
    this.graph = new Graph();
    this.onChangeRaw = onChange || (() => {});
    this.onChange = debounce(() => this.onChangeRaw(this.graph), 80);
    this.onError = onError || (() => {});
    this.onSelect = onSelect || (() => {});

    this.pan = { x: 40, y: 40 };
    this.scale = 1;
    this.selectedNodeIds = new Set();
    this._lastSelectedId = null;
    this.selectedLinkId = null;
    this.draggingNodes = null;
    this.pendingLink = null;
    this.isPanning = false;
    this.boxSelectStart = null;
    this.placingTypeId = null;
    this._spacePressed = false;

    // 復原/重做：存整份 graph 的 JSON 快照字串（不是 diff），實作簡單、不用擔心
    // 漏記某種變動類型；缺點是每步都存整份圖，但材質圖規模小（通常 <50 節點），
    // 100 步歷史紀錄的記憶體成本可忽略不計。
    this._undoStack = [];
    this._redoStack = [];
    this._dragHistorySnapshot = null;
    // 只有 _onParamChange 用時間+目標（節點+參數 key）合併連續變動（拖曳滑桿每影格都觸發），
    // 其餘操作都是天生離散的單一動作，不需要、也不應該合併。
    this._lastParamChangeKey = null;
    this._lastParamChangeTime = 0;

    this.layer = document.createElement("div");
    this.layer.className = "graph-layer";
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("class", "wire-svg");
    // svg 先加入、graph-layer 後加入，讓節點卡片（含 socket）的畫面疊層在電線之上，
    // 避免使用者點在「剛好連著電線的 socket 正中央」時，點擊被電線的 <path> 攔截。
    container.appendChild(this.svg);
    container.appendChild(this.layer);

    container.addEventListener("pointerdown", (e) => this._onCanvasPointerDown(e));
    window.addEventListener("pointermove", (e) => this._onPointerMove(e));
    window.addEventListener("pointerup", (e) => this._onPointerUp(e));
    container.addEventListener("wheel", (e) => this._onWheel(e), { passive: false });
    container.addEventListener("contextmenu", (e) => {
      // 右鍵在這個畫布上永遠用來取消放置節點／剪電線手勢，不要跳出瀏覽器的右鍵選單。
      e.preventDefault();
      if (this.placingTypeId) this._cancelPlacing();
    });
    window.addEventListener("keydown", (e) => this._onKeyDown(e));
    window.addEventListener("keyup", (e) => this._onKeyUp(e));

    this._applyTransform();
  }

  // ---------- 復原 / 重做 ----------

  // 呼叫端在「真的要改動 graph 之前」呼叫，把改動前的狀態存進復原堆疊。這是每個離散
  // 使用者操作各觸發一次的動作（加節點、刪節點、接線、斷線…），本身不會連續狂觸發，
  // 所以永遠直接記錄一筆，不做時間合併——時間合併只用在 _onParamChange 這種真的會
  // 連續狂觸發的操作上（見下方），而且要用「同一個節點/同一個參數」當合併依據，不能只看
  // 時間間隔，不然兩個原本無關、但剛好發生得很近的動作（例如快速新增又刪除節點）會被
  // 誤合併成一步，復原時只退回一步、卻同時撤銷了兩件事。
  // 回傳有沒有真的記錄，呼叫端在「這次改動其實沒發生」（例如連線失敗）時要退回這筆快照。
  _pushHistory() {
    this._undoStack.push(JSON.stringify(this.graph.toJSON()));
    if (this._undoStack.length > 100) this._undoStack.shift();
    this._redoStack.length = 0;
    // 保險：任何一次「真的記錄了一筆」都讓 _onParamChange 的合併鍵失效——這樣如果
    // 中間夾了一個其他動作（例如拖曳滑桿拖到一半、同時刪除了另一個節點），
    // 下一次同一個滑桿的變動不會誤合併回這次動作之前，把中間那個動作也一併復原掉。
    // _onParamChange 呼叫這裡之後會立刻重新設回正確的鍵，不受影響。
    this._lastParamChangeKey = null;
    return true;
  }

  get canUndo() {
    return this._undoStack.length > 0;
  }

  get canRedo() {
    return this._redoStack.length > 0;
  }

  // 教學模式換到另一篇教學／重新開始同一篇時呼叫：避免復原歷史跨教學互相污染
  // （不然使用者理論上可以從新教學一路復原回上一篇教學的編輯過程，語意上不合理）。
  clearHistory() {
    this._undoStack.length = 0;
    this._redoStack.length = 0;
    this._lastParamChangeKey = null;
  }

  undo() {
    if (this._undoStack.length === 0) return;
    this._redoStack.push(JSON.stringify(this.graph.toJSON()));
    const prev = this._undoStack.pop();
    this.graph = Graph.fromJSON(JSON.parse(prev));
    this.selectedNodeIds.clear();
    this._lastSelectedId = null;
    this.selectedLinkId = null;
    this._lastParamChangeKey = null;
    this.render();
    this.onChangeRaw(this.graph);
  }

  redo() {
    if (this._redoStack.length === 0) return;
    this._undoStack.push(JSON.stringify(this.graph.toJSON()));
    const next = this._redoStack.pop();
    this.graph = Graph.fromJSON(JSON.parse(next));
    this.selectedNodeIds.clear();
    this._lastSelectedId = null;
    this.selectedLinkId = null;
    this._lastParamChangeKey = null;
    this.render();
    this.onChangeRaw(this.graph);
  }

  // ---------- public API ----------

  addNode(typeId, graphX, graphY) {
    this._pushHistory();
    const node = this.graph.addNode(typeId, graphX, graphY);
    this._selectOnly(node.id);
    this.render();
    this.onChange();
    return node;
  }

  // 進入「放置模式」：節點跟著游標移動，使用者點一下畫布才真的放進圖裡（比照 Blender Shift+A）。
  startPlacingNode(typeId) {
    this._cancelPlacing();
    this.placingTypeId = typeId;
    const typeDef = getNodeType(typeId);
    const ghost = document.createElement("div");
    ghost.className = "node-ghost";
    ghost.textContent = typeDef ? tBi(typeDef.name) : typeId;
    ghost.style.visibility = "hidden";
    document.body.appendChild(ghost);
    this._placingGhostEl = ghost;
  }

  _finishPlacingNode(clientX, clientY) {
    const { x, y } = this.screenToGraph(clientX, clientY);
    this.addNode(this.placingTypeId, x - 90, y - 20);
    this._cancelPlacing();
  }

  _cancelPlacing() {
    if (this._placingGhostEl) {
      this._placingGhostEl.remove();
      this._placingGhostEl = null;
    }
    this.placingTypeId = null;
  }

  removeSelected() {
    if (this.selectedNodeIds.size === 0 && !this.selectedLinkId) return;
    this._pushHistory();
    if (this.selectedNodeIds.size > 0) {
      for (const id of this.selectedNodeIds) {
        const typeDef = getNodeType(this.graph.nodes.get(id)?.typeId);
        if (typeDef && typeDef.category !== "output") this.graph.removeNode(id);
      }
      this.selectedNodeIds.clear();
      this._lastSelectedId = null;
    } else if (this.selectedLinkId) {
      this.graph.removeLink(this.selectedLinkId);
      this.selectedLinkId = null;
    }
    this.render();
    this.onChange();
  }

  clear() {
    this._pushHistory();
    this.graph.clear();
    this.selectedNodeIds.clear();
    this._lastSelectedId = null;
    this.selectedLinkId = null;
    this.render();
    this.onChange();
  }

  loadGraph(graph) {
    this._pushHistory();
    this.graph = graph;
    this.selectedNodeIds.clear();
    this._lastSelectedId = null;
    this.selectedLinkId = null;
    this.render();
    this.onChange();
  }

  screenToGraph(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.pan.x) / this.scale,
      y: (clientY - rect.top - this.pan.y) / this.scale,
    };
  }

  _selectOnly(nodeId) {
    this.selectedNodeIds = new Set([nodeId]);
    this._lastSelectedId = nodeId;
    this.selectedLinkId = null;
  }

  // ---------- rendering ----------

  render() {
    this.layer.innerHTML = "";
    for (const node of this.graph.nodes.values()) {
      const typeDef = getNodeType(node.typeId);
      const connectedInputKeys = new Set(
        typeDef.inputs.filter((i) => this.graph.getIncomingLink(node.id, i.key)).map((i) => i.key)
      );
      const el = createNodeElement(node, {
        selected: this.selectedNodeIds.has(node.id),
        connectedInputKeys,
        onHeaderPointerDown: (e, nodeId) => this._onNodeHeaderPointerDown(e, nodeId),
        onSocketPointerDown: (e, nodeId, key, dir, type) => this._onSocketPointerDown(e, nodeId, key, dir, type),
        onSocketPointerUp: (e, nodeId, key, dir) => this._onSocketPointerUp(e, nodeId, key, dir),
        onParamChange: (nodeId, key, value) => this._onParamChange(nodeId, key, value),
        onDelete: (nodeId) => this._onDeleteNode(nodeId),
      });
      this.layer.appendChild(el);
    }
    this._drawWires();
    this.onSelect(this.selectedNodeIds.has(this._lastSelectedId) ? this._lastSelectedId : null);
  }

  _applyTransform() {
    this.layer.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.scale})`;
  }

  _socketCanvasPos(nodeId, socketKey, dir) {
    const sel = `.socket[data-node-id="${nodeId}"][data-socket-key="${socketKey}"][data-dir="${dir}"]`;
    const el = this.layer.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cRect = this.container.getBoundingClientRect();
    return { x: r.left + r.width / 2 - cRect.left, y: r.top + r.height / 2 - cRect.top };
  }

  _bezierPath(a, b) {
    const midX = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
  }

  // 比照 Blender 的「noodle」：電線顏色跟來源 socket 的型別配色一致，而不是統一灰色。
  _socketColor(type) {
    if (!this._socketColorCache) this._socketColorCache = {};
    if (!this._socketColorCache[type]) {
      const v = getComputedStyle(document.documentElement).getPropertyValue(`--sock-${type}`).trim();
      this._socketColorCache[type] = v || "#9a9aa4";
    }
    return this._socketColorCache[type];
  }

  _drawWires() {
    this.svg.innerHTML = "";
    for (const link of this.graph.links.values()) {
      const a = this._socketCanvasPos(link.fromNode, link.fromSocket, "out");
      const b = this._socketCanvasPos(link.toNode, link.toSocket, "in");
      if (!a || !b) continue;
      const fromType = getNodeType(this.graph.nodes.get(link.fromNode)?.typeId);
      const outDef = fromType?.outputs.find((o) => o.key === link.fromSocket);
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", this._bezierPath(a, b));
      path.setAttribute("stroke", link.id === this.selectedLinkId ? "#ff8a2b" : this._socketColor(outDef?.type || "float"));
      path.setAttribute("stroke-width", link.id === this.selectedLinkId ? "3" : "2");
      path.setAttribute("fill", "none");
      path.style.cursor = "pointer";
      path.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this.selectedLinkId = link.id;
        this.selectedNodeIds.clear();
        this.render();
      });
      this.svg.appendChild(path);
    }
    if (this.pendingLink) {
      const from = this.pendingLink.startPos;
      const to = this.pendingLink.currentPos || from;
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", this._bezierPath(from, to));
      path.setAttribute("stroke", this._socketColor(this.pendingLink.type));
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-dasharray", "6 4");
      path.setAttribute("fill", "none");
      this.svg.appendChild(path);
    }
    if (this.cutStart && this.cutCurrent) {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", this.cutStart.x);
      line.setAttribute("y1", this.cutStart.y);
      line.setAttribute("x2", this.cutCurrent.x);
      line.setAttribute("y2", this.cutCurrent.y);
      line.setAttribute("stroke", "#e5484d");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-dasharray", "4 4");
      this.svg.appendChild(line);
    }
  }

  // 電線是彎曲的貝茲曲線，取樣成一串折線段，再用線段交叉檢定近似判斷剪刀手勢有沒有畫過這條電線。
  _sampleBezier(a, b, n) {
    const midX = (a.x + b.x) / 2;
    const points = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const mt = 1 - t;
      const x = mt * mt * mt * a.x + 3 * mt * mt * t * midX + 3 * mt * t * t * midX + t * t * t * b.x;
      const y = mt * mt * mt * a.y + 3 * mt * mt * t * a.y + 3 * mt * t * t * b.y + t * t * t * b.y;
      points.push({ x, y });
    }
    return points;
  }

  _segmentsIntersect(p1, p2, p3, p4) {
    const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }

  // 剪刀手勢：檢查游標這一小段移動路徑有沒有跟任何一條電線交叉，交叉到就直接剪斷。
  _checkCut(from, to) {
    const toRemove = [];
    for (const link of this.graph.links.values()) {
      const a = this._socketCanvasPos(link.fromNode, link.fromSocket, "out");
      const b = this._socketCanvasPos(link.toNode, link.toSocket, "in");
      if (!a || !b) continue;
      const points = this._sampleBezier(a, b, 16);
      for (let i = 0; i < points.length - 1; i++) {
        if (this._segmentsIntersect(from, to, points[i], points[i + 1])) {
          toRemove.push(link.id);
          break;
        }
      }
    }
    if (toRemove.length) {
      this._pushHistory();
      for (const id of toRemove) this.graph.removeLink(id);
      this.render();
      this.onChange();
    }
  }

  // ---------- interaction ----------

  _onCanvasPointerDown(e) {
    const isBackground = e.target === this.container || e.target === this.layer || e.target === this.svg;
    if (!isBackground) return;

    if (this.placingTypeId) {
      if (e.button === 0) this._finishPlacingNode(e.clientX, e.clientY);
      return;
    }

    if (e.button === 1 || (e.button === 0 && this._spacePressed)) {
      e.preventDefault();
      this.isPanning = true;
      this._panStart = { x: e.clientX, y: e.clientY, panX: this.pan.x, panY: this.pan.y };
      this.container.classList.add("panning");
      return;
    }

    // 右鍵拖曳＝剪斷電線（比照 Blender 的 Ctrl+右鍵剪刀手勢，這裡簡化成單純右鍵拖曳）。
    if (e.button === 2) {
      e.preventDefault();
      const rect = this.container.getBoundingClientRect();
      this.cutStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this.cutCurrent = this.cutStart;
      this.container.classList.add("cutting");
      return;
    }

    if (e.button !== 0) return;
    // 左鍵在空白處拖曳＝框選（比照 Blender 預設的 tweak 工具）。
    const rect = this.container.getBoundingClientRect();
    this.boxSelectStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!e.shiftKey) {
      this.selectedNodeIds.clear();
      this._lastSelectedId = null;
      this.selectedLinkId = null;
    }
    this.render();
  }

  _onNodeHeaderPointerDown(e, nodeId) {
    if (this.placingTypeId) return;
    const alreadySelected = this.selectedNodeIds.has(nodeId);
    if (e.shiftKey) {
      if (alreadySelected) this.selectedNodeIds.delete(nodeId);
      else this.selectedNodeIds.add(nodeId);
      this._lastSelectedId = nodeId;
    } else if (!alreadySelected) {
      this._selectOnly(nodeId);
    } else {
      this._lastSelectedId = nodeId;
    }
    this.selectedLinkId = null;

    const startPositions = new Map();
    for (const id of this.selectedNodeIds) {
      const n = this.graph.nodes.get(id);
      if (n) startPositions.set(id, { x: n.x, y: n.y });
    }
    this.draggingNodes = { startClientX: e.clientX, startClientY: e.clientY, startPositions };
    // 拖曳節點單純改位置、不影響編譯結果，所以不像其他變動那樣立刻 _pushHistory()——
    // 先記住「拖曳開始前」的快照，只有放開滑鼠時真的有位移，才補記一筆進復原堆疊
    // （見 _onPointerUp），避免「點一下選取節點」這種零位移的操作也占用一步復原。
    this._dragHistorySnapshot = JSON.stringify(this.graph.toJSON());
    this.render();
  }

  _onSocketPointerDown(e, nodeId, socketKey, dir, type) {
    // 比照 Blender：從「已經接著電線的輸入插槽」拖曳，是抓住那條電線本身，
    // 一開始拖曳就立刻斷開舊連線，讓電線跟著游標走（而不是等放開滑鼠才決定要不要換線）。
    if (dir === "in") {
      const existingLink = this.graph.getIncomingLink(nodeId, socketKey);
      if (existingLink) {
        this._pushHistory();
        const startPos = this._socketCanvasPos(existingLink.fromNode, existingLink.fromSocket, "out");
        this.graph.removeLink(existingLink.id);
        this.pendingLink = { nodeId, socketKey, dir: "in", type, startPos, currentPos: startPos };
        this.render();
        this.onChange();
        return;
      }
    }
    const startPos = this._socketCanvasPos(nodeId, socketKey, dir);
    this.pendingLink = { nodeId, socketKey, dir, type, startPos, currentPos: startPos };
    this._drawWires();
  }

  _onSocketPointerUp(e, nodeId, socketKey, dir) {
    if (!this.pendingLink) return;
    const a = this.pendingLink;
    if (a.dir === dir) {
      this.pendingLink = null;
      this._drawWires();
      return;
    }
    const pushed = this._pushHistory();
    let link;
    if (a.dir === "out") {
      link = this.graph.addLink(a.nodeId, a.socketKey, nodeId, socketKey);
    } else {
      link = this.graph.addLink(nodeId, socketKey, a.nodeId, a.socketKey);
    }
    this.pendingLink = null;
    if (!link) {
      if (pushed) this._undoStack.pop();
      this._flashInvalid();
    } else {
      this.onChange();
    }
    this.render();
  }

  _onParamChange(nodeId, key, value) {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return;
    // 拖曳同一個滑桿/色板/向量欄位一次手勢會連續觸發幾十次，全部記成一步復原；
    // 但换成別的節點或別的參數（或超過 500ms 沒再動），就該是新的一步，
    // 所以合併依據是「同一個節點+同一個參數 key」，不是單純看時間。
    const now = Date.now();
    const coalesceKey = `${nodeId}:${key}`;
    const isContinuation = this._lastParamChangeKey === coalesceKey && now - this._lastParamChangeTime < 500;
    if (!isContinuation) this._pushHistory();
    this._lastParamChangeKey = coalesceKey;
    this._lastParamChangeTime = now;
    node.params[key] = value;
    // 少數節點（Combine/Separate Color 的 RGB/HSV/HSL 模式）的輸入/輸出標籤是
    // (params) => label 的函式，會隨這次改掉的參數變化，這種節點卡片本身的文字要重畫。
    // 同理，少數設定欄位有 showIf（例如顏色漸變的色相過渡只在色彩空間非 RGB 時才顯示），
    // 這種節點也要整卡重畫，不然切了色彩空間，該出現/消失的欄位不會馬上跟著變。
    // 一般節點兩者都沒有，不受影響，維持原本「只重編譯、不整頁重繪」的效能行為
    // （尤其是拖曳滑桿/向量這種每影格觸發的操作，不能在這裡整個編輯器重建）。
    const typeDef = getNodeType(node.typeId);
    const hasDynamicLabel = [...typeDef.inputs, ...typeDef.outputs].some((d) => typeof d.label === "function");
    const hasConditionalSetting = (typeDef.settings || []).some((d) => typeof d.showIf === "function");
    if (hasDynamicLabel || hasConditionalSetting) this.render();
    this.onChange();
  }

  _onDeleteNode(nodeId) {
    this._pushHistory();
    this.graph.removeNode(nodeId);
    this.selectedNodeIds.delete(nodeId);
    if (this._lastSelectedId === nodeId) this._lastSelectedId = null;
    this.render();
    this.onChange();
  }

  _onPointerMove(e) {
    if (this.placingTypeId) {
      if (this._placingGhostEl) {
        this._placingGhostEl.style.visibility = "visible";
        this._placingGhostEl.style.left = `${e.clientX + 14}px`;
        this._placingGhostEl.style.top = `${e.clientY + 14}px`;
      }
      return;
    }
    if (this.draggingNodes) {
      const dx = (e.clientX - this.draggingNodes.startClientX) / this.scale;
      const dy = (e.clientY - this.draggingNodes.startClientY) / this.scale;
      for (const [id, start] of this.draggingNodes.startPositions) {
        const node = this.graph.nodes.get(id);
        if (!node) continue;
        node.x = start.x + dx;
        node.y = start.y + dy;
        const el = this.layer.querySelector(`.node-card[data-node-id="${id}"]`);
        if (el) {
          el.style.left = `${node.x}px`;
          el.style.top = `${node.y}px`;
        }
      }
      this._drawWires();
      return;
    }
    if (this.isPanning) {
      this.pan.x = this._panStart.panX + (e.clientX - this._panStart.x);
      this.pan.y = this._panStart.panY + (e.clientY - this._panStart.y);
      this._applyTransform();
      this._drawWires();
      return;
    }
    if (this.boxSelectStart) {
      const rect = this.container.getBoundingClientRect();
      this._updateSelectionBoxUI(this.boxSelectStart, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      return;
    }
    if (this.cutStart) {
      const rect = this.container.getBoundingClientRect();
      const next = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this._checkCut(this.cutCurrent, next);
      this.cutCurrent = next;
      this._drawWires();
      return;
    }
    if (this.pendingLink) {
      const rect = this.container.getBoundingClientRect();
      this.pendingLink.currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this._drawWires();
      this._updateHoverFeedback(e.clientX, e.clientY);
    }
  }

  _updateSelectionBoxUI(start, cur) {
    if (!this._selectionBoxEl) {
      this._selectionBoxEl = document.createElement("div");
      this._selectionBoxEl.className = "selection-box";
      this.container.appendChild(this._selectionBoxEl);
    }
    const x = Math.min(start.x, cur.x);
    const y = Math.min(start.y, cur.y);
    Object.assign(this._selectionBoxEl.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${Math.abs(cur.x - start.x)}px`,
      height: `${Math.abs(cur.y - start.y)}px`,
    });
  }

  _finalizeBoxSelect(start, end) {
    const x1 = Math.min(start.x, end.x);
    const y1 = Math.min(start.y, end.y);
    const x2 = Math.max(start.x, end.x);
    const y2 = Math.max(start.y, end.y);
    if (x2 - x1 < 3 && y2 - y1 < 3) return; // 幾乎沒有拖曳，視為單純點擊空白處取消選取
    const containerRect = this.container.getBoundingClientRect();
    for (const node of this.graph.nodes.values()) {
      const el = this.layer.querySelector(`.node-card[data-node-id="${node.id}"]`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const nx1 = r.left - containerRect.left;
      const ny1 = r.top - containerRect.top;
      const nx2 = r.right - containerRect.left;
      const ny2 = r.bottom - containerRect.top;
      if (nx1 < x2 && nx2 > x1 && ny1 < y2 && ny2 > y1) {
        this.selectedNodeIds.add(node.id);
        this._lastSelectedId = node.id;
      }
    }
  }

  // 拖曳連線時，即時標示游標下方的 socket 是否能接受這條線（型別檢查視覺回饋）。
  _updateHoverFeedback(clientX, clientY) {
    if (this._hoverSocketEl) {
      this._hoverSocketEl.classList.remove("socket-hover-ok", "socket-hover-bad");
      this._hoverSocketEl = null;
    }
    const el = document.elementFromPoint(clientX, clientY);
    const socketEl = el?.closest(".socket");
    if (!socketEl) return;
    const dir = socketEl.dataset.dir;
    const type = socketEl.dataset.type;
    if (dir === this.pendingLink.dir) return;
    const [fromType, toType] = this.pendingLink.dir === "out" ? [this.pendingLink.type, type] : [type, this.pendingLink.type];
    const ok = socketsCompatible(fromType, toType);
    socketEl.classList.add(ok ? "socket-hover-ok" : "socket-hover-bad");
    this._hoverSocketEl = socketEl;
  }

  _onPointerUp(e) {
    if (this.draggingNodes) {
      // 只有真的位移超過一點點門檻，才把「拖曳開始前」的快照補記進復原堆疊——
      // 單純點一下節點（選取，沒有真的拖動）不該占用一步復原。
      const moved = [...this.draggingNodes.startPositions].some(([id, start]) => {
        const n = this.graph.nodes.get(id);
        return n && (Math.abs(n.x - start.x) > 0.5 || Math.abs(n.y - start.y) > 0.5);
      });
      if (moved && this._dragHistorySnapshot) {
        this._undoStack.push(this._dragHistorySnapshot);
        if (this._undoStack.length > 100) this._undoStack.shift();
        this._redoStack.length = 0;
        this._lastHistoryPushTime = Date.now();
      }
      this._dragHistorySnapshot = null;
      this.draggingNodes = null;
    }
    if (this.isPanning) {
      this.isPanning = false;
      this.container.classList.remove("panning");
    }
    if (this.cutStart) {
      this.cutStart = null;
      this.cutCurrent = null;
      this.container.classList.remove("cutting");
      this._drawWires();
    }
    if (this.boxSelectStart) {
      const rect = this.container.getBoundingClientRect();
      this._finalizeBoxSelect(this.boxSelectStart, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      this.boxSelectStart = null;
      if (this._selectionBoxEl) {
        this._selectionBoxEl.remove();
        this._selectionBoxEl = null;
      }
      this.render();
    }
    if (this.pendingLink) {
      this.pendingLink = null;
      this._drawWires();
    }
    if (this._hoverSocketEl) {
      this._hoverSocketEl.classList.remove("socket-hover-ok", "socket-hover-bad");
      this._hoverSocketEl = null;
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const rect = this.container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const oldScale = this.scale;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(2.5, Math.max(0.3, oldScale * factor));
    this.pan.x = cursorX - ((cursorX - this.pan.x) / oldScale) * newScale;
    this.pan.y = cursorY - ((cursorY - this.pan.y) / oldScale) * newScale;
    this.scale = newScale;
    this._applyTransform();
    this._drawWires();
  }

  _onKeyDown(e) {
    if (e.key === "Escape" && this.placingTypeId) {
      this._cancelPlacing();
      return;
    }
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.key === " ") {
      this._spacePressed = true;
      e.preventDefault();
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (this.selectedNodeIds.size > 0 || this.selectedLinkId) {
        e.preventDefault();
        this.removeSelected();
      }
    }
    // Shift+D：複製選取的節點（比照 Blender）。用 e.code（實體按鍵位置）而不是 e.key，
    // 避免非英文鍵盤配置（例如某些歐洲語言鍵盤 Shift+D 打出不同字元）導致快捷鍵失效。
    if (e.code === "KeyD" && e.shiftKey && this.selectedNodeIds.size > 0) {
      e.preventDefault();
      this.duplicateSelected();
    }
    // Home：縮放平移到剛好框住所有節點（比照 Blender 的 View > Frame All）。
    if (e.key === "Home") {
      e.preventDefault();
      this.frameAll();
    }
    // Ctrl/Cmd+Z＝復原，Ctrl/Cmd+Shift+Z 或 Ctrl/Cmd+Y＝重做（比照大多數軟體慣例）。
    // 用 e.code 而非 e.key：Ctrl 按住時某些鍵盤配置的 e.key 不是穩定的 "z"/"y"。
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey))) {
      e.preventDefault();
      this.redo();
    }
  }

  duplicateSelected() {
    const pushed = this._pushHistory();
    const idMap = new Map();
    for (const oldId of this.selectedNodeIds) {
      const oldNode = this.graph.nodes.get(oldId);
      if (!oldNode) continue;
      const typeDef = getNodeType(oldNode.typeId);
      if (typeDef.category === "output") continue; // 材質輸出只能有一個，不重複複製
      const newNode = this.graph.addNode(oldNode.typeId, oldNode.x + 30, oldNode.y + 30);
      newNode.params = JSON.parse(JSON.stringify(oldNode.params));
      idMap.set(oldId, newNode.id);
    }
    if (idMap.size === 0) {
      if (pushed) this._undoStack.pop();
      return;
    }
    // 只保留「被複製的節點彼此之間」的連線，跟 Blender 一樣不會保留外部連線。
    for (const link of this.graph.links.values()) {
      if (idMap.has(link.fromNode) && idMap.has(link.toNode)) {
        this.graph.addLink(idMap.get(link.fromNode), link.fromSocket, idMap.get(link.toNode), link.toSocket);
      }
    }
    this.selectedNodeIds = new Set(idMap.values());
    this._lastSelectedId = [...idMap.values()][0] || null;
    this.render();
    this.onChange();
  }

  frameAll() {
    const nodes = [...this.graph.nodes.values()];
    if (nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
      const el = this.layer.querySelector(`.node-card[data-node-id="${node.id}"]`);
      const w = el ? el.offsetWidth : 220;
      const h = el ? el.offsetHeight : 100;
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + w);
      maxY = Math.max(maxY, node.y + h);
    }
    const contentW = Math.max(maxX - minX, 1);
    const contentH = Math.max(maxY - minY, 1);
    const containerW = this.container.clientWidth || 1;
    const containerH = this.container.clientHeight || 1;
    const padding = 60;
    const newScale = Math.min(2.5, Math.max(0.15, Math.min((containerW - padding * 2) / contentW, (containerH - padding * 2) / contentH)));
    this.scale = newScale;
    this.pan.x = containerW / 2 - (minX + contentW / 2) * newScale;
    this.pan.y = containerH / 2 - (minY + contentH / 2) * newScale;
    this._applyTransform();
    this._drawWires();
  }

  _onKeyUp(e) {
    if (e.key === " ") this._spacePressed = false;
  }

  _flashInvalid() {
    this.container.classList.add("invalid-flash");
    setTimeout(() => this.container.classList.remove("invalid-flash"), 260);
  }
}
