export default {
  id: "tutorial_voronoi_distance_metrics",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "沃羅諾伊：用距離度量改變細胞形狀", en: "Voronoi: Reshape Cells with Distance Metric" },
  description: {
    zh: "沃羅諾伊紋理（Voronoi Texture）的距離度量（Distance Metric）決定細胞邊界的形狀：歐式是圓潤的、切比雪夫是方形的、閔可夫斯基（Minkowski）則用 Exponent 插槽在兩者之間連續變化——Exponent 越小越像鑽石/菱形，越大越像正方形。",
    en: "Voronoi Texture's Distance Metric determines each cell's boundary shape: Euclidean gives rounded cells, Chebychev gives square ones, and Minkowski lets you slide continuously between them via its Exponent input — lower values look diamond-shaped, higher values approach square.",
  },
  startGraph: {
    nodes: [
      { id: "t_vdm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vdm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vdm_l1", fromNode: "t_vdm_principled", fromSocket: "bsdf", toNode: "t_vdm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vdm_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_vdm_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_vdm_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.05, 0.05, 0.05, 1] }, { position: 0.25, color: [1, 1, 1, 1] }] },
      },
      {
        id: "te_vdm_voronoi",
        typeId: "texture_voronoi",
        x: 300,
        y: 100,
        params: { scale: 6, distanceMetric: "minkowski", exponent: 6 },
      },
    ],
    links: [
      { id: "te_vdm_l1", fromNode: "te_vdm_principled", fromSocket: "bsdf", toNode: "te_vdm_out", toSocket: "surface" },
      { id: "te_vdm_l2", fromNode: "te_vdm_ramp", fromSocket: "color", toNode: "te_vdm_principled", toSocket: "baseColor" },
      { id: "te_vdm_l3", fromNode: "te_vdm_voronoi", fromSocket: "distance", toNode: "te_vdm_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./voronoi_distance_metrics.steps.js").then((m) => m.default),
};
