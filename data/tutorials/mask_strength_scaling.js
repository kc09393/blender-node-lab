export default {
  id: "tutorial_mask_strength_scaling",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "把遮罩調含蓄一點：用 Math 縮小整體影響力", en: "Taming a Mask: Scale Down Its Overall Influence with Math" },
  description: {
    zh: "拿一個 0-1 的雜訊直接當混合著色器（Mix Shader）的 Fac，效果常常太搶戲——兩種材質各佔一半畫面，而不是「主要是 A、偶爾露一點 B」的含蓄效果。這篇教一個簡單技巧：在雜訊跟 Fac 中間插一個數學（Math）節點做「相乘」，把整段 0-1 的範圍直接壓扁到很小的區間（例如 0-0.15），讓次要材質只在少數地方低調地透出來。",
    en: "Feeding a raw 0-1 noise straight into a Mix Shader's Fac often looks too loud — two materials split roughly 50/50, instead of 'mostly A, with B subtly peeking through'. This tutorial teaches a simple trick: insert a Math node set to Multiply between the noise and the Fac, compressing the whole 0-1 range down to a small band (e.g. 0-0.15), so the secondary material only shows up sparingly and tastefully.",
  },
  startGraph: {
    nodes: [
      { id: "t_mss_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mss_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_mss_l1", fromNode: "t_mss_principled", fromSocket: "bsdf", toNode: "t_mss_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mss_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "te_mss_mix", typeId: "shader_mix_shader", x: 1040, y: 160, params: {} },
      { id: "te_mss_principled", typeId: "shader_principled_bsdf", x: 780, y: 40, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.6 } },
      { id: "te_mss_glossy", typeId: "shader_glossy_bsdf", x: 780, y: 300, params: { color: [1, 0.95, 0.8, 1], roughness: 0.05 } },
      { id: "te_mss_noise", typeId: "texture_noise", x: 280, y: 220, params: { scale: 8 } },
      { id: "te_mss_math", typeId: "converter_math", x: 540, y: 220, params: { operation: "multiply", value2: 0.15 } },
    ],
    links: [
      { id: "te_mss_l1", fromNode: "te_mss_mix", fromSocket: "bsdf", toNode: "te_mss_out", toSocket: "surface" },
      { id: "te_mss_l2", fromNode: "te_mss_principled", fromSocket: "bsdf", toNode: "te_mss_mix", toSocket: "shader1" },
      { id: "te_mss_l3", fromNode: "te_mss_glossy", fromSocket: "bsdf", toNode: "te_mss_mix", toSocket: "shader2" },
      { id: "te_mss_l4", fromNode: "te_mss_noise", fromSocket: "fac", toNode: "te_mss_math", toSocket: "value1" },
      { id: "te_mss_l5", fromNode: "te_mss_math", fromSocket: "value", toNode: "te_mss_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./mask_strength_scaling.steps.js").then((m) => m.default),
};
