export default {
  id: "tutorial_displacement_terrain",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "真正的位移：凹凸地形", en: "True Displacement: Bumpy Terrain" },
  description: {
    zh: "凹凸（Bump）只是假的光影，位移（Displacement）會真的把頂點往外推。用沃羅諾伊紋理（Voronoi Texture）驅動位移節點，做出真的凹凸不平、輪廓也會改變的地形表面。",
    en: "Bump only fakes the lighting — Displacement actually pushes vertices outward. Drive a Displacement node with Voronoi Texture to create a surface whose silhouette genuinely bumps and warps.",
  },
  startGraph: {
    nodes: [
      { id: "t_dt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_dt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
    ],
    links: [{ id: "t_dt_l1", fromNode: "t_dt_principled", fromSocket: "bsdf", toNode: "t_dt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_dt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_dt_principled", typeId: "shader_principled_bsdf", x: 820, y: 60, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
      { id: "te_dt_disp", typeId: "vector_displacement", x: 560, y: 260, params: { midlevel: 0.5, scale: 0.15 } },
      { id: "te_dt_voronoi", typeId: "texture_voronoi", x: 320, y: 260, params: { scale: 4 } },
    ],
    links: [
      { id: "te_dt_l1", fromNode: "te_dt_principled", fromSocket: "bsdf", toNode: "te_dt_out", toSocket: "surface" },
      { id: "te_dt_l2", fromNode: "te_dt_disp", fromSocket: "displacement", toNode: "te_dt_out", toSocket: "displacement" },
      { id: "te_dt_l3", fromNode: "te_dt_voronoi", fromSocket: "distance", toNode: "te_dt_disp", toSocket: "height" },
    ],
  },
  loadSteps: () => import("./displacement_terrain.steps.js").then((m) => m.default),
};
