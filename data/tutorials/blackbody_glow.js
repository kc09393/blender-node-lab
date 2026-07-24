export default {
  id: "tutorial_blackbody_glow",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "色溫節點：燭光暖黃光", en: "Blackbody Node: Warm Candlelight" },
  description: {
    zh: "用黑體（Blackbody）節點把「色溫（K）」這個攝影/燈光常用單位直接轉成物理精確的顏色，做出燭光般的暖黃發光效果。",
    en: "Use the Blackbody node to convert color temperature (K) — the unit photographers and lighting artists actually use — directly into a physically accurate color, for a candlelight-warm glow.",
  },
  startGraph: {
    nodes: [{ id: "t_bb_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_bb_out", typeId: "output_material", x: 700, y: 160, params: {} },
      { id: "te_bb_emission", typeId: "shader_emission", x: 400, y: 100, params: { strength: 3 } },
      { id: "te_bb_blackbody", typeId: "converter_blackbody", x: 100, y: 100, params: { temperature: 1900 } },
    ],
    links: [
      { id: "te_bb_l1", fromNode: "te_bb_emission", fromSocket: "bsdf", toNode: "te_bb_out", toSocket: "surface" },
      { id: "te_bb_l2", fromNode: "te_bb_blackbody", fromSocket: "color", toNode: "te_bb_emission", toSocket: "color" },
    ],
  },
  loadSteps: () => import("./blackbody_glow.steps.js").then((m) => m.default),
};
