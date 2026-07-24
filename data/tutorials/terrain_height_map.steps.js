import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：用雜訊紋理模擬高度", en: "Step 1: Use Noise Texture to Stand In for Height" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）。\n\n把縮放（Scale）調低，例如 2.5，這樣變化會比較平緩，比較像大範圍的地形起伏，而不是細碎的雜點。",
        en: "Add a Noise Texture with a low Scale (e.g. 2.5) so it varies gently — more like large-scale terrain undulation than fine speckle.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_noise") && anyNodeParamMatches(graph, "texture_noise", "scale", (v) => v < 5),
    },
    {
      title: { zh: "第二步：建立至少 5 個停駐點的地形顏色漸變", en: "Step 2: Build a 5+ Stop Terrain Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp）。\n\n把雜訊的係數（Fac）輸出，接到顏色漸變的係數（Fac）輸入。\n\n建立至少 5 個停駐點，由低到高排列：深藍（水）→淺藍（淺水）→沙黃→草綠→岩灰→雪白。\n\n這種「用一條顏色漸變做地形分層」的技巧，在遊戲美術裡非常普遍。",
        en: "Add a Color Ramp, connect Noise's Fac to its Fac, and build at least 5 stops: deep blue (water) → light blue (shallows) → sandy tan → grass green → rock grey → snow white, ordered low to high. This 'one ramp, whole terrain palette' technique is extremely common in game art.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "converter_color_ramp", "stops", (v) => Array.isArray(v) && v.length >= 5),
    },
    {
      title: { zh: "第三步：疊一層濾色模式的表面細節", en: "Step 3: Screen In a Layer of Surface Detail" },
      instruction: {
        zh: "再加入一個雜訊紋理，當作細節圖案。把縮放調高，例如 18，讓它變化得又小又密。\n\n加入混合顏色（Mix Color）節點。A 接顏色漸變的顏色、B 接這個細節雜訊的顏色。\n\n混合模式選濾色（Screen），Fac 調低，例如 0.25。\n\n濾色只會讓顏色變亮，不會變暗，所以可以在不破壞地形色彩分區的前提下，幫地形表面加一點細碎的明暗變化。",
        en: "Add another Noise Texture as a detail pattern, with a high Scale (e.g. 18) so it varies finely. Add a Mix Color node — A from the Color Ramp's color, B from this detail noise's color, mode Screen, Fac low (e.g. 0.25). Screen only brightens, so this adds fine surface variation without wrecking the terrain's color zoning.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "color_mix", "a") &&
        anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "screen"),
    },
    {
      title: { zh: "第四步：接到底色完成地形材質", en: "Step 4: Connect to Base Color to Finish" },
      instruction: {
        zh: "把混合顏色節點的輸出接到原理化 BSDF 的底色（Base Color）。應該能同時看到大範圍的水／沙／草／岩／雪分層，跟小範圍、細碎的表面明暗變化——兩種尺度的細節同時存在，而不是只有其中一種。",
        en: "Connect the Mix Color node's output to Principled BSDF's Base Color. You should see both the large-scale water/sand/grass/rock/snow zoning and fine, small-scale surface variation at once — two scales of detail coexisting, not just one.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
};
