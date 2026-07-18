export default {
  id: "holographic_foil",
  name: { zh: "雷射鐳射膜", en: "Holographic Foil" },
  description: {
    zh: "波浪紋理的環狀波紋跟菲涅爾值直接相加，讓彩虹條紋隨著視角旋轉滾動；接 HSV 色彩空間的顏色漸變上色，餵給金屬層跟光澤層做 50/50 混合。",
    en: "Wave Texture's ring pattern is added directly to the Fresnel value, so the rainbow bands roll and shift as the viewing angle changes; an HSV Color Ramp colors the result, fed into a 50/50 mix of a metal layer and a glossy layer.",
  },
  graph: {
    nodes: [
      { id: "holo_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "holo_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "holo_wave", typeId: "texture_wave", x: 0, y: 100, params: { waveType: "rings", scale: 8, distortion: 1 } },
      { id: "holo_fresnel", typeId: "input_fresnel", x: 0, y: 380, params: { ior: 1.8 } },
      { id: "holo_math_add", typeId: "converter_math", x: 300, y: 240, params: { operation: "add" } },
      {
        id: "holo_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 240,
        params: {
          colorMode: "hsv",
          hueInterp: "ccw",
          stops: [
            { position: 0, color: [0.9, 0.2, 0.9, 1] },
            { position: 0.5, color: [0.2, 0.9, 0.9, 1] },
            { position: 1, color: [0.9, 0.2, 0.9, 1] },
          ],
        },
      },
      { id: "holo_metal", typeId: "shader_principled_bsdf", x: 860, y: 100, params: { baseColor: [0.8, 0.8, 0.8, 1], roughness: 0.1, metallic: 1 } },
      { id: "holo_glossy", typeId: "shader_glossy_bsdf", x: 860, y: 380, params: { roughness: 0.05 } },
      { id: "holo_mix", typeId: "shader_mix_shader", x: 1080, y: 220, params: { fac: 0.5 } },
    ],
    links: [
      { id: "holo_l1", fromNode: "holo_texcoord", fromSocket: "generated", toNode: "holo_wave", toSocket: "vector" },
      { id: "holo_l2", fromNode: "holo_wave", fromSocket: "fac", toNode: "holo_math_add", toSocket: "value1" },
      { id: "holo_l3", fromNode: "holo_fresnel", fromSocket: "fac", toNode: "holo_math_add", toSocket: "value2" },
      { id: "holo_l4", fromNode: "holo_math_add", fromSocket: "value", toNode: "holo_ramp", toSocket: "fac" },
      { id: "holo_l5", fromNode: "holo_ramp", fromSocket: "color", toNode: "holo_glossy", toSocket: "color" },
      { id: "holo_l6", fromNode: "holo_metal", fromSocket: "bsdf", toNode: "holo_mix", toSocket: "shader1" },
      { id: "holo_l7", fromNode: "holo_glossy", fromSocket: "bsdf", toNode: "holo_mix", toSocket: "shader2" },
      { id: "holo_l8", fromNode: "holo_mix", fromSocket: "bsdf", toNode: "holo_out", toSocket: "surface" },
    ],
  },
};
