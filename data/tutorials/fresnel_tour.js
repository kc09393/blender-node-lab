export default {
  id: "tutorial_fresnel_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "認識菲涅爾：邊緣反光是怎麼來的", en: "Get to Know Fresnel: Where Edge Reflections Come From" },
  description: {
    zh: "現實中幾乎所有材質都是「正面看較不反光、側邊掠視角度反光更強」，這就是菲涅爾（Fresnel）效應。這篇先讓你直接看到 Fresnel 輸出的灰階樣子（中心暗、邊緣亮），再示範它最常見的實際用途：驅動 Mix Shader 疊一層邊緣反光。",
    en: "Almost every real material reflects less head-on and more at grazing angles — the Fresnel effect. This tutorial first shows you Fresnel's raw grayscale output (dark center, bright rim), then its most common real use: driving a Mix Shader to layer in edge reflection.",
  },
  startGraph: {
    nodes: [
      { id: "t_frt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_frt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_frt_l1", fromNode: "t_frt_principled", fromSocket: "bsdf", toNode: "t_frt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_frt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_frt_fresnel", typeId: "input_fresnel", x: 300, y: 300, params: { ior: 2.5 } },
      { id: "te_frt_diffuse", typeId: "shader_diffuse_bsdf", x: 560, y: 100, params: {} },
      { id: "te_frt_glossy", typeId: "shader_glossy_bsdf", x: 560, y: 380, params: { roughness: 0.05 } },
      { id: "te_frt_mix", typeId: "shader_mix_shader", x: 820, y: 200, params: {} },
    ],
    links: [
      { id: "te_frt_l1", fromNode: "te_frt_mix", fromSocket: "bsdf", toNode: "te_frt_out", toSocket: "surface" },
      { id: "te_frt_l2", fromNode: "te_frt_diffuse", fromSocket: "bsdf", toNode: "te_frt_mix", toSocket: "shader1" },
      { id: "te_frt_l3", fromNode: "te_frt_glossy", fromSocket: "bsdf", toNode: "te_frt_mix", toSocket: "shader2" },
      { id: "te_frt_l4", fromNode: "te_frt_fresnel", fromSocket: "fac", toNode: "te_frt_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./fresnel_tour.steps.js").then((m) => m.default),
};
