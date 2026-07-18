export default {
  id: "lizard_skin",
  name: { zh: "蜥蜴粗糙皮膚", en: "Lizard Skin" },
  description: {
    zh: "沃羅諾伊的到邊緣距離同時驅動顏色漸變（鱗片色塊）跟凹凸（鱗片間的溝紋），另用獨立雜訊接映射範圍驅動粗糙度，讓鱗片本身的反光程度也有變化。",
    en: "Voronoi's Distance to Edge drives both the Color Ramp (scale coloring) and Bump (grooves between scales); an independent Noise Texture through Map Range drives Roughness so the scales themselves vary in shininess too.",
  },
  graph: {
    nodes: [
      { id: "lizard_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "lizard_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "lizard_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [14, 14, 14] } },
      { id: "lizard_voronoi", typeId: "texture_voronoi", x: 260, y: 60, params: { feature: "distance_to_edge", randomness: 0.4 } },
      {
        id: "lizard_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.08, 0.15, 0.06, 1] },
            { position: 0.5, color: [0.25, 0.4, 0.12, 1] },
            { position: 1, color: [0.5, 0.55, 0.2, 1] },
          ],
        },
      },
      { id: "lizard_bump", typeId: "vector_bump", x: 800, y: 60, params: { strength: 0.8 } },
      { id: "lizard_noise", typeId: "texture_noise", x: 260, y: 380, params: { detail: 4, roughness: 0.5, scale: 8 } },
      { id: "lizard_rough_map", typeId: "converter_map_range", x: 540, y: 380, params: { fromMin: 0, fromMax: 1, toMin: 0.3, toMax: 0.7 } },
      { id: "lizard_bsdf", typeId: "shader_principled_bsdf", x: 1060, y: 200, params: {} },
    ],
    links: [
      { id: "lizard_l1", fromNode: "lizard_texcoord", fromSocket: "generated", toNode: "lizard_mapping", toSocket: "vector" },
      { id: "lizard_l2", fromNode: "lizard_mapping", fromSocket: "vector", toNode: "lizard_voronoi", toSocket: "vector" },
      { id: "lizard_l3", fromNode: "lizard_mapping", fromSocket: "vector", toNode: "lizard_noise", toSocket: "vector" },
      { id: "lizard_l4", fromNode: "lizard_voronoi", fromSocket: "distance", toNode: "lizard_ramp", toSocket: "fac" },
      { id: "lizard_l5", fromNode: "lizard_ramp", fromSocket: "color", toNode: "lizard_bsdf", toSocket: "baseColor" },
      { id: "lizard_l6", fromNode: "lizard_voronoi", fromSocket: "distance", toNode: "lizard_bump", toSocket: "height" },
      { id: "lizard_l7", fromNode: "lizard_bump", fromSocket: "normal", toNode: "lizard_bsdf", toSocket: "normal" },
      { id: "lizard_l8", fromNode: "lizard_noise", fromSocket: "fac", toNode: "lizard_rough_map", toSocket: "value" },
      { id: "lizard_l9", fromNode: "lizard_rough_map", fromSocket: "value", toNode: "lizard_bsdf", toSocket: "roughness" },
      { id: "lizard_l10", fromNode: "lizard_bsdf", fromSocket: "bsdf", toNode: "lizard_out", toSocket: "surface" },
    ],
  },
};
