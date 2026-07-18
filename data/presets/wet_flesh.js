export default {
  id: "wet_flesh",
  name: { zh: "濕潤血肉組織", en: "Wet Organic Tissue" },
  description: {
    zh: "次表面散射＋高光澤 BSDF 先用混合著色器（22%）做出濕潤基底，再用加法著色器疊一層絨光 BSDF，加總出濕黏表面額外的高光。",
    en: "Subsurface Scattering mixes with a high-gloss Glossy BSDF (22%) for the wet base; Add Shader then layers Sheen BSDF on top for extra wet-surface highlights.",
  },
  graph: {
    nodes: [
      { id: "flesh_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "flesh_sss",
        typeId: "shader_subsurface_scattering",
        x: 0,
        y: 60,
        params: { color: [0.85, 0.15, 0.18, 1], scale: 0.9, radius: [1, 0.3, 0.15] },
      },
      {
        id: "flesh_glossy",
        typeId: "shader_glossy_bsdf",
        x: 0,
        y: 260,
        params: { color: [1, 0.9, 0.9, 1], roughness: 0.08 },
      },
      { id: "flesh_mix1", typeId: "shader_mix_shader", x: 320, y: 160, params: { fac: 0.22 } },
      { id: "flesh_sheen", typeId: "shader_sheen_bsdf", x: 320, y: 380, params: { color: [1, 1, 1, 1], roughness: 0.15 } },
      { id: "flesh_add", typeId: "shader_add_shader", x: 620, y: 260, params: {} },
    ],
    links: [
      { id: "flesh_l1", fromNode: "flesh_sss", fromSocket: "bsdf", toNode: "flesh_mix1", toSocket: "shader1" },
      { id: "flesh_l2", fromNode: "flesh_glossy", fromSocket: "bsdf", toNode: "flesh_mix1", toSocket: "shader2" },
      { id: "flesh_l3", fromNode: "flesh_mix1", fromSocket: "bsdf", toNode: "flesh_add", toSocket: "shader1" },
      { id: "flesh_l4", fromNode: "flesh_sheen", fromSocket: "bsdf", toNode: "flesh_add", toSocket: "shader2" },
      { id: "flesh_l5", fromNode: "flesh_add", fromSocket: "bsdf", toNode: "flesh_out", toSocket: "surface" },
    ],
  },
};
