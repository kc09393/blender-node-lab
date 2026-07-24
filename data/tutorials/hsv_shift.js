export default {
  id: "tutorial_hsv_shift",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "色相偏移：一鍵換色", en: "Hue Shift: One-Click Recolor" },
  description: {
    zh: "用色相/飽和度/明度（Hue Saturation Value）節點調整顏色，比直接改 RGB 更直覺——轉 Hue 就能把紅色變藍色，不用重新調三個色版。",
    en: "Use the Hue Saturation Value node to adjust color — more intuitive than editing RGB directly. Turning Hue alone can flip red to blue without retuning three channels.",
  },
  startGraph: {
    nodes: [
      { id: "t_hsv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_hsv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_hsv_l1", fromNode: "t_hsv_principled", fromSocket: "bsdf", toNode: "t_hsv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_hsv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_hsv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      { id: "te_hsv_hsv", typeId: "color_hsv", x: 300, y: 100, params: { color: [0.8, 0.15, 0.15, 1], hue: 0.15, saturation: 1.4 } },
    ],
    links: [
      { id: "te_hsv_l1", fromNode: "te_hsv_principled", fromSocket: "bsdf", toNode: "te_hsv_out", toSocket: "surface" },
      { id: "te_hsv_l2", fromNode: "te_hsv_hsv", fromSocket: "color", toNode: "te_hsv_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./hsv_shift.steps.js").then((m) => m.default),
};
