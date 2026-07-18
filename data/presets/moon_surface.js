export default {
  id: "moon_surface",
  name: { zh: "月球表面", en: "Moon Surface" },
  description: {
    zh: "沃羅諾伊的到邊緣距離（Distance to Edge）天生就是「細胞交界處變亮」的效果，拿來當隕石坑邊緣的凸起再適合不過；另用一組獨立雜訊染出月塵的灰階深淺變化。",
    en: "Voronoi's Distance to Edge naturally brightens at cell boundaries — a perfect fit for crater rims; a separate independent Noise Texture tints the grayscale variation of lunar dust.",
  },
  graph: {
    nodes: [
      { id: "moon_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "moon_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "moon_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [6, 6, 6] } },
      { id: "moon_voronoi", typeId: "texture_voronoi", x: 260, y: 80, params: { feature: "distance_to_edge", randomness: 1 } },
      { id: "moon_bump", typeId: "vector_bump", x: 540, y: 80, params: { strength: 0.6 } },
      { id: "moon_noise", typeId: "texture_noise", x: 260, y: 320, params: { scale: 3, detail: 4 } },
      {
        id: "moon_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 320,
        params: {
          stops: [
            { position: 0, color: [0.32, 0.31, 0.3, 1] },
            { position: 0.5, color: [0.42, 0.41, 0.4, 1] },
            { position: 1, color: [0.55, 0.53, 0.5, 1] },
          ],
        },
      },
      { id: "moon_principled", typeId: "shader_principled_bsdf", x: 860, y: 200, params: { roughness: 0.95, metallic: 0 } },
    ],
    links: [
      { id: "moon_l1", fromNode: "moon_texcoord", fromSocket: "generated", toNode: "moon_mapping", toSocket: "vector" },
      { id: "moon_l2", fromNode: "moon_mapping", fromSocket: "vector", toNode: "moon_voronoi", toSocket: "vector" },
      { id: "moon_l3", fromNode: "moon_voronoi", fromSocket: "distance", toNode: "moon_bump", toSocket: "height" },
      { id: "moon_l4", fromNode: "moon_bump", fromSocket: "normal", toNode: "moon_principled", toSocket: "normal" },
      { id: "moon_l5", fromNode: "moon_mapping", fromSocket: "vector", toNode: "moon_noise", toSocket: "vector" },
      { id: "moon_l6", fromNode: "moon_noise", fromSocket: "fac", toNode: "moon_ramp", toSocket: "fac" },
      { id: "moon_l7", fromNode: "moon_ramp", fromSocket: "color", toNode: "moon_principled", toSocket: "baseColor" },
      { id: "moon_l8", fromNode: "moon_principled", fromSocket: "bsdf", toNode: "moon_out", toSocket: "surface" },
    ],
  },
};
