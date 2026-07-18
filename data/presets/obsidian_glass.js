export default {
  id: "obsidian_glass",
  name: { zh: "火山黑曜岩", en: "Volcanic Obsidian" },
  description: {
    zh: "雜訊紋理染出近黑帶點紫的底色，混合比例由菲涅爾驅動疊一層深色光澤 BSDF，做出黑曜岩特有的「幾乎全黑但邊緣有光」質感。",
    en: "Noise Texture tints a near-black, faintly purple base; Fresnel drives the blend with a dark Glossy BSDF layer, giving obsidian its 'almost pure black but with an edge sheen' look.",
  },
  graph: {
    nodes: [
      { id: "obsidian_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "obsidian_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "obsidian_noise", typeId: "texture_noise", x: 0, y: 100, params: { detail: 4, roughness: 0.5, scale: 5 } },
      {
        id: "obsidian_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.01, 0.01, 0.015, 1] },
            { position: 0.5, color: [0.02, 0.015, 0.03, 1] },
            { position: 1, color: [0.05, 0.03, 0.08, 1] },
          ],
        },
      },
      { id: "obsidian_glossy", typeId: "shader_principled_bsdf", x: 540, y: 60, params: { roughness: 0.08, metallic: 0 } },
      { id: "obsidian_fresnel", typeId: "input_fresnel", x: 260, y: 380, params: { ior: 1.5 } },
      { id: "obsidian_rim", typeId: "shader_glossy_bsdf", x: 540, y: 380, params: { color: [0.18, 0.14, 0.22, 1], roughness: 0.1 } },
      { id: "obsidian_mix", typeId: "shader_mix_shader", x: 800, y: 200, params: {} },
    ],
    links: [
      { id: "obsidian_l1", fromNode: "obsidian_texcoord", fromSocket: "generated", toNode: "obsidian_noise", toSocket: "vector" },
      { id: "obsidian_l2", fromNode: "obsidian_noise", fromSocket: "fac", toNode: "obsidian_ramp", toSocket: "fac" },
      { id: "obsidian_l3", fromNode: "obsidian_ramp", fromSocket: "color", toNode: "obsidian_glossy", toSocket: "baseColor" },
      { id: "obsidian_l4", fromNode: "obsidian_fresnel", fromSocket: "fac", toNode: "obsidian_mix", toSocket: "fac" },
      { id: "obsidian_l5", fromNode: "obsidian_glossy", fromSocket: "bsdf", toNode: "obsidian_mix", toSocket: "shader1" },
      { id: "obsidian_l6", fromNode: "obsidian_rim", fromSocket: "bsdf", toNode: "obsidian_mix", toSocket: "shader2" },
      { id: "obsidian_l7", fromNode: "obsidian_mix", fromSocket: "bsdf", toNode: "obsidian_out", toSocket: "surface" },
    ],
  },
};
