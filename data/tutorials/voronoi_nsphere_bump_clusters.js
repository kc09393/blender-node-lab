export default {
  id: "tutorial_voronoi_nsphere_bump_clusters",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "沃羅諾伊做圓潤凸起：N-球半徑接凹凸", en: "Rounded Bumps with Voronoi: N-Sphere Radius into Bump" },
  description: {
    zh: "沃羅諾伊（Voronoi）接凹凸（Bump）最常見的做法是用「到邊緣的距離」做出裂縫/溝紋，但如果想要的是一顆顆分開、圓潤的凸起（藤壺、鵝卵石、疙瘩），該換成 N-球半徑（N-Sphere Radius）——這篇直接對比兩種特徵接凹凸的差異，讓你知道什麼情境該選哪一個。",
    en: "The usual Voronoi-into-Bump recipe uses Distance to Edge for cracks/grooves, but if you want separate, rounded individual bumps (barnacles, pebbles, warts), switch to N-Sphere Radius instead — this tutorial directly compares both features driving Bump so you know which to reach for.",
  },
  startGraph: {
    nodes: [
      { id: "t_vnb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vnb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.48, 0.45, 1], roughness: 0.7 } },
    ],
    links: [{ id: "t_vnb_l1", fromNode: "t_vnb_principled", fromSocket: "bsdf", toNode: "t_vnb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vnb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vnb_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { baseColor: [0.5, 0.48, 0.45, 1], roughness: 0.7 } },
      { id: "te_vnb_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 0.8 } },
      { id: "te_vnb_voronoi", typeId: "texture_voronoi", x: 300, y: 100, params: { feature: "n_sphere_radius", scale: 18, randomness: 1 } },
    ],
    links: [
      { id: "te_vnb_l1", fromNode: "te_vnb_principled", fromSocket: "bsdf", toNode: "te_vnb_out", toSocket: "surface" },
      { id: "te_vnb_l2", fromNode: "te_vnb_bump", fromSocket: "normal", toNode: "te_vnb_principled", toSocket: "normal" },
      { id: "te_vnb_l3", fromNode: "te_vnb_voronoi", fromSocket: "distance", toNode: "te_vnb_bump", toSocket: "height" },
    ],
  },
  loadSteps: () => import("./voronoi_nsphere_bump_clusters.steps.js").then((m) => m.default),
};
