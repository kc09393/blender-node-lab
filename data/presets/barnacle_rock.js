export default {
  id: "barnacle_rock",
  name: { zh: "藤壺礁石", en: "Barnacle-Crusted Rock" },
  description: {
    zh: "沃羅諾伊的 N-球半徑特徵天生是一顆顆圓潤凸起，正好用來模擬礁石上密密麻麻的藤壺；另用獨立雜訊染出海藻與岩石交錯的深淺色調。",
    en: "Voronoi's N-Sphere Radius feature naturally gives rounded, individual bumps — a good fit for barnacles crusting a rock surface; a separate Noise Texture tints the mottled tones of algae and stone.",
  },
  graph: {
    nodes: [
      { id: "barn_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "barn_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "barn_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [10, 10, 10] } },
      { id: "barn_voronoi", typeId: "texture_voronoi", x: 260, y: 60, params: { feature: "n_sphere_radius", randomness: 1, scale: 20 } },
      { id: "barn_bump", typeId: "vector_bump", x: 540, y: 60, params: { strength: 0.8 } },
      { id: "barn_noise", typeId: "texture_noise", x: 260, y: 320, params: { scale: 4, detail: 4 } },
      {
        id: "barn_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 320,
        params: {
          stops: [
            { position: 0, color: [0.08, 0.09, 0.08, 1] },
            { position: 0.4, color: [0.25, 0.28, 0.2, 1] },
            { position: 1, color: [0.35, 0.3, 0.15, 1] },
          ],
        },
      },
      { id: "barn_principled", typeId: "shader_principled_bsdf", x: 820, y: 200, params: { roughness: 0.9 } },
    ],
    links: [
      { id: "barn_l1", fromNode: "barn_texcoord", fromSocket: "generated", toNode: "barn_mapping", toSocket: "vector" },
      { id: "barn_l2", fromNode: "barn_mapping", fromSocket: "vector", toNode: "barn_voronoi", toSocket: "vector" },
      { id: "barn_l3", fromNode: "barn_voronoi", fromSocket: "distance", toNode: "barn_bump", toSocket: "height" },
      { id: "barn_l4", fromNode: "barn_bump", fromSocket: "normal", toNode: "barn_principled", toSocket: "normal" },
      { id: "barn_l5", fromNode: "barn_mapping", fromSocket: "vector", toNode: "barn_noise", toSocket: "vector" },
      { id: "barn_l6", fromNode: "barn_noise", fromSocket: "fac", toNode: "barn_ramp", toSocket: "fac" },
      { id: "barn_l7", fromNode: "barn_ramp", fromSocket: "color", toNode: "barn_principled", toSocket: "baseColor" },
      { id: "barn_l8", fromNode: "barn_principled", fromSocket: "bsdf", toNode: "barn_out", toSocket: "surface" },
    ],
  },
};
