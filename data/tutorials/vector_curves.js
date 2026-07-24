export default {
  id: "tutorial_vector_curves",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "向量曲線：非線性扭曲法線", en: "Vector Curves: Nonlinearly Warp a Normal" },
  description: {
    zh: "向量曲線（Vector Curves）跟 RGB 曲線概念相同，只是套用在向量（例如法線）上而不是顏色——可以做出比線性運算更細膩的方向扭曲效果。",
    en: "Vector Curves is the same concept as RGB Curves, but applied to a vector (like a normal) instead of a color — enabling more nuanced direction warping than a linear operation.",
  },
  startGraph: {
    nodes: [
      { id: "t_vc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3, metallic: 0.6 } },
    ],
    links: [{ id: "t_vc_l1", fromNode: "t_vc_principled", fromSocket: "bsdf", toNode: "t_vc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vc_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.3, metallic: 0.6 } },
      { id: "te_vc_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 1.5 } },
      {
        id: "te_vc_curves",
        typeId: "vector_curves",
        x: 300,
        y: 300,
        params: { fac: 1, points: [{ x: -1, y: -0.3 }, { x: 1, y: 0.3 }] },
      },
      { id: "te_vc_noise", typeId: "texture_noise", x: 60, y: 300, params: { scale: 6 } },
    ],
    links: [
      { id: "te_vc_l1", fromNode: "te_vc_principled", fromSocket: "bsdf", toNode: "te_vc_out", toSocket: "surface" },
      { id: "te_vc_l2", fromNode: "te_vc_bump", fromSocket: "normal", toNode: "te_vc_principled", toSocket: "normal" },
      { id: "te_vc_l3", fromNode: "te_vc_curves", fromSocket: "vector", toNode: "te_vc_bump", toSocket: "height" },
      { id: "te_vc_l4", fromNode: "te_vc_noise", fromSocket: "fac", toNode: "te_vc_curves", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./vector_curves.steps.js").then((m) => m.default),
};
