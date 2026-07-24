export default {
  id: "tutorial_rust_weathering",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "程序化風化：生鏽金屬", en: "Procedural Weathering: Rusted Metal" },
  description: {
    zh: "用雜訊紋理（Noise Texture）產生的雜訊、經過顏色漸變（Color Ramp）轉成黑白遮罩，驅動混合著色器（Mix Shader）在同一個表面上混合「乾淨金屬」跟「鏽蝕」兩種材質——這是遊戲/影視資產最常用的程序化風化技巧。",
    en: "Use Noise Texture's output, remapped by a Color Ramp into a black/white mask, to drive Mix Shader blending 'clean metal' and 'rust' on the same surface — the classic procedural weathering technique used throughout games and VFX.",
  },
  startGraph: {
    nodes: [
      { id: "t_rust_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "t_rust_clean", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.75, 0.76, 0.78, 1], roughness: 0.25, metallic: 1 } },
      { id: "t_rust_rusty", typeId: "shader_principled_bsdf", x: 500, y: 300, params: { baseColor: [0.42, 0.18, 0.08, 1], roughness: 0.85, metallic: 0 } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_rust_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "te_rust_mix", typeId: "shader_mix_shader", x: 1100, y: 160, params: {} },
      { id: "te_rust_clean", typeId: "shader_principled_bsdf", x: 800, y: 20, params: { baseColor: [0.75, 0.76, 0.78, 1], roughness: 0.25, metallic: 1 } },
      { id: "te_rust_rusty", typeId: "shader_principled_bsdf", x: 800, y: 280, params: { baseColor: [0.42, 0.18, 0.08, 1], roughness: 0.85, metallic: 0 } },
      {
        id: "te_rust_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 400,
        params: { stops: [{ position: 0.45, color: [0, 0, 0, 0] }, { position: 0.55, color: [1, 1, 1, 1] }] },
      },
      { id: "te_rust_noise", typeId: "texture_noise", x: 320, y: 400, params: { scale: 4 } },
      { id: "te_rust_texcoord", typeId: "input_texture_coordinate", x: 80, y: 400, params: {} },
    ],
    links: [
      { id: "te_rust_l1", fromNode: "te_rust_mix", fromSocket: "bsdf", toNode: "te_rust_out", toSocket: "surface" },
      { id: "te_rust_l2", fromNode: "te_rust_clean", fromSocket: "bsdf", toNode: "te_rust_mix", toSocket: "shader1" },
      { id: "te_rust_l3", fromNode: "te_rust_rusty", fromSocket: "bsdf", toNode: "te_rust_mix", toSocket: "shader2" },
      { id: "te_rust_l4", fromNode: "te_rust_ramp", fromSocket: "alpha", toNode: "te_rust_mix", toSocket: "fac" },
      { id: "te_rust_l5", fromNode: "te_rust_noise", fromSocket: "fac", toNode: "te_rust_ramp", toSocket: "fac" },
      { id: "te_rust_l6", fromNode: "te_rust_texcoord", fromSocket: "generated", toNode: "te_rust_noise", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./rust_weathering.steps.js").then((m) => m.default),
};
