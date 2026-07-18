import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_opal_gem_gradient",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "蛋白石效果：雙重驅動的漸層", en: "Opal Gem: A Gradient Driven by Two Sources" },
  description: {
    zh: "真正好看的漸層效果很少只靠單一輸入驅動——蛋白石（Opal）的變彩效果同時受「觀察角度」跟「內部雜訊結構」影響。這篇教學把菲涅爾（Fresnel）跟雜訊紋理（Noise Texture）用數學節點結合成一個驅動值，再接到顏色漸變（Color Ramp）做出比單一輸入更有機、更不規則的多彩漸層。",
    en: "The best-looking gradients rarely come from a single input — an opal's play-of-color depends on both viewing angle and its internal noise structure. This tutorial combines Fresnel and Noise Texture with a Math node into one driving value, feeding a Color Ramp for a more organic, irregular multicolor gradient than either input alone could produce.",
  },
  startGraph: {
    nodes: [
      { id: "t_op_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_op_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.08, metallic: 0 } },
    ],
    links: [{ id: "t_op_l1", fromNode: "t_op_principled", fromSocket: "bsdf", toNode: "t_op_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_op_out", typeId: "output_material", x: 1500, y: 220, params: {} },
      { id: "te_op_principled", typeId: "shader_principled_bsdf", x: 1220, y: 120, params: { roughness: 0.08, metallic: 0 } },
      {
        id: "te_op_ramp",
        typeId: "converter_color_ramp",
        x: 960,
        y: 120,
        params: {
          stops: [
            { position: 0, color: [0.9, 0.92, 0.95, 1] },
            { position: 0.25, color: [0.2, 0.55, 0.9, 1] },
            { position: 0.5, color: [0.25, 0.85, 0.4, 1] },
            { position: 0.75, color: [0.95, 0.6, 0.15, 1] },
            { position: 1, color: [0.9, 0.25, 0.55, 1] },
          ],
        },
      },
      { id: "te_op_add", typeId: "converter_math", x: 700, y: 120, params: { operation: "add" } },
      { id: "te_op_fresnel", typeId: "input_fresnel", x: 460, y: 40, params: { ior: 1.4 } },
      { id: "te_op_noise", typeId: "texture_noise", x: 460, y: 240, params: { scale: 6, detail: 4 } },
    ],
    links: [
      { id: "te_op_l1", fromNode: "te_op_principled", fromSocket: "bsdf", toNode: "te_op_out", toSocket: "surface" },
      { id: "te_op_l2", fromNode: "te_op_ramp", fromSocket: "color", toNode: "te_op_principled", toSocket: "baseColor" },
      { id: "te_op_l3", fromNode: "te_op_add", fromSocket: "value", toNode: "te_op_ramp", toSocket: "fac" },
      { id: "te_op_l4", fromNode: "te_op_fresnel", fromSocket: "fac", toNode: "te_op_add", toSocket: "value1" },
      { id: "te_op_l5", fromNode: "te_op_noise", fromSocket: "fac", toNode: "te_op_add", toSocket: "value2" },
    ],
  },
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
