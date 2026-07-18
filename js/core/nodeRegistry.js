// 所有節點定義的集中註冊表。要新增節點，只需要在 data/nodes/*.js 對應分類的
// 陣列裡加一筆定義，不需要碰這個檔案，也不需要改動編輯器或編譯器核心。
import input from "../../data/nodes/input.js";
import output from "../../data/nodes/output.js";
import shader from "../../data/nodes/shader.js";
import texture from "../../data/nodes/texture.js";
import color from "../../data/nodes/color.js";
import vector from "../../data/nodes/vector.js";
import converter from "../../data/nodes/converter.js";

export const CATEGORY_ORDER = ["input", "output", "shader", "texture", "color", "vector", "converter"];

export const CATEGORY_LABELS = {
  input: { zh: "輸入 Input", en: "Input" },
  output: { zh: "輸出 Output", en: "Output" },
  shader: { zh: "著色器 Shader", en: "Shader" },
  texture: { zh: "紋理 Texture", en: "Texture" },
  color: { zh: "顏色 Color", en: "Color" },
  vector: { zh: "向量 Vector", en: "Vector" },
  converter: { zh: "轉換器 Converter", en: "Converter" },
};

const ALL_NODE_TYPES = [...input, ...output, ...shader, ...texture, ...color, ...vector, ...converter];
const BY_ID = new Map(ALL_NODE_TYPES.map((n) => [n.id, n]));

export function getNodeType(id) {
  return BY_ID.get(id);
}

export function listNodeTypes() {
  return ALL_NODE_TYPES;
}

export function listByCategory() {
  const map = new Map(CATEGORY_ORDER.map((c) => [c, []]));
  for (const n of ALL_NODE_TYPES) {
    if (!map.has(n.category)) map.set(n.category, []);
    map.get(n.category).push(n);
  }
  return map;
}

export function searchNodeTypes(query, lang) {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_NODE_TYPES;
  return ALL_NODE_TYPES.filter((n) => {
    const name = (n.name[lang] || n.name.zh).toLowerCase();
    const nameOther = (n.name.zh + n.name.en).toLowerCase();
    const summary = (n.summary?.[lang] || n.summary?.zh || "").toLowerCase();
    return name.includes(q) || nameOther.includes(q) || summary.includes(q);
  });
}
