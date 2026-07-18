export default {
  id: "brushed_metal",
  name: { zh: "拉絲金屬", en: "Brushed Metal" },
  description: {
    zh: "原理化 BSDF 的金屬度設 1，粗糙度改由雜訊紋理驅動（經映射範圍收在 0.15-0.45），做出深淺不一的髮絲紋反光。",
    en: "Principled BSDF's Metallic set to 1; Roughness is driven by Noise Texture (rescaled to 0.15-0.45 via Map Range) for the streaky brushed reflection.",
  },
  graph: {
    nodes: [
      { id: "metal_out", typeId: "output_material", x: 760, y: 160, params: {} },
      { id: "metal_principled", typeId: "shader_principled_bsdf", x: 460, y: 100, params: { baseColor: [0.72, 0.72, 0.75, 1], metallic: 1, alpha: 1 } },
      { id: "metal_texcoord", typeId: "input_texture_coordinate", x: 0, y: 260, params: {} },
      { id: "metal_noise", typeId: "texture_noise", x: 200, y: 260, params: { scale: 24 } },
      { id: "metal_maprange", typeId: "converter_map_range", x: 400, y: 260, params: { fromMin: 0, fromMax: 1, toMin: 0.15, toMax: 0.45 } },
    ],
    links: [
      { id: "metal_l1", fromNode: "metal_principled", fromSocket: "bsdf", toNode: "metal_out", toSocket: "surface" },
      { id: "metal_l2", fromNode: "metal_texcoord", fromSocket: "generated", toNode: "metal_noise", toSocket: "vector" },
      { id: "metal_l3", fromNode: "metal_noise", fromSocket: "fac", toNode: "metal_maprange", toSocket: "value" },
      { id: "metal_l4", fromNode: "metal_maprange", fromSocket: "value", toNode: "metal_principled", toSocket: "roughness" },
    ],
  },
};
