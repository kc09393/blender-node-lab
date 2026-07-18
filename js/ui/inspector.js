import { getNodeType } from "../core/nodeRegistry.js";
import { renderNodeDoc } from "./nodeCard.js";
import { getLang, t } from "../i18n.js";

export function renderInspector(container, graph, selectedNodeId) {
  container.innerHTML = "";
  if (!selectedNodeId || !graph.nodes.has(selectedNodeId)) {
    const hint = document.createElement("div");
    hint.className = "empty-hint";
    hint.textContent = t("sandbox.selectHint");
    container.appendChild(hint);
    return;
  }
  const node = graph.nodes.get(selectedNodeId);
  const typeDef = getNodeType(node.typeId);
  const wrap = document.createElement("div");
  wrap.className = "node-doc";
  renderNodeDoc(typeDef, getLang(), wrap);
  container.appendChild(wrap);
}
