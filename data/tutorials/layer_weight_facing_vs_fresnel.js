export default {
  id: "tutorial_layer_weight_facing_vs_fresnel",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "層權重的兩個輸出：Fresnel 跟 Facing 差在哪", en: "Layer Weight's Two Outputs: Fresnel vs Facing" },
  description: {
    zh: "層權重（Layer Weight）節點有兩個輸出：Fresnel 跟 Facing，很多人只用過 Fresnel 那個。這篇直接對比兩者——Fresnel 的曲線形狀可以用 Blend 滑桿調整（越大越集中在邊緣），Facing 是固定公式、Blend 對它完全沒有作用。搞懂這個差異，才知道什麼情境該選哪個。",
    en: "Layer Weight has two outputs — Fresnel and Facing — but most people only ever use Fresnel. This tutorial directly compares them: Fresnel's curve shape is tunable via the Blend slider (higher = more concentrated at the edges), while Facing is a fixed formula that Blend doesn't affect at all. Understanding this difference tells you which one to reach for.",
  },
  startGraph: {
    nodes: [
      { id: "t_lwf_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_lwf_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.1, 0.1, 0.15, 1] } },
    ],
    links: [{ id: "t_lwf_l1", fromNode: "t_lwf_principled", fromSocket: "bsdf", toNode: "t_lwf_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_lwf_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_lwf_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_lwf_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.1, 0.1, 0.15, 1] } },
      { id: "te_lwf_glossy", typeId: "shader_glossy_bsdf", x: 500, y: 280, params: { roughness: 0.05 } },
      { id: "te_lwf_lw", typeId: "input_layer_weight", x: 500, y: 460, params: { blend: 0.1 } },
    ],
    links: [
      { id: "te_lwf_l1", fromNode: "te_lwf_mix", fromSocket: "bsdf", toNode: "te_lwf_out", toSocket: "surface" },
      { id: "te_lwf_l2", fromNode: "te_lwf_principled", fromSocket: "bsdf", toNode: "te_lwf_mix", toSocket: "shader1" },
      { id: "te_lwf_l3", fromNode: "te_lwf_glossy", fromSocket: "bsdf", toNode: "te_lwf_mix", toSocket: "shader2" },
      { id: "te_lwf_l4", fromNode: "te_lwf_lw", fromSocket: "facing", toNode: "te_lwf_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./layer_weight_facing_vs_fresnel.steps.js").then((m) => m.default),
};
