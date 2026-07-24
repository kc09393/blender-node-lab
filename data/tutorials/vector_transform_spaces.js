export default {
  id: "tutorial_vector_transform_spaces",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "向量變換：認識座標空間", en: "Vector Transform: Understanding Coordinate Spaces" },
  description: {
    zh: "同一個方向在「物體」「世界」「攝影機」三種座標空間下的數值都不一樣。向量變換（Vector Transform）節點負責在它們之間換算——把世界座標下的「正上方」轉到攝影機座標，你會發現數值隨著鏡頭角度即時改變。",
    en: "The same direction has different numeric values in Object, World, and Camera coordinate spaces. Vector Transform converts between them — convert World-space 'straight up' into Camera space and watch the values change live as the camera orbits.",
  },
  startGraph: {
    nodes: [
      { id: "t_vt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vt_l1", fromNode: "t_vt_principled", fromSocket: "bsdf", toNode: "t_vt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.9 } },
      { id: "te_vt_transform", typeId: "vector_transform", x: 560, y: 100, params: { from: "world", to: "camera" } },
      { id: "te_vt_combine", typeId: "converter_combine_xyz", x: 320, y: 100, params: { x: 0, y: 1, z: 0 } },
    ],
    links: [
      { id: "te_vt_l1", fromNode: "te_vt_principled", fromSocket: "bsdf", toNode: "te_vt_out", toSocket: "surface" },
      { id: "te_vt_l2", fromNode: "te_vt_transform", fromSocket: "vector", toNode: "te_vt_principled", toSocket: "baseColor" },
      { id: "te_vt_l3", fromNode: "te_vt_combine", fromSocket: "vector", toNode: "te_vt_transform", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./vector_transform_spaces.steps.js").then((m) => m.default),
};
