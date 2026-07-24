export default {
  id: "tutorial_gradient_texture",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "漸變紋理：最簡單的紋理節點", en: "Gradient Texture: The Simplest Texture Node" },
  description: {
    zh: "漸變紋理（Gradient Texture）沒有任何複雜參數，就是沿著一個方向從黑到白平滑漸變——最適合拿來理解「紋理節點輸出的其實就是一個 0 到 1 的數值」這件事。",
    en: "Gradient Texture has no complex parameters — it's just a smooth black-to-white transition along a direction. The simplest way to understand that a texture node's output is really just a 0-to-1 value.",
  },
  startGraph: {
    nodes: [
      { id: "t_gt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_gt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_gt_l1", fromNode: "t_gt_principled", fromSocket: "bsdf", toNode: "t_gt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_gt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_gt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_gt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.05, 0.1, 0.35, 1] }, { position: 1, color: [0.95, 0.6, 0.15, 1] }] },
      },
      { id: "te_gt_gradient", typeId: "texture_gradient", x: 300, y: 100, params: { type: "spherical" } },
    ],
    links: [
      { id: "te_gt_l1", fromNode: "te_gt_principled", fromSocket: "bsdf", toNode: "te_gt_out", toSocket: "surface" },
      { id: "te_gt_l2", fromNode: "te_gt_ramp", fromSocket: "color", toNode: "te_gt_principled", toSocket: "baseColor" },
      { id: "te_gt_l3", fromNode: "te_gt_gradient", fromSocket: "fac", toNode: "te_gt_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./gradient_texture.steps.js").then((m) => m.default),
};
