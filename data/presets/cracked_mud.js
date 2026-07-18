export default {
  id: "cracked_mud",
  name: { zh: "乾裂泥地", en: "Cracked Mud Desert" },
  description: {
    zh: "沃羅諾伊的到邊緣距離同時驅動顏色漸變（染出裂縫顏色）跟凹凸（做出裂縫真的凹陷的光影），一份資料兩種用途。",
    en: "Voronoi's Distance to Edge drives both the Color Ramp (tinting the cracks) and Bump (giving the cracks real recessed shading) — one dataset, two uses.",
  },
  graph: {
    nodes: [
      { id: "mud_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "mud_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "mud_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [4, 4, 4] } },
      { id: "mud_voronoi", typeId: "texture_voronoi", x: 260, y: 100, params: { feature: "distance_to_edge", randomness: 1 } },
      {
        id: "mud_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.03, 0.02, 1] },
            { position: 0.08, color: [0.35, 0.24, 0.15, 1] },
            { position: 1, color: [0.55, 0.4, 0.26, 1] },
          ],
        },
      },
      { id: "mud_bump", typeId: "vector_bump", x: 800, y: 240, params: { strength: 1.2 } },
      { id: "mud_bsdf", typeId: "shader_principled_bsdf", x: 1000, y: 100, params: { roughness: 0.95 } },
    ],
    links: [
      { id: "mud_l1", fromNode: "mud_texcoord", fromSocket: "generated", toNode: "mud_mapping", toSocket: "vector" },
      { id: "mud_l2", fromNode: "mud_mapping", fromSocket: "vector", toNode: "mud_voronoi", toSocket: "vector" },
      { id: "mud_l3", fromNode: "mud_voronoi", fromSocket: "distance", toNode: "mud_ramp", toSocket: "fac" },
      { id: "mud_l4", fromNode: "mud_ramp", fromSocket: "color", toNode: "mud_bsdf", toSocket: "baseColor" },
      { id: "mud_l5", fromNode: "mud_voronoi", fromSocket: "distance", toNode: "mud_bump", toSocket: "height" },
      { id: "mud_l6", fromNode: "mud_bump", fromSocket: "normal", toNode: "mud_bsdf", toSocket: "normal" },
      { id: "mud_l7", fromNode: "mud_bsdf", fromSocket: "bsdf", toNode: "mud_out", toSocket: "surface" },
    ],
  },
};
