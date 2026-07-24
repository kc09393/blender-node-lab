export default {
  id: "tutorial_add_shader_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "認識加法著色器：跟 Mix Shader 差在哪", en: "Get to Know Add Shader: How It Differs from Mix Shader" },
  description: {
    zh: "加法著色器（Add Shader）長得跟混合著色器（Mix Shader）很像，都是把兩個材質接在一起，但 Add 沒有 Fac 比例——兩個輸入是直接相加，不是內插。這篇用兩個發光（Emission）節點直接示範這個差異：同樣兩個輸入，Add 出來的畫面會比 Mix（50/50）明顯更亮。",
    en: "Add Shader looks similar to Mix Shader — both combine two shaders — but Add has no Fac ratio: the two inputs are summed directly, not blended. This tutorial demonstrates the difference directly with two Emission nodes: for the same two inputs, Add's result is noticeably brighter than Mix at a 50/50 split.",
  },
  startGraph: {
    nodes: [
      { id: "t_ast_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ast_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ast_l1", fromNode: "t_ast_principled", fromSocket: "bsdf", toNode: "t_ast_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ast_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_ast_emit_r", typeId: "shader_emission", x: 400, y: 60, params: { color: [1, 0, 0, 1], strength: 2 } },
      { id: "te_ast_emit_g", typeId: "shader_emission", x: 400, y: 300, params: { color: [0, 1, 0, 1], strength: 1 } },
      { id: "te_ast_add", typeId: "shader_add_shader", x: 700, y: 180, params: {} },
      { id: "te_ast_mix", typeId: "shader_mix_shader", x: 700, y: 420, params: { fac: 0.5 } },
    ],
    links: [
      { id: "te_ast_l1", fromNode: "te_ast_mix", fromSocket: "bsdf", toNode: "te_ast_out", toSocket: "surface" },
      { id: "te_ast_l2", fromNode: "te_ast_emit_r", fromSocket: "bsdf", toNode: "te_ast_add", toSocket: "shader1" },
      { id: "te_ast_l3", fromNode: "te_ast_emit_g", fromSocket: "bsdf", toNode: "te_ast_add", toSocket: "shader2" },
      { id: "te_ast_l4", fromNode: "te_ast_emit_r", fromSocket: "bsdf", toNode: "te_ast_mix", toSocket: "shader1" },
      { id: "te_ast_l5", fromNode: "te_ast_emit_g", fromSocket: "bsdf", toNode: "te_ast_mix", toSocket: "shader2" },
    ],
  },
  loadSteps: () => import("./add_shader_tour.steps.js").then((m) => m.default),
};
