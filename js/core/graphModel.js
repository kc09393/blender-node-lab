// 節點圖的資料模型：Graph / GraphNode / Link。
// 不碰任何 DOM／畫布邏輯（那是 ui/nodeEditor.js 的責任），純粹是資料 + 型別檢查規則。
import { getNodeType } from "./nodeRegistry.js";
import { socketsCompatible } from "./socketTypes.js";

let idCounter = 1;
function nextId(prefix) {
  return `${prefix}${idCounter++}`;
}

// 從外部載入的 id（自動保存、預設材質、匯入的 JSON）常常帶有像 "n1" / "glass_n2" 這樣的數字尾碼。
// 如果不把 idCounter 同步往前推，之後用 nextId() 產生的新 id 可能跟載入進來的舊 id 撞號，
// 導致 Map 裡的節點被悄悄覆蓋掉（例如剛還原的材質輸出節點被新加入的節點取代）。
function bumpIdCounterPastLoadedIds(ids) {
  for (const id of ids) {
    const match = /(\d+)$/.exec(id);
    if (match) idCounter = Math.max(idCounter, parseInt(match[1], 10) + 1);
  }
}

export class GraphNode {
  constructor(typeId, x = 0, y = 0, id = null) {
    this.id = id || nextId("n");
    this.typeId = typeId;
    this.x = x;
    this.y = y;
    this.params = {}; // 未接線輸入的目前值 + settings 目前值（key -> value）
    const typeDef = getNodeType(typeId);
    if (!typeDef) throw new Error(`未知的節點類型: ${typeId}`);
    for (const input of typeDef.inputs) {
      this.params[input.key] = cloneDefault(input.default);
    }
    for (const setting of typeDef.settings || []) {
      this.params[setting.key] = cloneDefault(setting.default);
    }
  }
}

// 深複製預設值：像 Color Ramp 的 stops 是「陣列裝物件」，只淺複製陣列本身還是會讓
// 好幾個節點實例共用同一組 stop 物件參照，其中一個改了位置/顏色會悄悄影響到其他節點。
function cloneDefault(v) {
  if (Array.isArray(v)) return v.map((item) => cloneDefault(item));
  if (v && typeof v === "object") {
    const copy = {};
    for (const k of Object.keys(v)) copy[k] = cloneDefault(v[k]);
    return copy;
  }
  return v;
}

export class GraphLink {
  constructor(fromNode, fromSocket, toNode, toSocket, id = null) {
    this.id = id || nextId("l");
    this.fromNode = fromNode;
    this.fromSocket = fromSocket;
    this.toNode = toNode;
    this.toSocket = toSocket;
  }
}

export class Graph {
  constructor() {
    this.nodes = new Map();
    this.links = new Map();
  }

  addNode(typeId, x, y) {
    const node = new GraphNode(typeId, x, y);
    this.nodes.set(node.id, node);
    return node;
  }

  removeNode(nodeId) {
    this.nodes.delete(nodeId);
    for (const [linkId, link] of this.links) {
      if (link.fromNode === nodeId || link.toNode === nodeId) this.links.delete(linkId);
    }
  }

  // 檢查「這條連線的來源/目標節點跟 socket 都真的存在，而且型別相容」，addLink 跟
  // fromJSON（讀取自動保存/匯入的 JSON）共用這個檢查，確保 Graph 裡不會出現斷頭連線
  // ——不然之後隨便一個地方讀到 graph.nodes.get(link.fromNode) 就會是 undefined 直接壞掉。
  _isValidLink(fromNode, fromSocket, toNode, toSocket) {
    if (fromNode === toNode) return false;
    const fromType = getNodeType(this.nodes.get(fromNode)?.typeId);
    const toType = getNodeType(this.nodes.get(toNode)?.typeId);
    if (!fromType || !toType) return false;
    const outDef = fromType.outputs.find((o) => o.key === fromSocket);
    const inDef = toType.inputs.find((i) => i.key === toSocket);
    if (!outDef || !inDef) return false;
    return socketsCompatible(outDef.type, inDef.type);
  }

  // 嘗試連線；型別不合或找不到 socket 會回傳 null（呼叫端負責顯示錯誤提示）。
  // 每個輸入 socket 只能接一條線，新的連線會取代舊的。
  addLink(fromNode, fromSocket, toNode, toSocket) {
    if (!this._isValidLink(fromNode, fromSocket, toNode, toSocket)) return null;

    for (const [linkId, link] of this.links) {
      if (link.toNode === toNode && link.toSocket === toSocket) this.links.delete(linkId);
    }
    const link = new GraphLink(fromNode, fromSocket, toNode, toSocket);
    this.links.set(link.id, link);
    return link;
  }

  removeLink(linkId) {
    this.links.delete(linkId);
  }

  getIncomingLink(nodeId, socketKey) {
    for (const link of this.links.values()) {
      if (link.toNode === nodeId && link.toSocket === socketKey) return link;
    }
    return null;
  }

  getLinksForSocket(nodeId, socketKey, dir) {
    const out = [];
    for (const link of this.links.values()) {
      if (dir === "in" && link.toNode === nodeId && link.toSocket === socketKey) out.push(link);
      if (dir === "out" && link.fromNode === nodeId && link.fromSocket === socketKey) out.push(link);
    }
    return out;
  }

  clear() {
    this.nodes.clear();
    this.links.clear();
  }

  toJSON() {
    return {
      nodes: [...this.nodes.values()].map((n) => ({ id: n.id, typeId: n.typeId, x: n.x, y: n.y, params: n.params })),
      links: [...this.links.values()].map((l) => ({
        id: l.id, fromNode: l.fromNode, fromSocket: l.fromSocket, toNode: l.toNode, toSocket: l.toSocket,
      })),
    };
  }

  // 讀取自動保存 / 匯入的 JSON 檔案時要當作「不可信任的外部輸入」處理：
  // 檔案可能被手動改壞、來自更舊的版本、或單純損毀。每一步都驗證過再收進 graph，
  // 壞掉的節點/連線直接跳過，而不是照單全收之後在別的地方才爆出難懂的錯誤。
  static fromJSON(data) {
    const graph = new Graph();
    const nodeList = Array.isArray(data?.nodes) ? data.nodes : [];
    const linkList = Array.isArray(data?.links) ? data.links : [];
    bumpIdCounterPastLoadedIds(nodeList.map((n) => n?.id).filter(Boolean));
    bumpIdCounterPastLoadedIds(linkList.map((l) => l?.id).filter(Boolean));

    for (const n of nodeList) {
      if (!n || typeof n.typeId !== "string") continue;
      if (!getNodeType(n.typeId)) continue; // 忽略之後版本移除掉的節點類型
      if (typeof n.id !== "string" || !n.id || graph.nodes.has(n.id)) continue; // 缺 id 或跟前面的節點撞號就跳過
      const x = Number.isFinite(n.x) ? n.x : 0;
      const y = Number.isFinite(n.y) ? n.y : 0;
      const node = new GraphNode(n.typeId, x, y, n.id);
      if (n.params && typeof n.params === "object") Object.assign(node.params, n.params);
      graph.nodes.set(node.id, node);
    }
    for (const l of linkList) {
      if (!l || typeof l.fromNode !== "string" || typeof l.toNode !== "string") continue;
      if (typeof l.fromSocket !== "string" || typeof l.toSocket !== "string") continue;
      if (!graph._isValidLink(l.fromNode, l.fromSocket, l.toNode, l.toSocket)) continue;
      const id = typeof l.id === "string" && l.id ? l.id : undefined;
      const link = new GraphLink(l.fromNode, l.fromSocket, l.toNode, l.toSocket, id);
      graph.links.set(link.id, link);
    }
    return graph;
  }
}
