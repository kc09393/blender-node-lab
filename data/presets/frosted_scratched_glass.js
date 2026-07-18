export default {
  id: "frosted_scratched_glass",
  name: { zh: "磨砂刮痕玻璃", en: "Frosted Scratched Glass" },
  description: {
    zh: "波浪紋理的條紋（模擬刮痕方向）驅動混合著色器，在清澈玻璃 BSDF 跟粗糙玻璃 BSDF 之間切換，做出玻璃上一條條刮痕的效果。",
    en: "Wave Texture's bands (simulating scratch direction) drive a Mix Shader that switches between a clear Glass BSDF and a rough Glass BSDF, creating streaky scratches across the glass.",
  },
  graph: {
    nodes: [
      { id: "fsg_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "fsg_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "fsg_wave", typeId: "texture_wave", x: 0, y: 60, params: { waveType: "bands", direction: "x", scale: 40, distortion: 6 } },
      { id: "fsg_math", typeId: "converter_math", x: 260, y: 60, params: { operation: "multiply", value2: 0.35 } },
      { id: "fsg_glass_clear", typeId: "shader_glass_bsdf", x: 540, y: 0, params: { color: [1, 1, 1, 1], roughness: 0.02, ior: 1.5 } },
      { id: "fsg_glass_scratch", typeId: "shader_glass_bsdf", x: 540, y: 260, params: { color: [1, 1, 1, 1], roughness: 0.3, ior: 1.5 } },
      { id: "fsg_mix", typeId: "shader_mix_shader", x: 800, y: 130, params: { fac: 0.25 } },
    ],
    links: [
      { id: "fsg_l1", fromNode: "fsg_texcoord", fromSocket: "generated", toNode: "fsg_wave", toSocket: "vector" },
      { id: "fsg_l2", fromNode: "fsg_wave", fromSocket: "fac", toNode: "fsg_math", toSocket: "value1" },
      { id: "fsg_l3", fromNode: "fsg_math", fromSocket: "value", toNode: "fsg_mix", toSocket: "fac" },
      { id: "fsg_l4", fromNode: "fsg_glass_clear", fromSocket: "bsdf", toNode: "fsg_mix", toSocket: "shader1" },
      { id: "fsg_l5", fromNode: "fsg_glass_scratch", fromSocket: "bsdf", toNode: "fsg_mix", toSocket: "shader2" },
      { id: "fsg_l6", fromNode: "fsg_mix", fromSocket: "bsdf", toNode: "fsg_out", toSocket: "surface" },
    ],
  },
};
