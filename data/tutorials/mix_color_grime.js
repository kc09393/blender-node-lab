export default {
  id: "tutorial_mix_color_grime",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合顏色：疊一層污漬", en: "Mix Color: Layering On Grime" },
  description: {
    zh: "混合顏色（Mix Color）節點的相乘（Multiply）模式只會讓顏色變暗、不會變亮——這正是疊加污漬、陰影貼圖的標準做法，概念上跟 Photoshop 圖層的「色彩增值」模式一樣。",
    en: "Mix Color's Multiply mode can only darken, never brighten — the standard technique for layering grime or shadow maps onto a base color. The same concept as Photoshop's 'Multiply' layer blend mode.",
  },
  startGraph: {
    nodes: [
      { id: "t_mc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.85, 0.8, 0.7, 1] } },
    ],
    links: [{ id: "t_mc_l1", fromNode: "t_mc_principled", fromSocket: "bsdf", toNode: "t_mc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mc_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_mc_principled", typeId: "shader_principled_bsdf", x: 1020, y: 100, params: { baseColor: [0.85, 0.8, 0.7, 1] } },
      { id: "te_mc_mix", typeId: "color_mix", x: 780, y: 100, params: { mode: "multiply", fac: 0.6 } },
      { id: "te_mc_voronoi", typeId: "texture_voronoi", x: 540, y: 100, params: { scale: 8 } },
      { id: "te_mc_texcoord", typeId: "input_texture_coordinate", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_mc_l1", fromNode: "te_mc_principled", fromSocket: "bsdf", toNode: "te_mc_out", toSocket: "surface" },
      { id: "te_mc_l2", fromNode: "te_mc_mix", fromSocket: "color", toNode: "te_mc_principled", toSocket: "baseColor" },
      { id: "te_mc_l3", fromNode: "te_mc_voronoi", fromSocket: "color", toNode: "te_mc_mix", toSocket: "b" },
      { id: "te_mc_l4", fromNode: "te_mc_texcoord", fromSocket: "generated", toNode: "te_mc_voronoi", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./mix_color_grime.steps.js").then((m) => m.default),
};
