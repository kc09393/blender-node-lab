import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_glass",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "做出一個玻璃材質", en: "Make a Glass Material" },
  description: {
    zh: "用玻璃 BSDF（Glass BSDF）節點做出一個清澈的玻璃球，認識粗糙度（Roughness）與 IOR 這兩個關鍵參數。",
    en: "Use the Glass BSDF node to create a clear glass sphere, learning the Roughness and IOR parameters along the way.",
  },
  startGraph: {
    nodes: [
      { id: "t_glass_out", typeId: "output_material", x: 520, y: 160, params: {} },
      { id: "t_glass_principled", typeId: "shader_principled_bsdf", x: 200, y: 100, params: {} },
    ],
    links: [{ id: "t_glass_l1", fromNode: "t_glass_principled", fromSocket: "bsdf", toNode: "t_glass_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_glass_out", typeId: "output_material", x: 520, y: 160, params: {} },
      { id: "te_glass_glass", typeId: "shader_glass_bsdf", x: 200, y: 100, params: { roughness: 0.02, ior: 1.45 } },
    ],
    links: [{ id: "te_glass_l1", fromNode: "te_glass_glass", fromSocket: "bsdf", toNode: "te_glass_out", toSocket: "surface" }],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Glass BSDF", en: "Step 1: Add a Glass BSDF" },
      instruction: {
        zh: "目前圖裡是預設的原理化 BSDF（Principled BSDF）。從左側節點面板找到「著色器 Shader」分類，把玻璃 BSDF（Glass BSDF）拖到畫布上。",
        en: "The graph currently has the default Principled BSDF. Find the Glass BSDF under the Shader category in the left panel and drag it onto the canvas.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_glass_bsdf"),
    },
    {
      title: { zh: "第二步：接到 Material Output", en: "Step 2: Connect to Material Output" },
      instruction: {
        zh: "把玻璃 BSDF（Glass BSDF）的 BSDF 輸出（右側圓點）拖曳連到材質輸出（Material Output）的表面（Surface）輸入（左側圓點）。",
        en: "Drag from Glass BSDF's BSDF output (right dot) to Material Output's Surface input (left dot).",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_glass_bsdf", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第三步：調低 Roughness", en: "Step 3: Lower the Roughness" },
      instruction: {
        zh: "在玻璃 BSDF（Glass BSDF）節點上把粗糙度（Roughness）調到 0.05 以下，玻璃才會清澈透亮而不是霧面。",
        en: "On the Glass BSDF node, set Roughness below 0.05 so the glass looks clear instead of frosted.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_glass_bsdf", "roughness", (v) => v <= 0.05),
    },
    {
      title: { zh: "第四步：設定真實的 IOR", en: "Step 4: Set a Realistic IOR" },
      instruction: {
        zh: "把 IOR（折射率）調整到 1.45 附近——這是真實玻璃的折射率。試著改成 1.0 或 2.4 看看說明文字，理解 IOR 代表什麼。",
        en: "Set IOR (index of refraction) to around 1.45 — real glass's IOR. Try 1.0 or 2.4 too, and check the docs to understand what IOR represents.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_glass_bsdf", "ior", (v) => v >= 1.4 && v <= 1.55),
    },
  ],
};
