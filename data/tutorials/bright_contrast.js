import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_bright_contrast",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "亮度/對比度：手機修圖同款滑桿", en: "Brightness/Contrast: Your Phone's Photo Sliders" },
  description: {
    zh: "亮度/對比度（Brightness/Contrast）節點跟手機相簿的「亮度/對比」滑桿是同一個概念——直接調整材質顏色的明暗與反差，不需要重新調色。",
    en: "The Brightness/Contrast node is the same concept as your phone photo app's brightness/contrast sliders — directly tweaking a material color's tone and range without redoing the whole palette.",
  },
  startGraph: {
    nodes: [
      { id: "t_bc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.5, 0.5, 1] } },
    ],
    links: [{ id: "t_bc_l1", fromNode: "t_bc_principled", fromSocket: "bsdf", toNode: "t_bc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_bc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_bc_bc", typeId: "color_bright_contrast", x: 300, y: 100, params: { color: [0.5, 0.5, 0.5, 1], bright: 0.15, contrast: 0.4 } },
    ],
    links: [
      { id: "te_bc_l1", fromNode: "te_bc_principled", fromSocket: "bsdf", toNode: "te_bc_out", toSocket: "surface" },
      { id: "te_bc_l2", fromNode: "te_bc_bc", fromSocket: "color", toNode: "te_bc_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入亮度/對比度節點", en: "Step 1: Add a Brightness/Contrast Node" },
      instruction: {
        zh: "從「顏色 Color」分類拖入亮度/對比度（Brightness/Contrast）節點，接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Drag in a Brightness/Contrast node from the Color category and connect it to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_bright_contrast", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：拉開對比", en: "Step 2: Stretch the Contrast" },
      instruction: {
        zh: "把對比（Contrast）調到 0.3 以上，明暗差距會被拉開，看起來更有層次。",
        en: "Raise Contrast above 0.3 — the light/dark range stretches apart for more visual punch.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_bright_contrast", "contrast", (v) => v >= 0.3),
    },
    {
      title: { zh: "第三步：微調亮度", en: "Step 3: Fine-Tune Brightness" },
      instruction: {
        zh: "把亮度（Bright）調成不是 0 的數值（例如 0.15），整體顏色會跟著變亮或變暗。",
        en: "Set Bright to a non-zero value (e.g. 0.15) — the overall color brightens or darkens accordingly.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_bright_contrast", "bright", (v) => Math.abs(v) > 0.05),
    },
  ],
};
