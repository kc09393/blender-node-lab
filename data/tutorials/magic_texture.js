import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_magic_texture",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "迷幻紋理：抽象花紋產生器", en: "Magic Texture: Abstract Pattern Generator" },
  description: {
    zh: "迷幻紋理（Magic Texture）沒有對應的真實世界材質，純粹是好玩的抽象花紋產生器，很適合拿來做特效或風格化的材質。",
    en: "Magic Texture has no real-world material equivalent — it's a fun generator for abstract, kaleidoscope-like patterns, great for effects or stylized materials.",
  },
  startGraph: {
    nodes: [
      { id: "t_mg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mg_l1", fromNode: "t_mg_principled", fromSocket: "bsdf", toNode: "t_mg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_mg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3 } },
      { id: "te_mg_magic", typeId: "texture_magic", x: 300, y: 100, params: { distortion: 4 } },
    ],
    links: [
      { id: "te_mg_l1", fromNode: "te_mg_principled", fromSocket: "bsdf", toNode: "te_mg_out", toSocket: "surface" },
      { id: "te_mg_l2", fromNode: "te_mg_magic", fromSocket: "color", toNode: "te_mg_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入迷幻紋理", en: "Step 1: Add a Magic Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入迷幻紋理（Magic Texture）。",
        en: "Drag in a Magic Texture from the Texture category.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_magic"),
    },
    {
      title: { zh: "第二步：接到底色", en: "Step 2: Connect to Base Color" },
      instruction: {
        zh: "把它的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Connect its Color output to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_magic", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第三步：調高扭曲程度", en: "Step 3: Raise the Distortion" },
      instruction: {
        zh: "把扭曲（Distortion）調到 3 以上，花紋會變得更複雜、更有萬花筒感。",
        en: "Raise Distortion above 3 — the pattern becomes more complex and kaleidoscope-like.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_magic", "distortion", (v) => v >= 3),
    },
    {
      title: { zh: "第四步：降低粗糙度增加光澤感", en: "Step 4: Lower Roughness for a Glossy Look" },
      instruction: {
        zh: "把原理化 BSDF 的粗糙度（Roughness）調低（例如 0.3 以下），讓花紋帶點光澤感，比較像特效材質而不是平面貼紙。",
        en: "Lower Principled BSDF's Roughness (e.g. below 0.3) so the pattern picks up some gloss — more like an effects material than a flat sticker.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v <= 0.35),
    },
  ],
};
