export default {
  id: "tutorial_bright_contrast",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "亮度/對比度：手機修圖同款滑桿", en: "Brightness/Contrast: Your Phone's Photo Sliders" },
  description: {
    zh: "亮度/對比度（Brightness/Contrast）節點跟手機相簿的「亮度/對比」滑桿是同一個概念——直接調整材質顏色的明暗與反差，不需要重新調色。",
    en: "The Brightness/Contrast node is the same concept as your phone photo app's brightness/contrast sliders — directly tweaking a material color's tone and range without redoing the whole palette.",
  },
  startGraph: {
    nodes: [
      { id: "t_bc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.5, 0.5, 1] } },
    ],
    links: [{ id: "t_bc_l1", fromNode: "t_bc_principled", fromSocket: "bsdf", toNode: "t_bc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_bc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_bc_bc", typeId: "color_bright_contrast", x: 300, y: 100, params: { color: [0.5, 0.5, 0.5, 1], bright: 0.15, contrast: 0.4 } },
    ],
    links: [
      { id: "te_bc_l1", fromNode: "te_bc_principled", fromSocket: "bsdf", toNode: "te_bc_out", toSocket: "surface" },
      { id: "te_bc_l2", fromNode: "te_bc_bc", fromSocket: "color", toNode: "te_bc_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./bright_contrast.steps.js").then((m) => m.default),
};
