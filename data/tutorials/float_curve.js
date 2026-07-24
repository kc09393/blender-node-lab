export default {
  id: "tutorial_float_curve",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "曲線編輯器：反轉粗糙度", en: "Curve Editor: Invert Roughness" },
  description: {
    zh: "用數值曲線（Float Curve）節點拖拉出一條自訂的數值對應曲線，把雜訊紋理（Noise Texture）的明暗關係整個反過來，理解曲線編輯器比顏色漸變（Color Ramp）/映射範圍（Map Range）更自由的地方。",
    en: "Drag out a custom value-mapping curve with the Float Curve node to flip Noise Texture's light/dark relationship entirely — see how the curve editor is more flexible than Color Ramp or Map Range.",
  },
  startGraph: {
    nodes: [
      { id: "t_fc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_fc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_fc_l1", fromNode: "t_fc_principled", fromSocket: "bsdf", toNode: "t_fc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_fc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_fc_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_fc_curve",
        typeId: "converter_float_curve",
        x: 560,
        y: 100,
        params: { fac: 1, points: [{ x: 0, y: 1 }, { x: 1, y: 0 }] },
      },
      { id: "te_fc_noise", typeId: "texture_noise", x: 320, y: 100, params: {} },
    ],
    links: [
      { id: "te_fc_l1", fromNode: "te_fc_principled", fromSocket: "bsdf", toNode: "te_fc_out", toSocket: "surface" },
      { id: "te_fc_l2", fromNode: "te_fc_curve", fromSocket: "value", toNode: "te_fc_principled", toSocket: "roughness" },
      { id: "te_fc_l3", fromNode: "te_fc_noise", fromSocket: "fac", toNode: "te_fc_curve", toSocket: "value" },
    ],
  },
  loadSteps: () => import("./float_curve.steps.js").then((m) => m.default),
};
