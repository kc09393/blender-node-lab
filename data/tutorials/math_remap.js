export default {
  id: "tutorial_math_remap",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "用 Math 節點縮小數值範圍", en: "Narrow a Range with Math Nodes" },
  description: {
    zh: "雜訊紋理（Noise Texture）的輸出永遠是 0-1，但很多時候你只想要一個比較窄的範圍（例如 0.2-0.5）。這個教學帶你用兩個數學（Math）節點手動做出「乘＋加」的縮放平移，理解映射範圍（Map Range）背後其實在做的事。",
    en: "Noise Texture always outputs 0-1, but often you only want a narrower range (like 0.2-0.5). This tutorial walks through using two Math nodes to manually scale-and-offset — understanding what Map Range does under the hood.",
  },
  startGraph: {
    nodes: [
      { id: "t_mr_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mr_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mr_l1", fromNode: "t_mr_principled", fromSocket: "bsdf", toNode: "t_mr_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mr_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mr_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_mr_math2", typeId: "converter_math", x: 560, y: 100, params: { operation: "add", value2: 0.2 } },
      { id: "te_mr_math1", typeId: "converter_math", x: 320, y: 100, params: { operation: "multiply", value2: 0.3 } },
      { id: "te_mr_noise", typeId: "texture_noise", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_mr_l1", fromNode: "te_mr_principled", fromSocket: "bsdf", toNode: "te_mr_out", toSocket: "surface" },
      { id: "te_mr_l2", fromNode: "te_mr_math2", fromSocket: "value", toNode: "te_mr_principled", toSocket: "roughness" },
      { id: "te_mr_l3", fromNode: "te_mr_math1", fromSocket: "value", toNode: "te_mr_math2", toSocket: "value1" },
      { id: "te_mr_l4", fromNode: "te_mr_noise", fromSocket: "fac", toNode: "te_mr_math1", toSocket: "value1" },
    ],
  },
  loadSteps: () => import("./math_remap.steps.js").then((m) => m.default),
};
