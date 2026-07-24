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
  loadSteps: () => import("./principled_bsdf_tour.steps.js").then((m) => m.default),
};
