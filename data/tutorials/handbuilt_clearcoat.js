import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_handbuilt_clearcoat",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "手工組出清漆效果：拆解 Principled BSDF 的內部原理", en: "Hand-Built Clearcoat: How Principled BSDF Works Under the Hood" },
  description: {
    zh: "原理化 BSDF（Principled BSDF）的 Clearcoat（清漆）其實不是魔法——本質就是「用 Fresnel 混合兩層材質」：底層是霧面的漫射 BSDF（Diffuse BSDF），表層是接近鏡面的光澤 BSDF（Glossy BSDF），越靠邊緣角度越容易看到表層清漆的反光。這篇教學帶你用最原始的 3 個節點（Diffuse BSDF／Glossy BSDF／Fresnel）親手組出這個效果，順便介紹兩個材質圖裡最基本的常數節點：RGB 跟數值（Value）。",
    en: "Principled BSDF's Clearcoat isn't magic — it's really just 'blend two materials by Fresnel': a matte Diffuse BSDF underneath, a near-mirror Glossy BSDF on top, with the top coat becoming more visible at grazing angles. This tutorial builds that effect by hand from 3 primitive nodes (Diffuse BSDF / Glossy BSDF / Fresnel), and along the way introduces the two most basic constant nodes in any material graph: RGB and Value.",
  },
  startGraph: {
    nodes: [
      { id: "t_hc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_hc_diffuse", typeId: "shader_diffuse_bsdf", x: 600, y: 100, params: { color: [0.55, 0.05, 0.05, 1] } },
    ],
    links: [{ id: "t_hc_l1", fromNode: "t_hc_diffuse", fromSocket: "bsdf", toNode: "t_hc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_hc_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_hc_mix", typeId: "shader_mix_shader", x: 1400, y: 140, params: {} },
      { id: "te_hc_diffuse", typeId: "shader_diffuse_bsdf", x: 1140, y: 20, params: { roughness: 0.5 } },
      { id: "te_hc_glossy", typeId: "shader_glossy_bsdf", x: 1140, y: 260, params: { color: [1, 1, 1, 1], roughness: 0.03 } },
      { id: "te_hc_rgb", typeId: "input_rgb", x: 880, y: 20, params: { color: [0.55, 0.05, 0.05, 1] } },
      { id: "te_hc_fresnel", typeId: "input_fresnel", x: 880, y: 260, params: { ior: 1.5 } },
      { id: "te_hc_value", typeId: "input_value", x: 620, y: 260, params: { value: 1.5 } },
    ],
    links: [
      { id: "te_hc_l1", fromNode: "te_hc_mix", fromSocket: "bsdf", toNode: "te_hc_out", toSocket: "surface" },
      { id: "te_hc_l2", fromNode: "te_hc_diffuse", fromSocket: "bsdf", toNode: "te_hc_mix", toSocket: "shader1" },
      { id: "te_hc_l3", fromNode: "te_hc_glossy", fromSocket: "bsdf", toNode: "te_hc_mix", toSocket: "shader2" },
      { id: "te_hc_l4", fromNode: "te_hc_rgb", fromSocket: "color", toNode: "te_hc_diffuse", toSocket: "color" },
      { id: "te_hc_l5", fromNode: "te_hc_fresnel", fromSocket: "fac", toNode: "te_hc_mix", toSocket: "fac" },
      { id: "te_hc_l6", fromNode: "te_hc_value", fromSocket: "value", toNode: "te_hc_fresnel", toSocket: "ior" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 RGB 節點提供底色", en: "Step 1: Feed the Base Color with an RGB Node" },
      instruction: {
        zh: "加入 RGB 節點（輸入 Input 分類），選一個顏色（例如深紅色）。\n\n把它接到漫射 BSDF（Diffuse BSDF）的顏色（Color）輸入。\n\n跟直接在 Diffuse BSDF 上選色不同：RGB 是獨立節點，之後如果同一個顏色要接到好幾個地方（例如同時當底色又當發光顏色），只要改這一個節點，全部都會跟著變。",
        en: "Add an RGB node (Input category) and pick a color (e.g. deep red).\n\nConnect it to Diffuse BSDF's Color input.\n\nUnlike picking a color directly on Diffuse BSDF, RGB is a standalone node — if the same color needs to feed multiple places later, you only need to change it here once.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_rgb", "color", "shader_diffuse_bsdf", "color"),
    },
    {
      title: { zh: "第二步：加入光澤 BSDF 當作表層清漆", en: "Step 2: Add Glossy BSDF as the Top Coat" },
      instruction: {
        zh: "加入光澤 BSDF（Glossy BSDF），顏色設成白色，粗糙度（Roughness）調到接近 0（幾乎鏡面）。\n\n這一層代表車漆表面那層透明的清漆塗層——先不用接到任何地方，下一步才會用到。",
        en: "Add a Glossy BSDF, set its color to white, and set Roughness near 0 (nearly mirror-like).\n\nThis layer represents the transparent clearcoat on top of the paint. Don't connect it anywhere yet — the next step needs it.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_glossy_bsdf") && anyNodeParamMatches(graph, "shader_glossy_bsdf", "roughness", (v) => v < 0.1),
    },
    {
      title: { zh: "第三步：用數值節點驅動菲涅爾的 IOR", en: "Step 3: Drive Fresnel's IOR with a Value Node" },
      instruction: {
        zh: "加入數值（Value）節點，數值設成 1.5（車漆清漆常見的折射率）。\n\n加入菲涅爾（Fresnel）節點，把數值節點接到它的 IOR 輸入——這樣以後想統一調整全部用到這個 IOR 的地方，只要改數值節點這一個地方就好。",
        en: "Add a Value node and set it to 1.5 (a typical IOR for automotive clearcoat).\n\nAdd a Fresnel node and connect the Value node to its IOR input — if multiple places later need this same IOR, you only need to change the Value node once.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_value", "value", "input_fresnel", "ior"),
    },
    {
      title: { zh: "第四步：用混合著色器把兩層依菲涅爾比例混合", en: "Step 4: Blend Both Layers by Fresnel with Mix Shader" },
      instruction: {
        zh: "加入混合著色器（Mix Shader）。\n\n把漫射 BSDF（底漆）接到第一個著色器輸入，光澤 BSDF（清漆）接到第二個。\n\n把菲涅爾的係數（Fac）接到混合著色器的 Fac。\n\n把混合著色器的輸出接到材質輸出。\n\n轉動預覽球體：正面應該主要看到底漆的顏色跟粗糙質感，邊緣則會越來越亮、越來越像鏡面——這就是 Principled BSDF 的 Clearcoat 插槽在底層做的事。",
        en: "Add a Mix Shader.\n\nConnect Diffuse BSDF (base paint) to the first Shader input, Glossy BSDF (clearcoat) to the second.\n\nConnect Fresnel's Fac to Mix Shader's Fac.\n\nConnect Mix Shader's output to the material output.\n\nOrbit the preview: head-on should mostly show the base paint's color and matte texture, while edges get progressively brighter and mirror-like — this is exactly what Principled BSDF's Clearcoat socket does under the hood.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac") &&
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface"),
    },
  ],
};
