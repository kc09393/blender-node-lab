export default {
  id: "tutorial_neon_sign",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "做出發光招牌效果", en: "Make a Glowing Sign Effect" },
  description: {
    zh: "用波浪紋理（Wave Texture）產生的條紋圖案驅動發光（Emission）的發光強度，做出「有些地方亮、有些地方暗」的霓虹招牌效果，而不是整片均勻發光。",
    en: "Drive Emission's brightness with a Wave Texture pattern to create a neon sign that glows unevenly — bright in some areas, dark in others — instead of a flat uniform glow.",
  },
  startGraph: {
    nodes: [
      { id: "t_ns_out", typeId: "output_material", x: 900, y: 200, params: {} },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_ns_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ns_emission", typeId: "shader_emission", x: 620, y: 100, params: {} },
      { id: "te_ns_wave", typeId: "texture_wave", x: 340, y: 100, params: { waveType: "rings" } },
      { id: "te_ns_texcoord", typeId: "input_texture_coordinate", x: 100, y: 100, params: {} },
    ],
    links: [
      { id: "te_ns_l1", fromNode: "te_ns_emission", fromSocket: "bsdf", toNode: "te_ns_out", toSocket: "surface" },
      { id: "te_ns_l2", fromNode: "te_ns_wave", fromSocket: "fac", toNode: "te_ns_emission", toSocket: "strength" },
      { id: "te_ns_l3", fromNode: "te_ns_texcoord", fromSocket: "generated", toNode: "te_ns_wave", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./neon_sign.steps.js").then((m) => m.default),
};
