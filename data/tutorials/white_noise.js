export default {
  id: "tutorial_white_noise",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "白雜訊：完全隨機無規律", en: "White Noise: Fully Random, No Pattern" },
  description: {
    zh: "白噪波紋理（White Noise Texture）跟雜訊紋理（Noise Texture）不同——它完全沒有平滑漸變，每個座標的值都互不相關，看起來像電視雜訊，適合做「完全隨機挑選」的場合。",
    en: "White Noise Texture differs from Noise Texture — it has no smooth gradient at all; every coordinate's value is unrelated to its neighbors, like TV static. Good for 'pick something completely at random' situations.",
  },
  startGraph: {
    nodes: [
      { id: "t_wn_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_wn_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_wn_l1", fromNode: "t_wn_principled", fromSocket: "bsdf", toNode: "t_wn_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wn_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_wn_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_wn_white", typeId: "texture_white_noise", x: 560, y: 100, params: {} },
      { id: "te_wn_voronoi", typeId: "texture_voronoi", x: 300, y: 100, params: { scale: 6 } },
      { id: "te_wn_texcoord", typeId: "input_texture_coordinate", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_wn_l1", fromNode: "te_wn_principled", fromSocket: "bsdf", toNode: "te_wn_out", toSocket: "surface" },
      { id: "te_wn_l2", fromNode: "te_wn_white", fromSocket: "color", toNode: "te_wn_principled", toSocket: "baseColor" },
      { id: "te_wn_l3", fromNode: "te_wn_voronoi", fromSocket: "position", toNode: "te_wn_white", toSocket: "vector" },
      { id: "te_wn_l4", fromNode: "te_wn_texcoord", fromSocket: "generated", toNode: "te_wn_voronoi", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./white_noise.steps.js").then((m) => m.default),
};
