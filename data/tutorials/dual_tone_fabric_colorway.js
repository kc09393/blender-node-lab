export default {
  id: "tutorial_dual_tone_fabric_colorway",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "雙色織布：用 HSV 一次換掉整個配色", en: "Two-Tone Fabric: Recoloring the Whole Pattern with HSV" },
  description: {
    zh: "做好一個雙色織紋圖案之後，如果想要換一個配色（例如藍白格改成綠白格），不需要重新調整顏色漸變（Color Ramp）裡的每一個停駐點——接一個色相/飽和度/明度（Hue Saturation Value）節點在後面，轉一下 Hue，整組配色會保持原本的明暗對比跟圖案，一次全部換色。這篇示範這個「圖案跟配色分開處理」的實用技巧。",
    en: "Once you've built a two-tone weave pattern, switching its colorway (say, blue-and-white to green-and-white) doesn't require re-tuning every Color Ramp stop — pipe a Hue Saturation Value node afterward, turn Hue, and the whole colorway shifts at once while keeping the original contrast and pattern. This tutorial demonstrates that 'separate the pattern from its colorway' technique.",
  },
  startGraph: {
    nodes: [
      { id: "t_dtf_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_dtf_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_dtf_l1", fromNode: "t_dtf_principled", fromSocket: "bsdf", toNode: "t_dtf_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_dtf_out", typeId: "output_material", x: 1400, y: 200, params: {} },
      { id: "te_dtf_principled", typeId: "shader_principled_bsdf", x: 1140, y: 100, params: {} },
      { id: "te_dtf_hsv", typeId: "color_hsv", x: 880, y: 100, params: { hue: 0.15, saturation: 1.3 } },
      {
        id: "te_dtf_ramp",
        typeId: "converter_color_ramp",
        x: 620,
        y: 100,
        params: { interpolation: "constant", stops: [{ position: 0, color: [0.05, 0.1, 0.35, 1] }, { position: 0.5, color: [0.95, 0.95, 0.95, 1] }] },
      },
      { id: "te_dtf_noise", typeId: "texture_noise", x: 360, y: 100, params: { scale: 22, detail: 2 } },
    ],
    links: [
      { id: "te_dtf_l1", fromNode: "te_dtf_principled", fromSocket: "bsdf", toNode: "te_dtf_out", toSocket: "surface" },
      { id: "te_dtf_l2", fromNode: "te_dtf_hsv", fromSocket: "color", toNode: "te_dtf_principled", toSocket: "baseColor" },
      { id: "te_dtf_l3", fromNode: "te_dtf_ramp", fromSocket: "color", toNode: "te_dtf_hsv", toSocket: "color" },
      { id: "te_dtf_l4", fromNode: "te_dtf_noise", fromSocket: "fac", toNode: "te_dtf_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./dual_tone_fabric_colorway.steps.js").then((m) => m.default),
};
