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
  loadSteps: () => import("./handbuilt_clearcoat.steps.js").then((m) => m.default),
};
