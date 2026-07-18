export default {
  id: "old_leather_book",
  name: { zh: "舊皮革書封", en: "Old Leather Book Cover" },
  description: {
    zh: "兩個獨立雜訊紋理分工：一個驅動顏色漸變染出皮革色調，另一個專門驅動凹凸做出皮革的細紋顆粒；再用加法著色器疊一層絨光 BSDF 模擬皮革特有的織物感反光。",
    en: "Two independent Noise Textures split the work: one drives the Color Ramp for the leather tone, the other drives Bump for its fine grain; Add Shader layers Sheen BSDF on top for leather's characteristic fabric-like sheen.",
  },
  graph: {
    nodes: [
      { id: "leather_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "leather_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "leather_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [10, 10, 10] } },
      { id: "leather_noise1", typeId: "texture_noise", x: 260, y: 60, params: { detail: 8, roughness: 0.65, scale: 3 } },
      { id: "leather_noise2", typeId: "texture_noise", x: 260, y: 340, params: { detail: 4, roughness: 0.5, scale: 20 } },
      {
        id: "leather_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.1, 0.04, 0.02, 1] },
            { position: 0.5, color: [0.3, 0.14, 0.06, 1] },
            { position: 1, color: [0.42, 0.22, 0.1, 1] },
          ],
        },
      },
      { id: "leather_bump", typeId: "vector_bump", x: 540, y: 340, params: { strength: 0.5 } },
      { id: "leather_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: { roughness: 0.6 } },
      { id: "leather_sheen", typeId: "shader_sheen_bsdf", x: 800, y: 300, params: { color: [1, 0.9, 0.8, 1], roughness: 0.4 } },
      { id: "leather_add", typeId: "shader_add_shader", x: 1060, y: 200, params: {} },
    ],
    links: [
      { id: "leather_l1", fromNode: "leather_texcoord", fromSocket: "generated", toNode: "leather_mapping", toSocket: "vector" },
      { id: "leather_l2", fromNode: "leather_mapping", fromSocket: "vector", toNode: "leather_noise1", toSocket: "vector" },
      { id: "leather_l3", fromNode: "leather_mapping", fromSocket: "vector", toNode: "leather_noise2", toSocket: "vector" },
      { id: "leather_l4", fromNode: "leather_noise1", fromSocket: "fac", toNode: "leather_ramp", toSocket: "fac" },
      { id: "leather_l5", fromNode: "leather_ramp", fromSocket: "color", toNode: "leather_principled", toSocket: "baseColor" },
      { id: "leather_l6", fromNode: "leather_noise2", fromSocket: "fac", toNode: "leather_bump", toSocket: "height" },
      { id: "leather_l7", fromNode: "leather_bump", fromSocket: "normal", toNode: "leather_principled", toSocket: "normal" },
      { id: "leather_l8", fromNode: "leather_principled", fromSocket: "bsdf", toNode: "leather_add", toSocket: "shader1" },
      { id: "leather_l9", fromNode: "leather_sheen", fromSocket: "bsdf", toNode: "leather_add", toSocket: "shader2" },
      { id: "leather_l10", fromNode: "leather_add", fromSocket: "bsdf", toNode: "leather_out", toSocket: "surface" },
    ],
  },
};
