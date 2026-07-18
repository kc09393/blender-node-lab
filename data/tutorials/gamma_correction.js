import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_gamma_correction",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "伽瑪：次方曲線調中間調", en: "Gamma: A Power-Curve Midtone Adjustment" },
  description: {
    zh: "伽瑪（Gamma）節點的運算就是 pow(顏色, gamma)——伽瑪大於 1 會讓中間調變暗，小於 1 會讓中間調變亮，常用來校正貼圖或快速調整材質的明暗曲線。",
    en: "The Gamma node simply computes pow(color, gamma) — values above 1 darken midtones, below 1 brighten them. Commonly used to correct texture data or quickly reshape a material's tonal curve.",
  },
  startGraph: {
    nodes: [
      { id: "t_ga_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ga_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.5, 0.5, 1] } },
    ],
    links: [{ id: "t_ga_l1", fromNode: "t_ga_principled", fromSocket: "bsdf", toNode: "t_ga_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ga_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ga_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_ga_gamma", typeId: "color_gamma", x: 300, y: 100, params: { color: [0.5, 0.5, 0.5, 1], gamma: 3 } },
    ],
    links: [
      { id: "te_ga_l1", fromNode: "te_ga_principled", fromSocket: "bsdf", toNode: "te_ga_out", toSocket: "surface" },
      { id: "te_ga_l2", fromNode: "te_ga_gamma", fromSocket: "color", toNode: "te_ga_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入伽瑪節點", en: "Step 1: Add a Gamma Node" },
      instruction: {
        zh: "從「顏色 Color」分類拖入伽瑪（Gamma），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。顏色（Color）保持中灰（0.5,0.5,0.5）。",
        en: "Drag in a Gamma from the Color category and connect it to Principled BSDF's Base Color. Keep Color at mid-gray (0.5, 0.5, 0.5).",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_gamma", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：調低伽瑪值變亮", en: "Step 2: Lower Gamma to Brighten" },
      instruction: {
        zh: "把伽瑪（Gamma）調到 0.5 以下（例如 0.35）。中灰色應該會明顯變亮，因為指數小於 1 會把 0-1 範圍內的數值整體往上抬。",
        en: "Set Gamma below 0.5 (e.g. 0.35). The mid-gray should visibly brighten, since an exponent below 1 lifts values within the 0-1 range upward overall.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_gamma", "gamma", (v) => v <= 0.5),
    },
    {
      title: { zh: "第三步：換成大於 1 的伽瑪值", en: "Step 3: Try a Gamma Above 1" },
      instruction: {
        zh: "再把伽瑪調到 2 以上，顏色應該會變得比中灰暗很多——這證明伽瑪是「次方」而不是「加減」，越極端的值效果越劇烈。",
        en: "Now set Gamma above 2 — the color should become much darker than mid-gray. This confirms Gamma is a power operation, not addition/subtraction — more extreme values have a stronger effect.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_gamma", "gamma", (v) => v >= 2),
    },
  ],
  quiz: [
    {
      question: {
        zh: "伽瑪（Gamma）節點的伽瑪值調到大於 1（例如 2），對畫面中間調亮度的影響是？",
        en: "When Gamma's value is set above 1 (e.g. 2), what happens to the image's midtone brightness?",
      },
      options: [
        { zh: "中間調變亮", en: "Midtones get brighter" },
        { zh: "中間調變暗", en: "Midtones get darker" },
        { zh: "完全沒有影響", en: "No effect at all" },
        { zh: "顏色被反轉成互補色", en: "Colors invert to their complements" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Gamma 的公式是 pow(顏色, gamma)——0-1 之間的數值取大於 1 的次方會變小，所以伽瑪大於 1 會讓中間調變暗；伽瑪小於 1（例如 0.5）則相反，會讓中間調變亮。",
        en: "Gamma computes pow(color, gamma) — raising a 0-1 value to a power greater than 1 makes it smaller, so a gamma above 1 darkens midtones. A gamma below 1 (e.g. 0.5) does the opposite, brightening them.",
      },
    },
  ],
};
