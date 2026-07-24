export default {
  id: "tutorial_frosted_glass",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "毛玻璃：用雜訊驅動玻璃的粗糙度", en: "Frosted Glass: Driving Glass Roughness with Noise" },
  description: {
    zh: "浴室毛玻璃是「玻璃 BSDF（Glass BSDF）＋不均勻粗糙度」做出來的——不是整片統一模糊，而是有細緻顆粒感的霧面。這篇示範把雜訊紋理（Noise Texture）接到玻璃的粗糙度（Roughness），再用映射範圍（Map Range）把範圍收在一個合理的區間，避免霧面收過頭變成完全不透光的白霧。",
    en: "Bathroom frosted glass is Glass BSDF plus uneven roughness — not a uniform blur, but a finely grained frost. This tutorial wires Noise Texture into Glass BSDF's Roughness, then uses Map Range to keep the result in a reasonable range so the frosting doesn't go so far it turns into an opaque white haze.",
  },
  startGraph: {
    nodes: [
      { id: "t_fg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_fg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_fg_l1", fromNode: "t_fg_principled", fromSocket: "bsdf", toNode: "t_fg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_fg_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_fg_glass", typeId: "shader_glass_bsdf", x: 820, y: 100, params: { ior: 1.45 } },
      { id: "te_fg_maprange", typeId: "converter_map_range", x: 560, y: 100, params: { toMin: 0.15, toMax: 0.35 } },
      { id: "te_fg_noise", typeId: "texture_noise", x: 300, y: 100, params: { scale: 18 } },
    ],
    links: [
      { id: "te_fg_l1", fromNode: "te_fg_glass", fromSocket: "bsdf", toNode: "te_fg_out", toSocket: "surface" },
      { id: "te_fg_l2", fromNode: "te_fg_maprange", fromSocket: "value", toNode: "te_fg_glass", toSocket: "roughness" },
      { id: "te_fg_l3", fromNode: "te_fg_noise", fromSocket: "fac", toNode: "te_fg_maprange", toSocket: "value" },
    ],
  },
  loadSteps: () => import("./frosted_glass.steps.js").then((m) => m.default),
};
