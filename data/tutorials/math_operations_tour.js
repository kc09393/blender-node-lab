export default {
  id: "tutorial_math_operations_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識 Math 節點：切換運算看四種效果", en: "Get to Know the Math Node: Four Operations, Four Looks" },
  description: {
    zh: "Math 節點的運算（Operation）下拉選單有 30 幾種選項，光看清單很難想像差別。這篇用同一條「雜訊→Math→發光」的線路，切換 4 種代表性運算（相加、吸附、大於、正弦），讓你直接看到「函式／捨入／比較／三角函數」這四大分類分別長什麼樣子。",
    en: "The Math node's Operation dropdown has 30-some options — hard to picture from the list alone. This tutorial keeps the same 'Noise → Math → Emission' wiring and switches through 4 representative operations (Add, Snap, Greater Than, Sine) so you can directly see what the Functions/Rounding/Comparison/Trigonometric categories each look like.",
  },
  startGraph: {
    nodes: [
      { id: "t_mot_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_mot_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: { baseColor: [0, 0, 0, 1], emissionStrength: 1 } },
    ],
    links: [{ id: "t_mot_l1", fromNode: "t_mot_principled", fromSocket: "bsdf", toNode: "t_mot_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mot_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_mot_principled", typeId: "shader_principled_bsdf", x: 1000, y: 100, params: { baseColor: [0, 0, 0, 1], emissionStrength: 1 } },
      { id: "te_mot_combine", typeId: "converter_combine_color", x: 780, y: 200, params: {} },
      { id: "te_mot_math", typeId: "converter_math", x: 540, y: 200, params: { operation: "sine" } },
      { id: "te_mot_noise", typeId: "texture_noise", x: 280, y: 200, params: {} },
    ],
    links: [
      { id: "te_mot_l1", fromNode: "te_mot_principled", fromSocket: "bsdf", toNode: "te_mot_out", toSocket: "surface" },
      { id: "te_mot_l2", fromNode: "te_mot_combine", fromSocket: "color", toNode: "te_mot_principled", toSocket: "emissionColor" },
      { id: "te_mot_l3", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "r" },
      { id: "te_mot_l4", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "g" },
      { id: "te_mot_l5", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "b" },
      { id: "te_mot_l6", fromNode: "te_mot_noise", fromSocket: "fac", toNode: "te_mot_math", toSocket: "value1" },
    ],
  },
  loadSteps: () => import("./math_operations_tour.steps.js").then((m) => m.default),
};
