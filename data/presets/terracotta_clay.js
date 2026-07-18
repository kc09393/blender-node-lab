export default {
  id: "terracotta_clay",
  name: { zh: "陶土器皿", en: "Terracotta Clay" },
  description: {
    zh: "波浪紋理的環狀模式（Rings）畫出手工拉坯留下的同心刻痕，接顏色漸變染成陶土的橘紅色調；另外用高頻雜訊驅動凹凸做出表面的細微顆粒手感。",
    en: "Wave Texture's Rings mode traces the concentric grooves left by hand-thrown pottery, feeding a Color Ramp for terracotta's orange-red tone; a separate high-frequency Noise Texture drives Bump for the surface's fine hand-made grain.",
  },
  graph: {
    nodes: [
      { id: "terra_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "terra_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "terra_wave", typeId: "texture_wave", x: 0, y: 60, params: { waveType: "rings", scale: 6, profile: "sine", distortion: 0.3 } },
      {
        id: "terra_ramp",
        typeId: "converter_color_ramp",
        x: 280,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.35, 0.16, 0.08, 1] },
            { position: 0.5, color: [0.55, 0.28, 0.15, 1] },
            { position: 1, color: [0.68, 0.4, 0.24, 1] },
          ],
        },
      },
      { id: "terra_noise", typeId: "texture_noise", x: 0, y: 340, params: { scale: 25, detail: 3 } },
      { id: "terra_bump", typeId: "vector_bump", x: 280, y: 340, params: { strength: 0.25 } },
      { id: "terra_principled", typeId: "shader_principled_bsdf", x: 560, y: 200, params: { roughness: 0.85 } },
    ],
    links: [
      { id: "terra_l1", fromNode: "terra_texcoord", fromSocket: "generated", toNode: "terra_wave", toSocket: "vector" },
      { id: "terra_l2", fromNode: "terra_wave", fromSocket: "fac", toNode: "terra_ramp", toSocket: "fac" },
      { id: "terra_l3", fromNode: "terra_ramp", fromSocket: "color", toNode: "terra_principled", toSocket: "baseColor" },
      { id: "terra_l4", fromNode: "terra_texcoord", fromSocket: "generated", toNode: "terra_noise", toSocket: "vector" },
      { id: "terra_l5", fromNode: "terra_noise", fromSocket: "fac", toNode: "terra_bump", toSocket: "height" },
      { id: "terra_l6", fromNode: "terra_bump", fromSocket: "normal", toNode: "terra_principled", toSocket: "normal" },
      { id: "terra_l7", fromNode: "terra_principled", fromSocket: "bsdf", toNode: "terra_out", toSocket: "surface" },
    ],
  },
};
