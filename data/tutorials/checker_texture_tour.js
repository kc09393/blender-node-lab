export default {
  id: "tutorial_checker_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識棋盤格紋理：理解座標系統的最佳工具", en: "Get to Know Checker Texture: The Best Tool for Understanding Coordinates" },
  description: {
    zh: "棋盤格紋理（Checker Texture）看起來很簡單，卻是理解「座標系統」最好的工具——格子如果扭曲、拉伸、密度改變，代表座標本身在變化。這篇帶你認識 Color 1/2、Scale，還有換一個座標來源會怎麼影響格子。",
    en: "Checker Texture looks simple, but it's the best tool for understanding coordinate systems — if the squares stretch, distort, or change density, that tells you the coordinate itself is changing. This tutorial covers Color 1/2, Scale, and how swapping the coordinate source affects the pattern.",
  },
  startGraph: {
    nodes: [
      { id: "t_ctt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ctt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ctt_l1", fromNode: "t_ctt_principled", fromSocket: "bsdf", toNode: "t_ctt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ctt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_ctt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_ctt_checker", typeId: "texture_checker", x: 560, y: 100, params: { color1: [0.9, 0.2, 0.2, 1], color2: [0.1, 0.2, 0.6, 1], scale: 10 } },
      { id: "te_ctt_texcoord", typeId: "input_texture_coordinate", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_ctt_l1", fromNode: "te_ctt_principled", fromSocket: "bsdf", toNode: "te_ctt_out", toSocket: "surface" },
      { id: "te_ctt_l2", fromNode: "te_ctt_checker", fromSocket: "color", toNode: "te_ctt_principled", toSocket: "baseColor" },
      { id: "te_ctt_l3", fromNode: "te_ctt_texcoord", fromSocket: "generated", toNode: "te_ctt_checker", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./checker_texture_tour.steps.js").then((m) => m.default),
};
