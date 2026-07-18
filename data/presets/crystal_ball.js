export default {
  id: "crystal_ball",
  name: { zh: "水晶球", en: "Crystal Ball" },
  description: {
    zh: "玻璃 BSDF 當作水晶主體，另外用雜訊驅動一層白色漫射 BSDF、透過數學的「相乘」把整體影響力壓得很低（0.15），疊出水晶內部若隱若現的雲霧狀內含物。",
    en: "Glass BSDF forms the crystal body; a Noise-driven white Diffuse BSDF layer is scaled way down via Math's Multiply (0.15 overall) and mixed in, giving the crystal subtle, cloudy internal inclusions.",
  },
  graph: {
    nodes: [
      { id: "cball_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "cball_glass", typeId: "shader_glass_bsdf", x: 600, y: 60, params: { roughness: 0.02, ior: 1.52 } },
      { id: "cball_texcoord", typeId: "input_texture_coordinate", x: 0, y: 320, params: {} },
      { id: "cball_noise", typeId: "texture_noise", x: 260, y: 320, params: { scale: 3, detail: 4, distortion: 3 } },
      { id: "cball_mathmul", typeId: "converter_math", x: 540, y: 320, params: { operation: "multiply", value2: 0.15 } },
      { id: "cball_cloud", typeId: "shader_diffuse_bsdf", x: 600, y: 460, params: { color: [0.95, 0.95, 0.98, 1] } },
      { id: "cball_mix", typeId: "shader_mix_shader", x: 860, y: 220, params: {} },
    ],
    links: [
      { id: "cball_l1", fromNode: "cball_texcoord", fromSocket: "generated", toNode: "cball_noise", toSocket: "vector" },
      { id: "cball_l2", fromNode: "cball_noise", fromSocket: "fac", toNode: "cball_mathmul", toSocket: "value1" },
      { id: "cball_l3", fromNode: "cball_mathmul", fromSocket: "value", toNode: "cball_mix", toSocket: "fac" },
      { id: "cball_l4", fromNode: "cball_glass", fromSocket: "bsdf", toNode: "cball_mix", toSocket: "shader1" },
      { id: "cball_l5", fromNode: "cball_cloud", fromSocket: "bsdf", toNode: "cball_mix", toSocket: "shader2" },
      { id: "cball_l6", fromNode: "cball_mix", fromSocket: "bsdf", toNode: "cball_out", toSocket: "surface" },
    ],
  },
};
