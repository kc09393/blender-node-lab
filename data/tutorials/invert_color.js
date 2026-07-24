export default {
  id: "tutorial_invert_color",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "反色：快速做出互補色遮罩", en: "Invert Color: Instant Complementary Masks" },
  description: {
    zh: "反色（Invert Color）節點把顏色變成 1 減去原本的值，常用來把黑白遮罩反過來用——例如把「哪裡有雜訊」變成「哪裡沒有雜訊」，不用重新調整上游節點。",
    en: "Invert Color computes 1 minus the original value — commonly used to flip a black/white mask, e.g. turning 'where there's noise' into 'where there isn't', without touching the upstream nodes at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_iv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_iv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_iv_l1", fromNode: "t_iv_principled", fromSocket: "bsdf", toNode: "t_iv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_iv_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_iv_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_iv_invert", typeId: "color_invert", x: 560, y: 100, params: { fac: 1 } },
      { id: "te_iv_checker", typeId: "texture_checker", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_iv_l1", fromNode: "te_iv_principled", fromSocket: "bsdf", toNode: "te_iv_out", toSocket: "surface" },
      { id: "te_iv_l2", fromNode: "te_iv_invert", fromSocket: "color", toNode: "te_iv_principled", toSocket: "baseColor" },
      { id: "te_iv_l3", fromNode: "te_iv_checker", fromSocket: "color", toNode: "te_iv_invert", toSocket: "color" },
    ],
  },
  loadSteps: () => import("./invert_color.steps.js").then((m) => m.default),
};
