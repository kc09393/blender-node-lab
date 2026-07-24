export default {
  id: "tutorial_wave_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識波浪紋理：Bands、Rings、剖面一次搞懂", en: "Get to Know Wave Texture: Bands, Rings, and Profile" },
  description: {
    zh: "波浪紋理（Wave Texture）能做出規律的條紋或環狀波紋，是木紋、水波、金屬拉絲的常見基礎。這篇帶你認識波形（Bands/Rings）、剖面（Profile）、扭曲（Distortion）這幾個關鍵設定，一次一個切給你看。",
    en: "Wave Texture produces regular bands or rings — a common basis for wood grain, water ripples, or brushed metal. This tutorial covers Wave Type (Bands/Rings), Profile, and Distortion, switching one at a time so you can see each effect.",
  },
  startGraph: {
    nodes: [
      { id: "t_wtt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_wtt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_wtt_l1", fromNode: "t_wtt_principled", fromSocket: "bsdf", toNode: "t_wtt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wtt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_wtt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_wtt_wave",
        typeId: "texture_wave",
        x: 300,
        y: 100,
        params: { waveType: "rings", profile: "saw", distortion: 3 },
      },
    ],
    links: [
      { id: "te_wtt_l1", fromNode: "te_wtt_principled", fromSocket: "bsdf", toNode: "te_wtt_out", toSocket: "surface" },
      { id: "te_wtt_l2", fromNode: "te_wtt_wave", fromSocket: "fac", toNode: "te_wtt_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./wave_texture_tour.steps.js").then((m) => m.default),
};
