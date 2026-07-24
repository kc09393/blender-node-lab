export default {
  id: "tutorial_noise_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識雜訊紋理：Detail、Distortion、Type 一次搞懂", en: "Get to Know Noise Texture: Detail, Distortion, and Type" },
  description: {
    zh: "雜訊紋理（Noise Texture）幾乎是所有程序化材質的起點，但 Detail／Roughness／Distortion 這些插槽、還有 5 種 Noise Type 到底差在哪，光看名字很難想像。這篇用最直接的方式，一個一個調給你看。",
    en: "Noise Texture is the starting point for nearly every procedural material, but it's hard to picture what Detail/Roughness/Distortion actually do, or how the 5 Noise Types differ, just from their names. This tutorial adjusts them one at a time so you can see directly.",
  },
  startGraph: {
    nodes: [
      { id: "t_ntt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ntt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ntt_l1", fromNode: "t_ntt_principled", fromSocket: "bsdf", toNode: "t_ntt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ntt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ntt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_ntt_noise",
        typeId: "texture_noise",
        x: 300,
        y: 100,
        params: { noiseType: "multifractal", detail: 8, distortion: 3, scale: 4 },
      },
    ],
    links: [
      { id: "te_ntt_l1", fromNode: "te_ntt_principled", fromSocket: "bsdf", toNode: "te_ntt_out", toSocket: "surface" },
      { id: "te_ntt_l2", fromNode: "te_ntt_noise", fromSocket: "color", toNode: "te_ntt_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./noise_texture_tour.steps.js").then((m) => m.default),
};
