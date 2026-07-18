export default {
  id: "galvanized_zinc",
  name: { zh: "鍍鋅浪板", en: "Galvanized Zinc Sheet" },
  description: {
    zh: "鍍鋅鋼板特有的『花紋 Spangle』來自沃羅諾伊的 Color 輸出——每個細胞隨機分到一個顏色，用混合顏色以低比例（0.22）疊回基底鋼灰色，比直接顯示 Voronoi Color 更接近真實鍍鋅板那種若隱若現的結晶紋路，而不是一格一格的色塊拼貼。",
    en: "Galvanized steel's characteristic 'spangle' pattern comes from Voronoi's Color output — each cell gets a random color — blended back into a base steel-gray at a low ratio (0.22) via Mix Color. This reads as the subtle crystalline pattern of real galvanized sheet, rather than an obvious tiled patchwork of flat colors.",
  },
  graph: {
    nodes: [
      { id: "gz_out", typeId: "output_material", x: 1080, y: 200, params: {} },
      { id: "gz_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "gz_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [12, 12, 12] } },
      { id: "gz_voronoi", typeId: "texture_voronoi", x: 260, y: 160, params: { feature: "f1", randomness: 1, scale: 18 } },
      { id: "gz_mix", typeId: "color_mix", x: 540, y: 100, params: { fac: 0.22, a: [0.72, 0.73, 0.75, 1], mode: "mix" } },
      { id: "gz_bump", typeId: "vector_bump", x: 540, y: 320, params: { strength: 0.25 } },
      { id: "gz_principled", typeId: "shader_principled_bsdf", x: 800, y: 200, params: { roughness: 0.4, metallic: 1 } },
    ],
    links: [
      { id: "gz_l1", fromNode: "gz_texcoord", fromSocket: "generated", toNode: "gz_mapping", toSocket: "vector" },
      { id: "gz_l2", fromNode: "gz_mapping", fromSocket: "vector", toNode: "gz_voronoi", toSocket: "vector" },
      { id: "gz_l3", fromNode: "gz_voronoi", fromSocket: "color", toNode: "gz_mix", toSocket: "b" },
      { id: "gz_l4", fromNode: "gz_mix", fromSocket: "color", toNode: "gz_principled", toSocket: "baseColor" },
      { id: "gz_l5", fromNode: "gz_voronoi", fromSocket: "distance", toNode: "gz_bump", toSocket: "height" },
      { id: "gz_l6", fromNode: "gz_bump", fromSocket: "normal", toNode: "gz_principled", toSocket: "normal" },
      { id: "gz_l7", fromNode: "gz_principled", fromSocket: "bsdf", toNode: "gz_out", toSocket: "surface" },
    ],
  },
};
