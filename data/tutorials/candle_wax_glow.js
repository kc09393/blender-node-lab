export default {
  id: "tutorial_candle_wax_glow",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "蠟燭材質：次表面散射＋加法著色器疊光", en: "Candle Wax: Subsurface Scattering + Add Shader Glow" },
  description: {
    zh: "蠟燭的蠟身半透光、內部又像被燭火照亮，是次表面散射（Subsurface Scattering）的經典應用之一。這篇示範怎麼把 SSS 的邊緣透光效果，跟一層額外的暖黃色發光（Emission）疊加起來——用加法著色器（Add Shader，不是 Mix Shader）疊加，才能讓「原本的透光」跟「額外的燭光」是真的相加變亮，而不是被平均掉。",
    en: "Candle wax's soft translucency, lit from within by the flame, is a classic Subsurface Scattering use case. This tutorial layers SSS's edge translucency with an extra warm-yellow Emission glow — using Add Shader (not Mix Shader) so the 'built-in translucency' and the 'extra candlelight' genuinely add up brighter instead of getting averaged down.",
  },
  startGraph: {
    nodes: [{ id: "t_cwg_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_cwg_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_cwg_add", typeId: "shader_add_shader", x: 800, y: 160, params: {} },
      {
        id: "te_cwg_sss",
        typeId: "shader_subsurface_scattering",
        x: 500,
        y: 40,
        params: { color: [0.95, 0.78, 0.4, 1], scale: 0.15, radius: [2, 1, 0.3] },
      },
      { id: "te_cwg_emit", typeId: "shader_emission", x: 500, y: 280, params: { color: [1, 0.85, 0.55, 1], strength: 3 } },
    ],
    links: [
      { id: "te_cwg_l1", fromNode: "te_cwg_add", fromSocket: "bsdf", toNode: "te_cwg_out", toSocket: "surface" },
      { id: "te_cwg_l2", fromNode: "te_cwg_sss", fromSocket: "bsdf", toNode: "te_cwg_add", toSocket: "shader1" },
      { id: "te_cwg_l3", fromNode: "te_cwg_emit", fromSocket: "bsdf", toNode: "te_cwg_add", toSocket: "shader2" },
    ],
  },
  loadSteps: () => import("./candle_wax_glow.steps.js").then((m) => m.default),
};
