export default {
  id: "tutorial_stone",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出石頭材質", en: "Make a Stone Material" },
  description: {
    zh: "用沃羅諾伊紋理（Voronoi Texture）的細胞圖案做出石頭的斑駁感，並用同一份資料同時驅動顏色跟粗糙度，讓縫隙看起來更真實。",
    en: "Use Voronoi Texture's cellular pattern to create a mottled stone look, driving both color and roughness from the same data so the cracks read as more realistic.",
  },
  startGraph: {
    nodes: [
      { id: "t_st_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_st_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_st_l1", fromNode: "t_st_principled", fromSocket: "bsdf", toNode: "t_st_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_st_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_st_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_st_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.2, 0.2, 0.22, 1] }, { position: 1, color: [0.6, 0.58, 0.55, 1] }] },
      },
      { id: "te_st_voronoi", typeId: "texture_voronoi", x: 320, y: 100, params: {} },
      { id: "te_st_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_st_l1", fromNode: "te_st_principled", fromSocket: "bsdf", toNode: "te_st_out", toSocket: "surface" },
      { id: "te_st_l2", fromNode: "te_st_ramp", fromSocket: "color", toNode: "te_st_principled", toSocket: "baseColor" },
      { id: "te_st_l3", fromNode: "te_st_voronoi", fromSocket: "distance", toNode: "te_st_ramp", toSocket: "fac" },
      { id: "te_st_l4", fromNode: "te_st_voronoi", fromSocket: "distance", toNode: "te_st_principled", toSocket: "roughness" },
      { id: "te_st_l5", fromNode: "te_st_texcoord", fromSocket: "generated", toNode: "te_st_voronoi", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./stone.steps.js").then((m) => m.default),
};
