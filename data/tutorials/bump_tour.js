export default {
  id: "tutorial_bump_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識凹凸節點：假造出來的立體感", en: "Get to Know Bump: Faking Surface Detail" },
  description: {
    zh: "凹凸（Bump）幾乎出現在所有有質感的材質裡——用一個灰階高度值假造出表面凹凸的光影效果，不會真的改變幾何形狀。這篇帶你認識 Height、Strength 兩個插槽，還有初學者最常忘記的一件事：Bump 的輸出一定要接到法線（Normal）插槽才會有效果。",
    en: "Bump shows up in nearly every textured material — it fakes surface bumps' lighting from a grayscale height value, without actually changing the geometry. This tutorial covers Height and Strength, plus the one thing beginners most often forget: Bump's output must be connected to a Normal socket to have any effect at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_bpt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bpt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3 } },
    ],
    links: [{ id: "t_bpt_l1", fromNode: "t_bpt_principled", fromSocket: "bsdf", toNode: "t_bpt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bpt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_bpt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.3 } },
      { id: "te_bpt_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 2.5 } },
      { id: "te_bpt_voronoi", typeId: "texture_voronoi", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_bpt_l1", fromNode: "te_bpt_principled", fromSocket: "bsdf", toNode: "te_bpt_out", toSocket: "surface" },
      { id: "te_bpt_l2", fromNode: "te_bpt_bump", fromSocket: "normal", toNode: "te_bpt_principled", toSocket: "normal" },
      { id: "te_bpt_l3", fromNode: "te_bpt_voronoi", fromSocket: "distance", toNode: "te_bpt_bump", toSocket: "height" },
    ],
  },
  loadSteps: () => import("./bump_tour.steps.js").then((m) => m.default),
};
