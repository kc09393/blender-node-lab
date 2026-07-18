import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_candle_wax_glow",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "蠟燭材質：次表面散射＋加法著色器疊光", en: "Candle Wax: Subsurface Scattering + Add Shader Glow" },
  description: {
    zh: "蠟燭的蠟身半透光、內部又像被燭火照亮，是次表面散射（Subsurface Scattering）的經典應用之一。這篇示範怎麼把 SSS 的邊緣透光效果，跟一層額外的暖黃色發光（Emission）疊加起來——用加法著色器（Add Shader，不是 Mix Shader）疊加，才能讓「原本的透光」跟「額外的燭光」是真的相加變亮，而不是被平均掉。",
    en: "Candle wax's soft translucency, lit from within by the flame, is a classic Subsurface Scattering use case. This tutorial layers SSS's edge translucency with an extra warm-yellow Emission glow — using Add Shader (not Mix Shader) so the 'built-in translucency' and the 'extra candlelight' genuinely add up brighter instead of getting averaged down.",
  },
  startGraph: {
    nodes: [{ id: "t_cwg_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_cwg_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_cwg_add", typeId: "shader_add_shader", x: 800, y: 160, params: {} },
      {
        id: "te_cwg_sss",
        typeId: "shader_subsurface_scattering",
        x: 500,
        y: 40,
        params: { color: [0.95, 0.78, 0.4, 1], scale: 0.15, radius: [2, 1, 0.3] },
      },
      { id: "te_cwg_emit", typeId: "shader_emission", x: 500, y: 280, params: { color: [1, 0.85, 0.55, 1], strength: 3 } },
    ],
    links: [
      { id: "te_cwg_l1", fromNode: "te_cwg_add", fromSocket: "bsdf", toNode: "te_cwg_out", toSocket: "surface" },
      { id: "te_cwg_l2", fromNode: "te_cwg_sss", fromSocket: "bsdf", toNode: "te_cwg_add", toSocket: "shader1" },
      { id: "te_cwg_l3", fromNode: "te_cwg_emit", fromSocket: "bsdf", toNode: "te_cwg_add", toSocket: "shader2" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先做出蠟本身的透光質感", en: "Step 1: Build the Wax's Own Translucency" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入次表面散射（Subsurface Scattering），直接接到材質輸出（Material Output）。顏色（Color）改成暖黃色（例如 0.95/0.78/0.4）；各色道半徑（Radius）把 R 設得比 G、B 大很多（例如 2/1/0.3）並把散射範圍（Scale）調高到 0.15 左右——蠟是半透明的厚材質，散射範圍要比皮膚教學裡的數值更大。",
        en: "Drag in Subsurface Scattering from the Shader category and connect it directly to Material Output. Change Color to warm yellow (e.g. 0.95/0.78/0.4); set Radius's R much higher than G and B (e.g. 2/1/0.3) and raise Scale to around 0.15 — wax is a thick translucent material, so it needs a larger scattering range than the skin tutorial's values.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_subsurface_scattering") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_subsurface_scattering") &&
        anyNodeParamMatches(graph, "shader_subsurface_scattering", "scale", (v) => v >= 0.1),
    },
    {
      title: { zh: "第二步：加一層暖黃色發光", en: "Step 2: Add a Warm Yellow Emission Layer" },
      instruction: {
        zh: "拖入發光（Emission），顏色改成暖黃色（例如 1/0.85/0.55），強度（Strength）先設 1.5——這代表燭火本身從內部照亮蠟身的光，先不要接線。",
        en: "Drag in Emission, set its color to warm yellow (e.g. 1/0.85/0.55), and Strength to 1.5 — representing the flame's own light shining out from inside the wax. Don't wire it up yet.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_emission"),
    },
    {
      title: { zh: "第三步：用加法著色器疊加，不要用 Mix Shader", en: "Step 3: Combine with Add Shader — Not Mix Shader" },
      instruction: {
        zh: "拖入加法著色器（Add Shader），把次表面散射跟發光分別接到它的兩個輸入，再接到材質輸出取代原本的直接連線。\n\n⚠️ 這裡故意選 Add Shader 而不是 Mix Shader：如果用 Mix Shader（Fac=0.5），兩者會被『平均』，SSS 原本的暖色調反而被稀釋變暗；用 Add Shader 真的把兩份光加總，蠟身才會呈現「原本就半透光、又被燭火整個點亮」的疊加效果，整體更亮更飽和。",
        en: "Drag in Add Shader, connect Subsurface Scattering and Emission to its two inputs, then wire it to Material Output, replacing the direct connection.\n\n⚠️ Add Shader is chosen deliberately over Mix Shader here: with Mix Shader (Fac=0.5) the two would be averaged, actually diluting SSS's warm tone. Add Shader truly sums both lights, so the wax reads as 'already translucent, and now lit up further by the flame' — brighter and more saturated overall.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_add_shader") &&
        nodeHasIncomingFromType(graph, "shader_add_shader", "shader_subsurface_scattering") &&
        nodeHasIncomingFromType(graph, "shader_add_shader", "shader_emission") &&
        hasLinkBetweenTypes(graph, "shader_add_shader", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第四步：調整燭光強度，感受相加的效果", en: "Step 4: Adjust Flame Strength to Feel the Additive Effect" },
      instruction: {
        zh: "把發光（Emission）的強度（Strength）調得更高（例如 3）。整顆球會明顯變得更亮更暖，而且不會像 Mix Shader 那樣被限制在『兩者之間』——這正是相加（而非平均）的直接證據。",
        en: "Raise Emission's Strength higher (e.g. 3). The whole sphere gets noticeably brighter and warmer, without being capped 'somewhere between the two' the way Mix Shader would — direct proof of addition rather than averaging.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_emission", "strength", (v) => v >= 2.5),
    },
  ],
};
