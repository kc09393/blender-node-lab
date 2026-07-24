export default {
  id: "tutorial_hsv_channel_pack",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "分離顏色：只調飽和度不動色相", en: "Separate Color: Adjust Only Saturation" },
  description: {
    zh: "分離顏色（Separate Color）跟合併顏色（Combine Color）現在支援 HSV／HSL 模式，可以把色相、飽和度、明度拆開單獨處理——這裡示範只把飽和度調高，讓沃羅諾伊紋理的隨機色塊變得更鮮豔，色相跟明暗完全不受影響。",
    en: "Separate Color and Combine Color now support HSV/HSL modes, letting you split hue, saturation, and value apart and adjust just one. Here we boost only saturation on a Voronoi Texture's random cell colors, making them more vivid without touching hue or brightness.",
  },
  startGraph: {
    nodes: [
      { id: "t_hcp_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_hcp_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_hcp_l1", fromNode: "t_hcp_principled", fromSocket: "bsdf", toNode: "t_hcp_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_hcp_out", typeId: "output_material", x: 1300, y: 160, params: {} },
      { id: "te_hcp_principled", typeId: "shader_principled_bsdf", x: 1040, y: 100, params: {} },
      { id: "te_hcp_combine", typeId: "converter_combine_color", x: 800, y: 100, params: { mode: "hsv" } },
      { id: "te_hcp_math", typeId: "converter_math", x: 560, y: 220, params: { operation: "multiply", value2: 2.5, clamp: true } },
      { id: "te_hcp_separate", typeId: "converter_separate_color", x: 320, y: 100, params: { mode: "hsv" } },
      { id: "te_hcp_voronoi", typeId: "texture_voronoi", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_hcp_l1", fromNode: "te_hcp_principled", fromSocket: "bsdf", toNode: "te_hcp_out", toSocket: "surface" },
      { id: "te_hcp_l2", fromNode: "te_hcp_combine", fromSocket: "color", toNode: "te_hcp_principled", toSocket: "baseColor" },
      { id: "te_hcp_l3", fromNode: "te_hcp_voronoi", fromSocket: "color", toNode: "te_hcp_separate", toSocket: "color" },
      { id: "te_hcp_l4", fromNode: "te_hcp_separate", fromSocket: "r", toNode: "te_hcp_combine", toSocket: "r" },
      { id: "te_hcp_l5", fromNode: "te_hcp_separate", fromSocket: "g", toNode: "te_hcp_math", toSocket: "value1" },
      { id: "te_hcp_l6", fromNode: "te_hcp_math", fromSocket: "value", toNode: "te_hcp_combine", toSocket: "g" },
      { id: "te_hcp_l7", fromNode: "te_hcp_separate", fromSocket: "b", toNode: "te_hcp_combine", toSocket: "b" },
    ],
  },
  loadSteps: () => import("./hsv_channel_pack.steps.js").then((m) => m.default),
};
