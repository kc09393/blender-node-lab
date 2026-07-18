export default {
  id: "agate",
  name: { zh: "瑪瑙寶石", en: "Agate Gemstone" },
  description: {
    zh: "波浪紋理的環狀模式（Rings）配上高扭曲值，做出瑪瑙特有的同心圈紋路；Alpha 調到 0.85 帶一點半透明的寶石感。",
    en: "Wave Texture's Rings mode with a high Distortion value creates agate's characteristic concentric banding; Alpha at 0.85 adds a hint of gemstone translucency.",
  },
  graph: {
    nodes: [
      { id: "agate_out", typeId: "output_material", x: 900, y: 160, params: {} },
      {
        id: "agate_wave",
        typeId: "texture_wave",
        x: 0,
        y: 100,
        params: {
          waveType: "rings",
          profile: "sine",
          scale: 1,
          distortion: 2,
          detail: 3,
          detailScale: 1.2,
          detailRoughness: 0.6,
        },
      },
      {
        id: "agate_ramp",
        typeId: "converter_color_ramp",
        x: 300,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.25, 0.05, 0.35, 1] },
            { position: 0.2, color: [0.95, 0.9, 0.95, 1] },
            { position: 0.4, color: [0.85, 0.4, 0.6, 1] },
            { position: 0.6, color: [0.95, 0.9, 0.95, 1] },
            { position: 0.8, color: [0.25, 0.05, 0.35, 1] },
            { position: 1, color: [0.85, 0.4, 0.6, 1] },
          ],
        },
      },
      {
        id: "agate_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 160,
        params: { roughness: 0.25, metallic: 0, alpha: 0.85 },
      },
    ],
    links: [
      { id: "agate_l1", fromNode: "agate_wave", fromSocket: "fac", toNode: "agate_ramp", toSocket: "fac" },
      { id: "agate_l2", fromNode: "agate_ramp", fromSocket: "color", toNode: "agate_principled", toSocket: "baseColor" },
      { id: "agate_l3", fromNode: "agate_principled", fromSocket: "bsdf", toNode: "agate_out", toSocket: "surface" },
    ],
  },
};
