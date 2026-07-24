import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
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
