export default {
  id: "tutorial_checker_color_vs_fac",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "棋盤格的兩個輸出：Color 跟 Fac 差在哪", en: "Checker's Two Outputs: Color vs Fac" },
  description: {
    zh: "棋盤格紋理（Checker Texture）有兩個輸出：Color（直接兩色）跟 Fac（灰階 0/1）。很多人只用過 Color，但 Fac 才是拿棋盤格來切換「材質種類」（不只是顏色）的關鍵——這篇示範接 Fac 到混合著色器，做出真的一半塑膠、一半金屬的棋盤格，而不是同一種材質換兩個顏色。",
    en: "Checker Texture has two outputs: Color (two colors directly) and Fac (a 0/1 grayscale mask). Most people only ever use Color, but Fac is the key to using Checker to switch entire material types (not just colors) — this tutorial wires Fac into a Mix Shader to build a checkerboard that's genuinely half plastic, half metal, not just one material in two colors.",
  },
  startGraph: {
    nodes: [
      { id: "t_ccf_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ccf_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.85, 0.15, 0.15, 1], roughness: 0.3 } },
    ],
    links: [{ id: "t_ccf_l1", fromNode: "t_ccf_principled", fromSocket: "bsdf", toNode: "t_ccf_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ccf_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "te_ccf_mix", typeId: "shader_mix_shader", x: 1040, y: 160, params: {} },
      { id: "te_ccf_plastic", typeId: "shader_principled_bsdf", x: 780, y: 40, params: { baseColor: [0.85, 0.15, 0.15, 1], roughness: 0.3, metallic: 0 } },
      { id: "te_ccf_metal", typeId: "shader_principled_bsdf", x: 780, y: 300, params: { baseColor: [0.7, 0.7, 0.72, 1], roughness: 0.2, metallic: 1 } },
      { id: "te_ccf_texcoord", typeId: "input_texture_coordinate", x: 280, y: 220, params: {} },
      { id: "te_ccf_checker", typeId: "texture_checker", x: 540, y: 220, params: { scale: 6 } },
    ],
    links: [
      { id: "te_ccf_l1", fromNode: "te_ccf_mix", fromSocket: "bsdf", toNode: "te_ccf_out", toSocket: "surface" },
      { id: "te_ccf_l2", fromNode: "te_ccf_plastic", fromSocket: "bsdf", toNode: "te_ccf_mix", toSocket: "shader1" },
      { id: "te_ccf_l3", fromNode: "te_ccf_metal", fromSocket: "bsdf", toNode: "te_ccf_mix", toSocket: "shader2" },
      { id: "te_ccf_l4", fromNode: "te_ccf_texcoord", fromSocket: "generated", toNode: "te_ccf_checker", toSocket: "vector" },
      { id: "te_ccf_l5", fromNode: "te_ccf_checker", fromSocket: "fac", toNode: "te_ccf_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./checker_color_vs_fac.steps.js").then((m) => m.default),
};
