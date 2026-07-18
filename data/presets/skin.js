export default {
  id: "skin",
  name: { zh: "皮膚（次表面散射）", en: "Skin (Subsurface Scattering)" },
  description: {
    zh: "次表面散射做出邊緣透光的膚色主體，再用混合著色器疊一點點（8%）光澤 BSDF 模擬皮膚表層的油脂反光。",
    en: "Subsurface Scattering gives the translucent skin-tone base; Mix Shader layers in a thin (8%) Glossy BSDF for the skin's natural oily sheen.",
  },
  graph: {
    nodes: [
      { id: "skin_out", typeId: "output_material", x: 780, y: 160, params: {} },
      {
        id: "skin_sss",
        typeId: "shader_subsurface_scattering",
        x: 200,
        y: 60,
        params: { color: [0.92, 0.68, 0.58, 1], scale: 0.6, radius: [1, 0.35, 0.2] },
      },
      { id: "skin_glossy", typeId: "shader_glossy_bsdf", x: 200, y: 260, params: { color: [1, 1, 1, 1], roughness: 0.28 } },
      { id: "skin_mix", typeId: "shader_mix_shader", x: 500, y: 160, params: { fac: 0.08 } },
    ],
    links: [
      { id: "skin_l1", fromNode: "skin_sss", fromSocket: "bsdf", toNode: "skin_mix", toSocket: "shader1" },
      { id: "skin_l2", fromNode: "skin_glossy", fromSocket: "bsdf", toNode: "skin_mix", toSocket: "shader2" },
      { id: "skin_l3", fromNode: "skin_mix", fromSocket: "bsdf", toNode: "skin_out", toSocket: "surface" },
    ],
  },
};
