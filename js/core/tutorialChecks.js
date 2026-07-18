// 給引導式教學的步驟驗證用的小工具函式，只檢查圖的「結構」（有沒有某種節點、有沒有某條連線、
// 參數是否落在範圍內），不檢查視覺結果本身（例如顏色好不好看），確保驗證結果是可預期、可重現的。
import { getNodeType } from "./nodeRegistry.js";

export function findNodesOfType(graph, typeId) {
  return [...graph.nodes.values()].filter((n) => n.typeId === typeId);
}

export function hasNodeOfType(graph, typeId) {
  return findNodesOfType(graph, typeId).length > 0;
}

// 檢查圖裡有沒有一條「來源節點類型 -> 目標節點類型」且 socket key 相符的連線。
export function hasLinkBetweenTypes(graph, fromTypeId, fromSocket, toTypeId, toSocket) {
  for (const link of graph.links.values()) {
    const fromNode = graph.nodes.get(link.fromNode);
    const toNode = graph.nodes.get(link.toNode);
    if (!fromNode || !toNode) continue;
    if (
      fromNode.typeId === fromTypeId &&
      link.fromSocket === fromSocket &&
      toNode.typeId === toTypeId &&
      link.toSocket === toSocket
    ) {
      return true;
    }
  }
  return false;
}

// 檢查「某類型節點」是否有任何輸入是從「另一個類型節點」接過來的，不管接的是哪個 socket。
// 適合用在 Mix Shader 這種「兩個輸入的插槽名稱本身不重要，重點是接了哪兩種節點」的檢查情境。
export function nodeHasIncomingFromType(graph, toTypeId, fromTypeId) {
  for (const link of graph.links.values()) {
    const fromNode = graph.nodes.get(link.fromNode);
    const toNode = graph.nodes.get(link.toNode);
    if (!fromNode || !toNode) continue;
    if (toNode.typeId === toTypeId && fromNode.typeId === fromTypeId) return true;
  }
  return false;
}

// 檢查某類型節點的某個輸入插槽是否「有被接線」（不管接的是什麼節點）。
export function hasAnyLinkInto(graph, toTypeId, toSocket) {
  for (const link of graph.links.values()) {
    const toNode = graph.nodes.get(link.toNode);
    if (toNode && toNode.typeId === toTypeId && link.toSocket === toSocket) return true;
  }
  return false;
}

// 檢查某類型節點的某個參數是否符合條件（例如 Roughness <= 0.05）。
// 只要圖裡「至少有一個」該類型節點符合就算通過。
export function anyNodeParamMatches(graph, typeId, key, predicate) {
  return findNodesOfType(graph, typeId).some((n) => predicate(n.params[key]));
}

export function nodeTypeName(typeId, lang) {
  const typeDef = getNodeType(typeId);
  return typeDef ? typeDef.name[lang] || typeDef.name.zh : typeId;
}
