export default {
  id: "tutorial_skin_sss",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "次表面散射：皮膚材質", en: "Subsurface Scattering: Skin Material" },
  description: {
    zh: "用次表面散射（Subsurface Scattering）節點做出皮膚特有的透光邊緣，再疊一層微弱的高光，學會這種「多層 BSDF 疊加模擬複雜有機材質」的技巧。",
    en: "Use the Subsurface Scattering node to get skin's characteristic translucent edge glow, then layer a subtle highlight on top — learn the 'stack multiple BSDFs' technique for complex organic materials.",
  },
  startGraph: {
    nodes: [{ id: "t_sss_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_sss_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_sss_mix", typeId: "shader_mix_shader", x: 600, y: 160, params: { fac: 0.08 } },
      {
        id: "te_sss_sss",
        typeId: "shader_subsurface_scattering",
        x: 300,
        y: 60,
        params: { color: [0.92, 0.68, 0.58, 1], radius: [1, 0.3, 0.15] },
      },
      { id: "te_sss_glossy", typeId: "shader_glossy_bsdf", x: 300, y: 280, params: { roughness: 0.3 } },
    ],
    links: [
      { id: "te_sss_l1", fromNode: "te_sss_mix", fromSocket: "bsdf", toNode: "te_sss_out", toSocket: "surface" },
      { id: "te_sss_l2", fromNode: "te_sss_sss", fromSocket: "bsdf", toNode: "te_sss_mix", toSocket: "shader1" },
      { id: "te_sss_l3", fromNode: "te_sss_glossy", fromSocket: "bsdf", toNode: "te_sss_mix", toSocket: "shader2" },
    ],
  },
  loadSteps: () => import("./skin_sss.steps.js").then((m) => m.default),
};
