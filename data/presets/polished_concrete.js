export default {
  id: "polished_concrete",
  name: { zh: "拋光水泥地板", en: "Polished Concrete Floor" },
  description: {
    zh: "一顆大尺度雜訊染出水泥表面的灰階霧狀色差，另一顆獨立的細尺度雜訊透過映射範圍把粗糙度收窄在很小的區間，模擬拋光面上依然存在的微小光澤落差——不是完全均勻的鏡面。",
    en: "One large-scale Noise Texture tints the concrete's cloudy grayscale variation; a separate fine-scale Noise drives Roughness through a narrow Map Range, simulating the subtle sheen variance a polished floor still has — never a perfectly uniform mirror.",
  },
  graph: {
    nodes: [
      { id: "pc_out", typeId: "output_material", x: 1080, y: 200, params: {} },
      { id: "pc_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "pc_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [6, 6, 6] } },
      { id: "pc_noise_color", typeId: "texture_noise", x: 260, y: 60, params: { scale: 6, detail: 8, roughness: 0.55 } },
      {
        id: "pc_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.5, 0.49, 0.47, 1] },
            { position: 0.5, color: [0.58, 0.57, 0.55, 1] },
            { position: 1, color: [0.66, 0.65, 0.62, 1] },
          ],
        },
      },
      { id: "pc_noise_rough", typeId: "texture_noise", x: 260, y: 340, params: { scale: 30, detail: 4 } },
      { id: "pc_maprange", typeId: "converter_map_range", x: 540, y: 340, params: { fromMin: 0, fromMax: 1, toMin: 0.1, toMax: 0.32 } },
      { id: "pc_principled", typeId: "shader_principled_bsdf", x: 800, y: 200, params: { metallic: 0 } },
    ],
    links: [
      { id: "pc_l1", fromNode: "pc_texcoord", fromSocket: "generated", toNode: "pc_mapping", toSocket: "vector" },
      { id: "pc_l2", fromNode: "pc_mapping", fromSocket: "vector", toNode: "pc_noise_color", toSocket: "vector" },
      { id: "pc_l3", fromNode: "pc_noise_color", fromSocket: "fac", toNode: "pc_ramp", toSocket: "fac" },
      { id: "pc_l4", fromNode: "pc_ramp", fromSocket: "color", toNode: "pc_principled", toSocket: "baseColor" },
      { id: "pc_l5", fromNode: "pc_mapping", fromSocket: "vector", toNode: "pc_noise_rough", toSocket: "vector" },
      { id: "pc_l6", fromNode: "pc_noise_rough", fromSocket: "fac", toNode: "pc_maprange", toSocket: "value" },
      { id: "pc_l7", fromNode: "pc_maprange", fromSocket: "value", toNode: "pc_principled", toSocket: "roughness" },
      { id: "pc_l8", fromNode: "pc_principled", fromSocket: "bsdf", toNode: "pc_out", toSocket: "surface" },
    ],
  },
};
