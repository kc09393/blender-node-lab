export default {
  id: "tutorial_mix_carpaint",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合節點：車漆效果", en: "Mix Shader: Car Paint" },
  description: {
    zh: "用混合著色器（Mix Shader）把原理化 BSDF（底漆）跟光澤 BSDF（Glossy BSDF，光澤反射）混合，做出邊緣會反光的車漆材質，學會怎麼把兩個材質疊在一起。",
    en: "Blend a Diffuse (base coat) and a Glossy (reflective) shader with Mix Shader to get a car-paint look with edge highlights — learn how to layer two materials together.",
  },
  startGraph: {
    nodes: [
      { id: "t_cp_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cp_principled", typeId: "shader_principled_bsdf", x: 0, y: 100, params: { baseColor: [0.75, 0.05, 0.05, 1] } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_cp_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_cp_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_cp_principled", typeId: "shader_principled_bsdf", x: 500, y: 60, params: { baseColor: [0.75, 0.05, 0.05, 1] } },
      { id: "te_cp_glossy", typeId: "shader_glossy_bsdf", x: 500, y: 300, params: {} },
      { id: "te_cp_fresnel", typeId: "input_fresnel", x: 500, y: 460, params: {} },
    ],
    links: [
      { id: "te_cp_l1", fromNode: "te_cp_mix", fromSocket: "bsdf", toNode: "te_cp_out", toSocket: "surface" },
      { id: "te_cp_l2", fromNode: "te_cp_principled", fromSocket: "bsdf", toNode: "te_cp_mix", toSocket: "shader1" },
      { id: "te_cp_l3", fromNode: "te_cp_glossy", fromSocket: "bsdf", toNode: "te_cp_mix", toSocket: "shader2" },
      { id: "te_cp_l4", fromNode: "te_cp_fresnel", fromSocket: "fac", toNode: "te_cp_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./mix_carpaint.steps.js").then((m) => m.default),
};
