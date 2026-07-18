export default {
  id: "cork_board",
  name: { zh: "軟木塞板", en: "Cork Board" },
  description: {
    zh: "沃羅諾伊 F1 的細胞交界天生就是不規則的顆粒邊界，剛好用來模擬軟木本身粗細不一的顆粒孔隙；用同一個 Distance 輸出同時驅動顏色跟凹凸，讓深色孔隙看起來真的有一點凹陷。",
    en: "Voronoi F1's cell boundaries are naturally irregular grain edges — a good match for cork's uneven granular pores. The same Distance output drives both color and bump, so the darker pores read as genuinely recessed.",
  },
  graph: {
    nodes: [
      { id: "cork_out", typeId: "output_material", x: 1080, y: 200, params: {} },
      { id: "cork_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "cork_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [14, 14, 14] } },
      { id: "cork_voronoi", typeId: "texture_voronoi", x: 260, y: 160, params: { feature: "f1", randomness: 1, scale: 22 } },
      {
        id: "cork_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.35, 0.22, 0.12, 1] },
            { position: 0.5, color: [0.62, 0.44, 0.26, 1] },
            { position: 1, color: [0.74, 0.55, 0.34, 1] },
          ],
        },
      },
      { id: "cork_bump", typeId: "vector_bump", x: 540, y: 320, params: { strength: 0.4 } },
      { id: "cork_principled", typeId: "shader_principled_bsdf", x: 800, y: 200, params: { roughness: 0.85, metallic: 0 } },
    ],
    links: [
      { id: "cork_l1", fromNode: "cork_texcoord", fromSocket: "generated", toNode: "cork_mapping", toSocket: "vector" },
      { id: "cork_l2", fromNode: "cork_mapping", fromSocket: "vector", toNode: "cork_voronoi", toSocket: "vector" },
      { id: "cork_l3", fromNode: "cork_voronoi", fromSocket: "distance", toNode: "cork_ramp", toSocket: "fac" },
      { id: "cork_l4", fromNode: "cork_ramp", fromSocket: "color", toNode: "cork_principled", toSocket: "baseColor" },
      { id: "cork_l5", fromNode: "cork_voronoi", fromSocket: "distance", toNode: "cork_bump", toSocket: "height" },
      { id: "cork_l6", fromNode: "cork_bump", fromSocket: "normal", toNode: "cork_principled", toSocket: "normal" },
      { id: "cork_l7", fromNode: "cork_principled", fromSocket: "bsdf", toNode: "cork_out", toSocket: "surface" },
    ],
  },
};
