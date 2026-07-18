export default {
  id: "peacock_feather",
  name: { zh: "孔雀羽毛", en: "Peacock Feather" },
  description: {
    zh: "波浪紋理的環狀模式（Rings）畫出羽毛「眼睛」的同心圈，跟菲涅爾值相加後接 HSV 色彩空間的顏色漸變，做出隨視角＋位置雙重驅動的孔雀藍綠金屬色。",
    en: "Wave Texture's Rings mode draws the feather 'eye' pattern's concentric circles; added to the Fresnel value and fed into an HSV Color Ramp for a peacock-blue-and-gold color driven by both position and viewing angle.",
  },
  graph: {
    nodes: [
      { id: "peacock_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "peacock_texcoord", typeId: "input_texture_coordinate", x: -260, y: 100, params: {} },
      { id: "peacock_wave", typeId: "texture_wave", x: 0, y: 60, params: { waveType: "rings", scale: 3, distortion: 0.5 } },
      { id: "peacock_fresnel", typeId: "input_fresnel", x: 0, y: 300, params: { ior: 1.6 } },
      { id: "peacock_add", typeId: "converter_math", x: 280, y: 160, params: { operation: "add" } },
      {
        id: "peacock_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 160,
        params: {
          colorMode: "hsv",
          hueInterp: "ccw",
          stops: [
            { position: 0, color: [0.05, 0.35, 0.55, 1] },
            { position: 0.35, color: [0.05, 0.55, 0.35, 1] },
            { position: 0.65, color: [0.6, 0.5, 0.05, 1] },
            { position: 1, color: [0.05, 0.35, 0.55, 1] },
          ],
        },
      },
      { id: "peacock_principled", typeId: "shader_principled_bsdf", x: 820, y: 160, params: { roughness: 0.25, metallic: 0.35 } },
    ],
    links: [
      { id: "peacock_l1", fromNode: "peacock_texcoord", fromSocket: "generated", toNode: "peacock_wave", toSocket: "vector" },
      { id: "peacock_l2", fromNode: "peacock_wave", fromSocket: "fac", toNode: "peacock_add", toSocket: "value1" },
      { id: "peacock_l3", fromNode: "peacock_fresnel", fromSocket: "fac", toNode: "peacock_add", toSocket: "value2" },
      { id: "peacock_l4", fromNode: "peacock_add", fromSocket: "value", toNode: "peacock_ramp", toSocket: "fac" },
      { id: "peacock_l5", fromNode: "peacock_ramp", fromSocket: "color", toNode: "peacock_principled", toSocket: "baseColor" },
      { id: "peacock_l6", fromNode: "peacock_principled", fromSocket: "bsdf", toNode: "peacock_out", toSocket: "surface" },
    ],
  },
};
