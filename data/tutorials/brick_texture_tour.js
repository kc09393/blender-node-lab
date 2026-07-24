export default {
  id: "tutorial_brick_texture_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "磚塊紋理完整導覽：形狀參數全解析", en: "Brick Texture Full Tour: All the Shape Parameters" },
  description: {
    zh: "做磚牆教學（`brick_wall`）只用了預設形狀，磚塊紋理（Brick Texture）其實還有一整組能改變磚塊排法的參數：寬高比、位移週期、壓縮週期、顏色偏向。這篇專門帶你把這些參數一個個轉過一輪，理解怎麼調出瘦高磚、跑道式砌法、或風化不規則的牆面。",
    en: "The brick wall tutorial only used the default shape. Brick Texture actually has a whole set of parameters that reshape the brick layout: aspect ratio, offset frequency, squash frequency, and color bias. This tutorial walks through each one so you understand how to get tall narrow bricks, running-bond masonry, or a weathered irregular wall.",
  },
  startGraph: {
    nodes: [
      { id: "t_btt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_btt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_btt_l1", fromNode: "t_btt_principled", fromSocket: "bsdf", toNode: "t_btt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_btt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_btt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_btt_brick",
        typeId: "texture_brick",
        x: 320,
        y: 100,
        params: { brickWidth: 0.3, rowHeight: 0.45, offset: 0.33, offsetFrequency: 3, squash: 0.7, squashFrequency: 4, bias: 0.6 },
      },
      { id: "te_btt_texcoord", typeId: "input_texture_coordinate", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_btt_l1", fromNode: "te_btt_principled", fromSocket: "bsdf", toNode: "te_btt_out", toSocket: "surface" },
      { id: "te_btt_l2", fromNode: "te_btt_brick", fromSocket: "color", toNode: "te_btt_principled", toSocket: "baseColor" },
      { id: "te_btt_l3", fromNode: "te_btt_texcoord", fromSocket: "generated", toNode: "te_btt_brick", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./brick_texture_tour.steps.js").then((m) => m.default),
};
