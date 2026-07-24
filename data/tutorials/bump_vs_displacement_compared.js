export default {
  id: "tutorial_bump_vs_displacement_compared",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "Bump vs Displacement：同一份高度資料，直接比一比", en: "Bump vs Displacement: Same Height Data, Direct Comparison" },
  description: {
    zh: "凹凸（Bump）教學跟位移（Displacement）教學分別存在，但沒有人直接把兩者放在同一張圖上比較過。這篇用同一份雜訊高度資料，先接 Bump、再多接一份 Displacement，讓你親眼看到「輪廓完全沒變，只是光影騙術」跟「輪廓真的凹凸」的差異，不用只靠文字想像。",
    en: "Bump and Displacement each have their own tutorial, but nobody's put them side by side on the same graph. This one feeds the same noise height data into both — first Bump, then Displacement too — so you can see with your own eyes that one is pure lighting trickery (silhouette unchanged) while the other genuinely deforms the surface, instead of just reading about the difference.",
  },
  startGraph: {
    nodes: [
      { id: "t_bvd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bvd_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
    ],
    links: [{ id: "t_bvd_l1", fromNode: "t_bvd_principled", fromSocket: "bsdf", toNode: "t_bvd_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bvd_out", typeId: "output_material", x: 1200, y: 220, params: {} },
      { id: "te_bvd_principled", typeId: "shader_principled_bsdf", x: 900, y: 60, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
      { id: "te_bvd_noise", typeId: "texture_noise", x: 300, y: 160, params: { scale: 4 } },
      { id: "te_bvd_bump", typeId: "vector_bump", x: 600, y: 60, params: { strength: 1 } },
      { id: "te_bvd_disp", typeId: "vector_displacement", x: 600, y: 320, params: { midlevel: 0.5, scale: 0.18 } },
    ],
    links: [
      { id: "te_bvd_l1", fromNode: "te_bvd_principled", fromSocket: "bsdf", toNode: "te_bvd_out", toSocket: "surface" },
      { id: "te_bvd_l2", fromNode: "te_bvd_noise", fromSocket: "fac", toNode: "te_bvd_bump", toSocket: "height" },
      { id: "te_bvd_l3", fromNode: "te_bvd_bump", fromSocket: "normal", toNode: "te_bvd_principled", toSocket: "normal" },
      { id: "te_bvd_l4", fromNode: "te_bvd_noise", fromSocket: "fac", toNode: "te_bvd_disp", toSocket: "height" },
      { id: "te_bvd_l5", fromNode: "te_bvd_disp", fromSocket: "displacement", toNode: "te_bvd_out", toSocket: "displacement" },
    ],
  },
  loadSteps: () => import("./bump_vs_displacement_compared.steps.js").then((m) => m.default),
};
