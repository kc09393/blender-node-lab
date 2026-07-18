export default {
  id: "sandstone_cliff",
  name: { zh: "砂岩峭壁", en: "Sandstone Cliff" },
  description: {
    zh: "波浪紋理的條紋（沿 Y 軸方向）接顏色漸變做出砂岩的層理紋路，另一組獨立雜訊驅動凹凸做出風化的顆粒感。",
    en: "Wave Texture's bands (along the Y axis) feed a Color Ramp for sandstone's layered strata; a separate Noise Texture drives Bump for weathered grain.",
  },
  graph: {
    nodes: [
      { id: "sand_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "sand_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "sand_wave", typeId: "texture_wave", x: 0, y: 60, params: { waveType: "bands", direction: "y", scale: 6, distortion: 1.5, detail: 3 } },
      {
        id: "sand_ramp",
        typeId: "converter_color_ramp",
        x: 300,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.55, 0.4, 0.25, 1] },
            { position: 0.5, color: [0.68, 0.52, 0.32, 1] },
            { position: 1, color: [0.45, 0.32, 0.2, 1] },
          ],
        },
      },
      { id: "sand_noise", typeId: "texture_noise", x: 0, y: 340, params: { detail: 6, roughness: 0.5, scale: 25 } },
      { id: "sand_bump", typeId: "vector_bump", x: 300, y: 340, params: { strength: 0.35 } },
      { id: "sand_bsdf", typeId: "shader_principled_bsdf", x: 600, y: 160, params: { roughness: 0.9 } },
    ],
    links: [
      { id: "sand_l1", fromNode: "sand_texcoord", fromSocket: "generated", toNode: "sand_wave", toSocket: "vector" },
      { id: "sand_l2", fromNode: "sand_texcoord", fromSocket: "generated", toNode: "sand_noise", toSocket: "vector" },
      { id: "sand_l3", fromNode: "sand_wave", fromSocket: "fac", toNode: "sand_ramp", toSocket: "fac" },
      { id: "sand_l4", fromNode: "sand_ramp", fromSocket: "color", toNode: "sand_bsdf", toSocket: "baseColor" },
      { id: "sand_l5", fromNode: "sand_noise", fromSocket: "fac", toNode: "sand_bump", toSocket: "height" },
      { id: "sand_l6", fromNode: "sand_bump", fromSocket: "normal", toNode: "sand_bsdf", toSocket: "normal" },
      { id: "sand_l7", fromNode: "sand_bsdf", fromSocket: "bsdf", toNode: "sand_out", toSocket: "surface" },
    ],
  },
};
