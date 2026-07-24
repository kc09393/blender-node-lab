import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入菲涅爾與雜訊紋理", en: "Step 1: Add Fresnel and Noise Texture" },
      instruction: {
        zh: "加入菲涅爾（Fresnel）節點。\n\n加入雜訊紋理（Noise Texture）。\n\n這兩個節點之後會一起驅動顏色漸變：菲涅爾提供跟觀察角度有關的變化，雜訊紋理提供跟表面內部結構有關的變化。先不用接線，下一步才會用到。",
        en: "Add a Fresnel node and a Noise Texture — these will jointly drive the Color Ramp: Fresnel contributes angle-dependent variation, Noise Texture contributes internal-structure variation.",
      },
      check: (graph) => hasNodeOfType(graph, "input_fresnel") && hasNodeOfType(graph, "texture_noise"),
    },
    {
      title: { zh: "第二步：用 Math 把兩個驅動值加在一起", en: "Step 2: Add Them Together with Math" },
      instruction: {
        zh: "加入一個數學（Math）節點，運算選相加（Add）。\n\n把菲涅爾的係數（Fac）接到數學節點的第一個數值。\n\n把雜訊紋理的係數（Fac）接到第二個數值。\n\n這樣兩種變化來源會疊在一起，而不是只用其中一種。",
        en: "Add a Math node with operation Add, connect Fresnel's Fac to the first value and Noise Texture's Fac to the second — combining both sources of variation instead of using just one.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_fresnel", "fac", "converter_math", "value1") &&
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_math", "value2") &&
        anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "add"),
    },
    {
      title: { zh: "第三步：加入顏色漸變做出多彩漸層", en: "Step 3: Add a Color Ramp for the Multicolor Gradient" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp）。\n\n把數學節點的結果，接到顏色漸變的係數（Fac）。\n\n設定至少 4 個停駐點：白 → 藍 → 綠 → 橘 → 粉紅，這是蛋白石常見的變彩色序。",
        en: "Add a Color Ramp, connect the Math node's result to its Fac, and set up at least 4 stops for a white → blue → green → orange → pink gradient — a common opal play-of-color sequence.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_math", "value", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "converter_color_ramp", "stops", (v) => Array.isArray(v) && v.length >= 4),
    },
    {
      title: { zh: "第四步：接到原理化 BSDF 做出寶石光澤", en: "Step 4: Feed a Principled BSDF for the Gem Look" },
      instruction: {
        zh: "把顏色漸變的顏色（Color）輸出，接到原理化 BSDF（Principled BSDF）的底色（Base Color）。\n\n把粗糙度（Roughness）調到接近 0。\n\n小知識：真實的蛋白石其實是不透光的寶石，變彩效果來自內部的結構繞射，不是穿透折射，所以這裡用不透明的 Principled BSDF 呈現，比用玻璃 BSDF 更接近真實效果。\n\n用滑鼠拖曳旋轉預覽球體看看：菲涅爾會隨觀察角度改變，顏色漸變的取值也會跟著角度變，就做出「轉動角度、顏色跟著流動」的蛋白石效果了。",
        en: "Connect Color Ramp's Color output to Principled BSDF's Base Color, with Roughness near 0. Real opals are actually opaque gems — their play-of-color comes from internal structural diffraction, not light transmission — so an opaque Principled BSDF is a more accurate (and more visible) choice than a transmissive Glass BSDF. Orbit the preview sphere — since Fresnel changes with viewing angle, the Color Ramp's sampled position shifts too, producing the 'colors shift as you turn it' opal effect.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
};
