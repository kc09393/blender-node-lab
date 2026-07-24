export default {
  id: "tutorial_mapping_types_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "映射節點的 4 種 Type：Point、Vector、Texture、Normal", en: "Mapping's 4 Types: Point, Vector, Texture, Normal" },
  description: {
    zh: "映射（Mapping）節點的類型（Type）下拉選單有 4 種：Point、Texture、Vector、Normal，平常最容易被忽略。這篇專門示範這 4 種的實際差別——尤其 Point 跟 Vector 的差異只有一個：位置（Location）到底有沒有作用。",
    en: "Mapping's Type dropdown has 4 options — Point, Texture, Vector, Normal — that are easy to overlook. This tutorial specifically demonstrates what each one actually does, especially the one difference between Point and Vector: whether Location has any effect at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_mtt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_mtt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
    ],
    links: [{ id: "t_mtt_l1", fromNode: "t_mtt_principled", fromSocket: "bsdf", toNode: "t_mtt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mtt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mtt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
      { id: "te_mtt_checker", typeId: "texture_checker", x: 540, y: 100, params: {} },
      { id: "te_mtt_mapping", typeId: "vector_mapping", x: 280, y: 100, params: { mappingType: "normal", location: [0.3, 0, 0], scale: [4, 4, 4] } },
      { id: "te_mtt_texcoord", typeId: "input_texture_coordinate", x: 20, y: 100, params: {} },
    ],
    links: [
      { id: "te_mtt_l1", fromNode: "te_mtt_principled", fromSocket: "bsdf", toNode: "te_mtt_out", toSocket: "surface" },
      { id: "te_mtt_l2", fromNode: "te_mtt_checker", fromSocket: "color", toNode: "te_mtt_principled", toSocket: "baseColor" },
      { id: "te_mtt_l3", fromNode: "te_mtt_mapping", fromSocket: "vector", toNode: "te_mtt_checker", toSocket: "vector" },
      { id: "te_mtt_l4", fromNode: "te_mtt_texcoord", fromSocket: "generated", toNode: "te_mtt_mapping", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./mapping_types_tour.steps.js").then((m) => m.default),
};
