export default {
  id: "snake_scales",
  name: { zh: "蛇鱗", en: "Snake Scales" },
  description: {
    zh: "兩個沃羅諾伊紋理分工：一個算到邊緣的距離驅動凹凸，做出鱗片間的溝紋；另一個算細胞距離接顏色漸變，染出每片鱗片的色塊變化。",
    en: "Two Voronoi textures split the work: one computes Distance to Edge to drive Bump for the grooves between scales, the other computes cell distance feeding a Color Ramp for each scale's own color variation.",
  },
  graph: {
    nodes: [
      { id: "snake_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "snake_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "snake_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [12, 12, 12] } },
      { id: "snake_voronoi", typeId: "texture_voronoi", x: 260, y: 100, params: { feature: "distance_to_edge", randomness: 0.35 } },
      {
        id: "snake_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.02, 0.1, 0.03, 1] },
            { position: 0.5, color: [0.12, 0.35, 0.1, 1] },
            { position: 1, color: [0.55, 0.5, 0.15, 1] },
          ],
        },
      },
      { id: "snake_voronoi_col", typeId: "texture_voronoi", x: 260, y: 380, params: { scale: 12, randomness: 0.35 } },
      { id: "snake_bump", typeId: "vector_bump", x: 800, y: 260, params: { strength: 0.6 } },
      { id: "snake_bsdf", typeId: "shader_principled_bsdf", x: 1040, y: 100, params: { roughness: 0.3 } },
    ],
    links: [
      { id: "snake_l1", fromNode: "snake_texcoord", fromSocket: "generated", toNode: "snake_mapping", toSocket: "vector" },
      { id: "snake_l2", fromNode: "snake_mapping", fromSocket: "vector", toNode: "snake_voronoi", toSocket: "vector" },
      { id: "snake_l3", fromNode: "snake_mapping", fromSocket: "vector", toNode: "snake_voronoi_col", toSocket: "vector" },
      { id: "snake_l4", fromNode: "snake_voronoi_col", fromSocket: "distance", toNode: "snake_ramp", toSocket: "fac" },
      { id: "snake_l5", fromNode: "snake_ramp", fromSocket: "color", toNode: "snake_bsdf", toSocket: "baseColor" },
      { id: "snake_l6", fromNode: "snake_voronoi", fromSocket: "distance", toNode: "snake_bump", toSocket: "height" },
      { id: "snake_l7", fromNode: "snake_bump", fromSocket: "normal", toNode: "snake_bsdf", toSocket: "normal" },
      { id: "snake_l8", fromNode: "snake_bsdf", fromSocket: "bsdf", toNode: "snake_out", toSocket: "surface" },
    ],
  },
};
