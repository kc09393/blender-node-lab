export default {
  id: "tutorial_layer_weight_clearcoat",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "層權重：清漆塗層", en: "Layer Weight: Clearcoat Finish" },
  description: {
    zh: "層權重（Layer Weight）節點跟菲涅爾（Fresnel）很像，但多了一個更直覺的 Blend 滑桿，常用來在原本的材質上疊一層清漆/光澤塗層。",
    en: "Layer Weight is similar to Fresnel but adds a more intuitive Blend slider — commonly used to layer a clearcoat/gloss finish on top of a base material.",
  },
  startGraph: {
    nodes: [
      { id: "t_lw_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_lw_principled", typeId: "shader_principled_bsdf", x: 0, y: 60, params: { baseColor: [0.05, 0.15, 0.45, 1], roughness: 0.5 } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_lw_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_lw_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_lw_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.05, 0.15, 0.45, 1], roughness: 0.5 } },
      { id: "te_lw_glossy", typeId: "shader_glossy_bsdf", x: 500, y: 280, params: { roughness: 0.05 } },
      { id: "te_lw_lw", typeId: "input_layer_weight", x: 500, y: 460, params: { blend: 0.2 } },
    ],
    links: [
      { id: "te_lw_l1", fromNode: "te_lw_mix", fromSocket: "bsdf", toNode: "te_lw_out", toSocket: "surface" },
      { id: "te_lw_l2", fromNode: "te_lw_principled", fromSocket: "bsdf", toNode: "te_lw_mix", toSocket: "shader1" },
      { id: "te_lw_l3", fromNode: "te_lw_glossy", fromSocket: "bsdf", toNode: "te_lw_mix", toSocket: "shader2" },
      { id: "te_lw_l4", fromNode: "te_lw_lw", fromSocket: "fresnel", toNode: "te_lw_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./layer_weight_clearcoat.steps.js").then((m) => m.default),
};
