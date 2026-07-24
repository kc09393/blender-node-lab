import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
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
