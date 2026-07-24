export default {
  id: "tutorial_map_range_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識映射範圍：4 種插值方式一次看懂", en: "Get to Know Map Range: 4 Interpolation Modes" },
  description: {
    zh: "映射範圍（Map Range）把數值從一個範圍等比例換算到另一個範圍，是整理材質圖的重要工具。這篇帶你認識它的插值方式——線性（Linear）、階梯（Stepped）、平滑／更平滑（Smoothstep／Smootherstep）——還有夾值（Clamp）開關，用同一張雜訊紋理一次一種切換給你看差異。",
    en: "Map Range rescales a value from one range into another — an important tool for tidying up a material graph. This tutorial covers its interpolation modes — Linear, Stepped, Smoothstep/Smootherstep — and the Clamp toggle, switching through them one at a time on the same Noise Texture so you can see the difference.",
  },
  startGraph: {
    nodes: [
      { id: "t_mrt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mrt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mrt_l1", fromNode: "t_mrt_principled", fromSocket: "bsdf", toNode: "t_mrt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mrt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mrt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_mrt_maprange", typeId: "converter_map_range", x: 560, y: 100, params: { interpolationType: "smootherstep", clamp: true } },
      { id: "te_mrt_noise", typeId: "texture_noise", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_mrt_l1", fromNode: "te_mrt_principled", fromSocket: "bsdf", toNode: "te_mrt_out", toSocket: "surface" },
      { id: "te_mrt_l2", fromNode: "te_mrt_maprange", fromSocket: "value", toNode: "te_mrt_principled", toSocket: "roughness" },
      { id: "te_mrt_l3", fromNode: "te_mrt_noise", fromSocket: "fac", toNode: "te_mrt_maprange", toSocket: "value" },
    ],
  },
  loadSteps: () => import("./map_range_tour.steps.js").then((m) => m.default),
};
