export default {
  id: "tutorial_gamma_correction",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "伽瑪：次方曲線調中間調", en: "Gamma: A Power-Curve Midtone Adjustment" },
  description: {
    zh: "伽瑪（Gamma）節點的運算就是 pow(顏色, gamma)——伽瑪大於 1 會讓中間調變暗，小於 1 會讓中間調變亮，常用來校正貼圖或快速調整材質的明暗曲線。",
    en: "The Gamma node simply computes pow(color, gamma) — values above 1 darken midtones, below 1 brighten them. Commonly used to correct texture data or quickly reshape a material's tonal curve.",
  },
  startGraph: {
    nodes: [
      { id: "t_ga_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ga_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.5, 0.5, 1] } },
    ],
    links: [{ id: "t_ga_l1", fromNode: "t_ga_principled", fromSocket: "bsdf", toNode: "t_ga_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ga_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ga_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_ga_gamma", typeId: "color_gamma", x: 300, y: 100, params: { color: [0.5, 0.5, 0.5, 1], gamma: 3 } },
    ],
    links: [
      { id: "te_ga_l1", fromNode: "te_ga_principled", fromSocket: "bsdf", toNode: "te_ga_out", toSocket: "surface" },
      { id: "te_ga_l2", fromNode: "te_ga_gamma", fromSocket: "color", toNode: "te_ga_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./gamma_correction.steps.js").then((m) => m.default),
};
