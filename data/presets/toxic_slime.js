export default {
  id: "toxic_slime",
  name: { zh: "毒液史萊姆", en: "Toxic Slime" },
  description: {
    zh: "帶扭曲（Distortion）的雜訊紋理接顏色漸變染出螢光綠色調，同時餵給發光節點跟玻璃 BSDF 用混合著色器疊在一起，做出「會發光又有點透光」的黏液質感。",
    en: "A distorted Noise Texture feeds a Color Ramp for the toxic-green tint, driving both an Emission node and a Glass BSDF mixed together for a slime that's both glowing and slightly translucent.",
  },
  graph: {
    nodes: [
      { id: "slime_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "slime_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "slime_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [3, 3, 3] } },
      { id: "slime_noise", typeId: "texture_noise", x: 260, y: 100, params: { detail: 5, roughness: 0.6, scale: 4, distortion: 3 } },
      {
        id: "slime_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.2, 0.02, 1] },
            { position: 0.5, color: [0.3, 0.85, 0.1, 1] },
            { position: 1, color: [0.7, 1, 0.3, 1] },
          ],
        },
      },
      { id: "slime_glass", typeId: "shader_glass_bsdf", x: 800, y: 0, params: { color: [0.4, 0.9, 0.2, 1], roughness: 0.15, ior: 1.35 } },
      { id: "slime_emit", typeId: "shader_emission", x: 800, y: 260, params: { strength: 1.2 } },
      { id: "slime_mix", typeId: "shader_mix_shader", x: 1060, y: 130, params: { fac: 0.4 } },
    ],
    links: [
      { id: "slime_l1", fromNode: "slime_texcoord", fromSocket: "generated", toNode: "slime_mapping", toSocket: "vector" },
      { id: "slime_l2", fromNode: "slime_mapping", fromSocket: "vector", toNode: "slime_noise", toSocket: "vector" },
      { id: "slime_l3", fromNode: "slime_noise", fromSocket: "fac", toNode: "slime_ramp", toSocket: "fac" },
      { id: "slime_l4", fromNode: "slime_ramp", fromSocket: "color", toNode: "slime_emit", toSocket: "color" },
      { id: "slime_l5", fromNode: "slime_emit", fromSocket: "bsdf", toNode: "slime_mix", toSocket: "shader1" },
      { id: "slime_l6", fromNode: "slime_glass", fromSocket: "bsdf", toNode: "slime_mix", toSocket: "shader2" },
      { id: "slime_l7", fromNode: "slime_mix", fromSocket: "bsdf", toNode: "slime_out", toSocket: "surface" },
    ],
  },
};
