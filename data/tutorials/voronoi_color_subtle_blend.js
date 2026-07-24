export default {
  id: "tutorial_voronoi_color_subtle_blend",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "讓沃羅諾伊色塊變得若隱若現：低比例混色", en: "Making Voronoi Cells Subtle: Low-Ratio Color Blending" },
  description: {
    zh: "沃羅諾伊紋理（Voronoi Texture）的顏色（Color）輸出直接接到底色，每個細胞會是一塊隨機的鮮豔色塊——很搶眼，但很少有真實材質長這樣。這篇教鍍鋅浪板（Galvanized Zinc）這個材質用的技巧：不要直接顯示 Voronoi 的顏色，而是用混合顏色（Mix Color）把它以很低的比例（例如 0.22）疊回一個基底色，色塊立刻從「拼貼馬賽克」變成金屬表面本身那種若隱若現的結晶紋路。",
    en: "Wiring Voronoi Texture's Color output straight into a base color gives each cell a bold random flat color — striking, but few real materials actually look like that. This tutorial teaches the trick used in the Galvanized Zinc preset: instead of showing Voronoi's Color directly, blend it into a base tone at a low ratio (e.g. 0.22) using Mix Color. The cells instantly go from looking like a tiled mosaic to the subtle crystalline pattern a real metal surface has.",
  },
  startGraph: {
    nodes: [
      { id: "t_vcsb_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_vcsb_principled", typeId: "shader_principled_bsdf", x: 320, y: 200, params: { baseColor: [0.72, 0.73, 0.75, 1], roughness: 0.4, metallic: 1 } },
    ],
    links: [{ id: "t_vcsb_l1", fromNode: "t_vcsb_principled", fromSocket: "bsdf", toNode: "t_vcsb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vcsb_out", typeId: "output_material", x: 1160, y: 220 },
      { id: "te_vcsb_texcoord", typeId: "input_texture_coordinate", x: -80, y: 160 },
      { id: "te_vcsb_mapping", typeId: "vector_mapping", x: 180, y: 160, params: { scale: [12, 12, 12] } },
      { id: "te_vcsb_voronoi", typeId: "texture_voronoi", x: 440, y: 160, params: { feature: "f1", randomness: 1, scale: 18 } },
      { id: "te_vcsb_mix", typeId: "color_mix", x: 700, y: 100, params: { fac: 0.22, a: [0.72, 0.73, 0.75, 1], mode: "mix" } },
      { id: "te_vcsb_bump", typeId: "vector_bump", x: 700, y: 320, params: { strength: 0.25 } },
      { id: "te_vcsb_principled", typeId: "shader_principled_bsdf", x: 920, y: 220, params: { roughness: 0.4, metallic: 1 } },
    ],
    links: [
      { id: "te_vcsb_l1", fromNode: "te_vcsb_texcoord", fromSocket: "generated", toNode: "te_vcsb_mapping", toSocket: "vector" },
      { id: "te_vcsb_l2", fromNode: "te_vcsb_mapping", fromSocket: "vector", toNode: "te_vcsb_voronoi", toSocket: "vector" },
      { id: "te_vcsb_l3", fromNode: "te_vcsb_voronoi", fromSocket: "color", toNode: "te_vcsb_mix", toSocket: "b" },
      { id: "te_vcsb_l4", fromNode: "te_vcsb_mix", fromSocket: "color", toNode: "te_vcsb_principled", toSocket: "baseColor" },
      { id: "te_vcsb_l5", fromNode: "te_vcsb_voronoi", fromSocket: "distance", toNode: "te_vcsb_bump", toSocket: "height" },
      { id: "te_vcsb_l6", fromNode: "te_vcsb_bump", fromSocket: "normal", toNode: "te_vcsb_principled", toSocket: "normal" },
      { id: "te_vcsb_l7", fromNode: "te_vcsb_principled", fromSocket: "bsdf", toNode: "te_vcsb_out", toSocket: "surface" },
    ],
  },
  loadSteps: () => import("./voronoi_color_subtle_blend.steps.js").then((m) => m.default),
};
