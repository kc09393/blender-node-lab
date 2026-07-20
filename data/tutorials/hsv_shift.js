import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_hsv_shift",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "色相偏移：一鍵換色", en: "Hue Shift: One-Click Recolor" },
  description: {
    zh: "用色相/飽和度/明度（Hue Saturation Value）節點調整顏色，比直接改 RGB 更直覺——轉 Hue 就能把紅色變藍色，不用重新調三個色版。",
    en: "Use the Hue Saturation Value node to adjust color — more intuitive than editing RGB directly. Turning Hue alone can flip red to blue without retuning three channels.",
  },
  startGraph: {
    nodes: [
      { id: "t_hsv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_hsv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_hsv_l1", fromNode: "t_hsv_principled", fromSocket: "bsdf", toNode: "t_hsv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_hsv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_hsv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_hsv_hsv", typeId: "color_hsv", x: 300, y: 100, params: { color: [0.8, 0.15, 0.15, 1], hue: 0.15, saturation: 1.4 } },
    ],
    links: [
      { id: "te_hsv_l1", fromNode: "te_hsv_principled", fromSocket: "bsdf", toNode: "te_hsv_out", toSocket: "surface" },
      { id: "te_hsv_l2", fromNode: "te_hsv_hsv", fromSocket: "color", toNode: "te_hsv_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入色相/飽和度/明度節點", en: "Step 1: Add a Hue Saturation Value Node" },
      instruction: {
        zh: "從「顏色 Color」分類拖入色相/飽和度/明度（Hue Saturation Value）節點。",
        en: "Drag in a Hue Saturation Value node from the Color category.",
      },
      check: (graph) => hasNodeOfType(graph, "color_hsv"),
    },
    {
      title: { zh: "第二步：接到底色", en: "Step 2: Connect to Base Color" },
      instruction: {
        zh: "把它的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Connect its Color output to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_hsv", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第三步：轉動色相", en: "Step 3: Turn the Hue" },
      instruction: {
        zh: "把色相（Hue）從預設的 0.5 調成一個不同的值（例如 0.15）。顏色應該會整個轉到色環上不同的位置。\n\n這比分別調整 R/G/B 三個色版直覺得多。",
        en: "Change Hue from the default 0.5 to a different value (e.g. 0.15). The color should shift to a different spot on the color wheel.\n\nMuch more intuitive than adjusting R/G/B separately.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_hsv", "hue", (v) => Math.abs(v - 0.5) > 0.1),
    },
    {
      title: { zh: "第四步：拉高飽和度", en: "Step 4: Raise Saturation" },
      instruction: {
        zh: "把飽和度（Saturation）調到 1.3 以上，顏色會變得更鮮豔飽和，而不是黯淡的灰調。",
        en: "Raise Saturation above 1.3 — the color becomes more vivid and saturated instead of a dull gray tone.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_hsv", "saturation", (v) => v >= 1.3),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想把一個紅色物體直接變成藍色，同時完全不動它的飽和度跟明暗，最直接的做法是？",
        en: "To turn a red object blue while leaving its saturation and brightness completely untouched, what's the most direct approach?",
      },
      options: [
        { zh: "調整色相 Hue", en: "Adjust Hue" },
        { zh: "調整飽和度 Saturation", en: "Adjust Saturation" },
        { zh: "調整明度 Value", en: "Adjust Value" },
        { zh: "改用伽瑪 Gamma 節點", en: "Use the Gamma node instead" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "Hue／Saturation／Value 三個分量彼此獨立——只轉 Hue 就能把顏色沿色相環移動（紅→藍），完全不會動到 Saturation（鮮豔程度）跟 Value（明暗），這正是 HSV 比直接改 RGB 三個色版更直覺的原因。",
        en: "Hue, Saturation, and Value are independent of each other — turning only Hue moves the color around the color wheel (red to blue) without touching Saturation (vividness) or Value (brightness), which is exactly why HSV is more intuitive than editing the three RGB channels directly.",
      },
    },
  ],
};
