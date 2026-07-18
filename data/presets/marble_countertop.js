export default {
  id: "marble_countertop",
  name: { zh: "大理石台面", en: "Marble Countertop" },
  description: {
    zh: "波浪紋理用對角方向＋高扭曲值扭出不規則紋路，接線性插值的顏色漸變畫出大理石的深色紋脈；再疊一層薄薄的光澤 BSDF（20%）模擬拋光石材的鏡面反光。",
    en: "Wave Texture uses diagonal direction and high Distortion to warp irregular veining, feeding a Linear-interpolation Color Ramp for marble's dark veins; a thin (20%) Glossy BSDF layer on top mimics the polished stone's mirror sheen.",
  },
  graph: {
    nodes: [
      { id: "marble_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "marble_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "marble_wave", typeId: "texture_wave", x: 0, y: 100, params: { waveType: "bands", direction: "diagonal", scale: 2, distortion: 12, detail: 2, detailScale: 1.5, detailRoughness: 0.4 } },
      {
        id: "marble_ramp",
        typeId: "converter_color_ramp",
        x: 300,
        y: 100,
        params: {
          interpolation: "linear",
          stops: [
            { position: 0, color: [0.92, 0.92, 0.9, 1] },
            { position: 0.42, color: [0.9, 0.9, 0.88, 1] },
            { position: 0.5, color: [0.1, 0.1, 0.13, 1] },
            { position: 0.58, color: [0.9, 0.9, 0.88, 1] },
            { position: 1, color: [0.8, 0.8, 0.76, 1] },
          ],
        },
      },
      { id: "marble_bsdf", typeId: "shader_principled_bsdf", x: 620, y: 100, params: { roughness: 0.15 } },
      { id: "marble_glossy", typeId: "shader_glossy_bsdf", x: 620, y: 340, params: { color: [1, 1, 1, 1], roughness: 0.03 } },
      { id: "marble_mix", typeId: "shader_mix_shader", x: 900, y: 200, params: { fac: 0.2 } },
    ],
    links: [
      { id: "marble_l1", fromNode: "marble_texcoord", fromSocket: "generated", toNode: "marble_wave", toSocket: "vector" },
      { id: "marble_l2", fromNode: "marble_wave", fromSocket: "fac", toNode: "marble_ramp", toSocket: "fac" },
      { id: "marble_l3", fromNode: "marble_ramp", fromSocket: "color", toNode: "marble_bsdf", toSocket: "baseColor" },
      { id: "marble_l4", fromNode: "marble_bsdf", fromSocket: "bsdf", toNode: "marble_mix", toSocket: "shader1" },
      { id: "marble_l5", fromNode: "marble_glossy", fromSocket: "bsdf", toNode: "marble_mix", toSocket: "shader2" },
      { id: "marble_l6", fromNode: "marble_mix", fromSocket: "bsdf", toNode: "marble_out", toSocket: "surface" },
    ],
  },
};
