import { anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_principled_bsdf_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識原理化 BSDF：材質的控制中心", en: "Get to Know Principled BSDF: Your Material's Control Panel" },
  description: {
    zh: "原理化 BSDF（Principled BSDF）幾乎是所有材質的起點，光是這一個節點就能做出塑膠、金屬、發光、玻璃感等各種效果。這篇教學不接任何新節點，純粹帶你把 Base Color、Roughness、Metallic、Emission、Alpha 五個最關鍵的插槽都動過一次，建立完整的第一印象。",
    en: "Principled BSDF is nearly every material's starting point — this single node can produce plastic, metal, glow, or glass-like looks. This tutorial doesn't wire in any new nodes at all; it just walks you through Base Color, Roughness, Metallic, Emission, and Alpha — the five most important sliders — so you get a complete first impression of what each one does.",
  },
  startGraph: {
    nodes: [
      { id: "t_pbt_out", typeId: "output_material", x: 700, y: 160, params: {} },
      { id: "t_pbt_principled", typeId: "shader_principled_bsdf", x: 400, y: 100, params: { baseColor: [0.8, 0.8, 0.8, 1], roughness: 0.5, metallic: 0, emissionStrength: 0, alpha: 1 } },
    ],
    links: [{ id: "t_pbt_l1", fromNode: "t_pbt_principled", fromSocket: "bsdf", toNode: "t_pbt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_pbt_out", typeId: "output_material", x: 700, y: 160, params: {} },
      {
        id: "te_pbt_principled",
        typeId: "shader_principled_bsdf",
        x: 400,
        y: 100,
        params: {
          baseColor: [0.15, 0.35, 0.85, 1],
          roughness: 0.08,
          metallic: 1,
          emissionColor: [0.9, 0.6, 0.1, 1],
          emissionStrength: 1.5,
          alpha: 0.6,
        },
      },
    ],
    links: [{ id: "te_pbt_l1", fromNode: "te_pbt_principled", fromSocket: "bsdf", toNode: "te_pbt_out", toSocket: "surface" }],
  },
  steps: [
    {
      title: { zh: "第一步：換一個底色", en: "Step 1: Change the Base Color" },
      instruction: {
        zh: "點原理化 BSDF（Principled BSDF）的底色（Base Color）色塊，換成任何不是灰色的顏色（例如藍色）。\n\nBase Color 決定材質「本身的顏色」，是幾乎所有材質調整的第一步。",
        en: "Click Principled BSDF's Base Color swatch and pick any non-gray color (e.g. blue).\n\nBase Color sets the material's own color — almost always the first thing you adjust.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "shader_principled_bsdf", "baseColor", (v) => {
          if (!Array.isArray(v)) return false;
          const [r, g, b] = v;
          return Math.max(r, g, b) - Math.min(r, g, b) > 0.08;
        }),
    },
    {
      title: { zh: "第二步：調低粗糙度，看反光變銳利", en: "Step 2: Lower Roughness for a Sharper Reflection" },
      instruction: {
        zh: "把粗糙度（Roughness）調到 0.1 以下。\n\nRoughness 決定表面「散得開還是聚得攏」的反光方式：數值越低，高光越小越銳利（像拋光表面）；數值越高，高光越大越模糊（像霧面）。",
        en: "Lower Roughness below 0.1.\n\nRoughness controls whether reflections stay tight or spread out: lower values give a small, sharp highlight (polished), higher values give a wide, soft one (matte).",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v <= 0.1),
    },
    {
      title: { zh: "第三步：打開金屬度，感受材質轉變", en: "Step 3: Turn Up Metallic" },
      instruction: {
        zh: "把金屬度（Metallic）調到 1。\n\n金屬度是「非金屬 vs 金屬」的切換開關：0 代表塑膠、木頭、皮膚這類非金屬材質（反光是白色的）；1 代表真正的金屬（反光會被 Base Color 染色，這也是為什麼金色/銅色金屬看起來會帶顏色）。",
        en: "Set Metallic to 1.\n\nMetallic switches between non-metal and metal response: 0 means plastic/wood/skin-like materials (reflections stay white), 1 means true metal (reflections get tinted by Base Color — why gold or copper metals look colored).",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v >= 0.9),
    },
    {
      title: { zh: "第四步：加上自發光", en: "Step 4: Add Emission" },
      instruction: {
        zh: "把發光顏色（Emission Color）換成一個鮮豔的顏色、發光強度（Emission Strength）調到 1 以上。\n\nEmission 讓材質「自己發光」，不需要外部光源就能亮起來，常用來做螢幕、燈具、霓虹燈效果。",
        en: "Change Emission Color to a vivid color and raise Emission Strength above 1.\n\nEmission makes the material glow on its own, independent of scene lighting — great for screens, lamps, or neon effects.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "emissionStrength", (v) => v >= 1),
    },
    {
      title: { zh: "第五步：調低透明度", en: "Step 5: Lower Alpha" },
      instruction: {
        zh: "把透明度（Alpha）調到 0.7 以下。\n\nAlpha 控制材質整體「穿透多少」：1 完全不透明，數值越低背景越看得透，常搭配 Transparent BSDF 或紋理的 Alpha 輸出做出局部透明的效果（例如玻璃、樹葉、破洞）。",
        en: "Lower Alpha below 0.7.\n\nAlpha controls how see-through the whole material is: 1 is fully opaque, lower values let the background show through — often paired with Transparent BSDF or a texture's Alpha output for effects like glass, leaves, or torn holes.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "alpha", (v) => v <= 0.7),
    },
  ],
};
