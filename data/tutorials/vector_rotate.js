export default {
  id: "tutorial_vector_rotate",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "向量旋轉：轉正貼圖角度", en: "Vector Rotate: Turning a Texture" },
  description: {
    zh: "向量旋轉（Vector Rotate）節點可以把座標繞任意軸旋轉指定角度，常用來把貼圖的花紋角度轉正，或做出旋轉動畫的基礎。",
    en: "Vector Rotate spins a coordinate around any axis by a chosen angle — useful for straightening a texture's pattern, or as the basis for a rotation animation.",
  },
  startGraph: {
    nodes: [
      { id: "t_vr_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vr_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vr_l1", fromNode: "t_vr_principled", fromSocket: "bsdf", toNode: "t_vr_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vr_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vr_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_vr_checker", typeId: "texture_checker", x: 560, y: 100, params: {} },
      { id: "te_vr_rotate", typeId: "vector_rotate", x: 320, y: 100, params: { angle: 45, axis: [1, 0, 0] } },
    ],
    links: [
      { id: "te_vr_l1", fromNode: "te_vr_principled", fromSocket: "bsdf", toNode: "te_vr_out", toSocket: "surface" },
      { id: "te_vr_l2", fromNode: "te_vr_checker", fromSocket: "color", toNode: "te_vr_principled", toSocket: "baseColor" },
      { id: "te_vr_l3", fromNode: "te_vr_rotate", fromSocket: "vector", toNode: "te_vr_checker", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./vector_rotate.steps.js").then((m) => m.default),
};
