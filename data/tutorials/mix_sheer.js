export default {
  id: "tutorial_mix_sheer",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合節點：局部穿透網紗", en: "Mix Shader: Sheer Pattern" },
  description: {
    zh: "用紋理節點的輸出（而不是固定滑桿）當作混合著色器（Mix Shader）的 Fac，做出規律穿透的網紗/窗簾材質。",
    en: "Use a texture node's output (instead of a fixed slider) as Mix Shader's Fac to create a regularly-patterned sheer fabric / curtain material.",
  },
  startGraph: {
    nodes: [
      { id: "t_sh_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_sh_principled", typeId: "shader_principled_bsdf", x: 0, y: 60, params: { baseColor: [0.9, 0.9, 0.85, 1] } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_sh_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_sh_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_sh_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.9, 0.9, 0.85, 1] } },
      { id: "te_sh_transparent", typeId: "shader_transparent_bsdf", x: 500, y: 280, params: {} },
      { id: "te_sh_checker", typeId: "texture_checker", x: 500, y: 460, params: {} },
    ],
    links: [
      { id: "te_sh_l1", fromNode: "te_sh_mix", fromSocket: "bsdf", toNode: "te_sh_out", toSocket: "surface" },
      { id: "te_sh_l2", fromNode: "te_sh_principled", fromSocket: "bsdf", toNode: "te_sh_mix", toSocket: "shader1" },
      { id: "te_sh_l3", fromNode: "te_sh_transparent", fromSocket: "bsdf", toNode: "te_sh_mix", toSocket: "shader2" },
      { id: "te_sh_l4", fromNode: "te_sh_checker", fromSocket: "fac", toNode: "te_sh_mix", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./mix_sheer.steps.js").then((m) => m.default),
};
