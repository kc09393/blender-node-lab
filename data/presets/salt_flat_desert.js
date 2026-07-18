export default {
  id: "salt_flat_desert",
  name: { zh: "鹽湖鹽田", en: "Salt Flat Desert" },
  description: {
    zh: "兩顆獨立的沃羅諾伊紋理分工：一顆用「到邊緣的距離」染出鹽田表面龜裂的多邊形紋路，另一顆用「N-球半徑」驅動凹凸，做出鹽結晶顆粒感的表面——同一批既有材質常見的裂紋手法，換一套配色跟晶粒質感就變成完全不同的地質場景。",
    en: "Two independent Voronoi Textures split the work: one uses Distance to Edge to draw the salt flat's cracked polygonal crust, the other uses N-Sphere Radius to drive Bump for a crystalline, granular surface — the same crack technique used elsewhere on this site, but a different palette and grain reads as an entirely different landscape.",
  },
  graph: {
    nodes: [
      { id: "sf_out", typeId: "output_material", x: 1080, y: 200, params: {} },
      { id: "sf_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "sf_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [9, 9, 9] } },
      { id: "sf_voronoi_crack", typeId: "texture_voronoi", x: 260, y: 60, params: { feature: "distance_to_edge", randomness: 1, scale: 14 } },
      {
        id: "sf_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.15, 0.14, 0.12, 1] },
            { position: 0.08, color: [0.92, 0.91, 0.88, 1] },
            { position: 1, color: [0.97, 0.96, 0.94, 1] },
          ],
        },
      },
      { id: "sf_voronoi_grain", typeId: "texture_voronoi", x: 260, y: 340, params: { feature: "n_sphere_radius", randomness: 1, scale: 45 } },
      { id: "sf_bump", typeId: "vector_bump", x: 540, y: 340, params: { strength: 0.3 } },
      { id: "sf_principled", typeId: "shader_principled_bsdf", x: 800, y: 200, params: { roughness: 0.55, metallic: 0 } },
    ],
    links: [
      { id: "sf_l1", fromNode: "sf_texcoord", fromSocket: "generated", toNode: "sf_mapping", toSocket: "vector" },
      { id: "sf_l2", fromNode: "sf_mapping", fromSocket: "vector", toNode: "sf_voronoi_crack", toSocket: "vector" },
      { id: "sf_l3", fromNode: "sf_voronoi_crack", fromSocket: "distance", toNode: "sf_ramp", toSocket: "fac" },
      { id: "sf_l4", fromNode: "sf_ramp", fromSocket: "color", toNode: "sf_principled", toSocket: "baseColor" },
      { id: "sf_l5", fromNode: "sf_mapping", fromSocket: "vector", toNode: "sf_voronoi_grain", toSocket: "vector" },
      { id: "sf_l6", fromNode: "sf_voronoi_grain", fromSocket: "distance", toNode: "sf_bump", toSocket: "height" },
      { id: "sf_l7", fromNode: "sf_bump", fromSocket: "normal", toNode: "sf_principled", toSocket: "normal" },
      { id: "sf_l8", fromNode: "sf_principled", fromSocket: "bsdf", toNode: "sf_out", toSocket: "surface" },
    ],
  },
};
