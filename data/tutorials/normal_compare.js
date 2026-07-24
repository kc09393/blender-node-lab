export default {
  id: "tutorial_normal_compare",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "法線節點：手動方向比較", en: "Normal Node: Manual Direction Comparison" },
  description: {
    zh: "法線（Normal）節點讓你手動指定一個方向，再輸出它跟表面真正法線的夾角餘弦值（Dot）——可以做出「只有朝向某個方向的表面才會怎樣」的效果，例如模擬固定角度的光照方向。",
    en: "The Normal node lets you manually specify a direction and outputs the cosine of the angle (Dot) between it and the surface's real normal — useful for effects like 'only surfaces facing this direction do X', such as simulating a fixed light direction.",
  },
  startGraph: {
    nodes: [
      { id: "t_nc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_nc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.1, 0.1, 0.1, 1] } },
    ],
    links: [{ id: "t_nc_l1", fromNode: "t_nc_principled", fromSocket: "bsdf", toNode: "t_nc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_nc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_nc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.1, 0.1, 0.1, 1], emissionColor: [1, 1, 1, 1] } },
      { id: "te_nc_normal", typeId: "vector_normal", x: 300, y: 100, params: { normal: [0.5, 0.5, 0.7] } },
    ],
    links: [
      { id: "te_nc_l1", fromNode: "te_nc_principled", fromSocket: "bsdf", toNode: "te_nc_out", toSocket: "surface" },
      { id: "te_nc_l2", fromNode: "te_nc_normal", fromSocket: "dot", toNode: "te_nc_principled", toSocket: "emissionStrength" },
    ],
  },
  loadSteps: () => import("./normal_compare.steps.js").then((m) => m.default),
};
