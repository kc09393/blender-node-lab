export default {
  id: "iridescent_beetle",
  name: { zh: "虹彩甲蟲殼", en: "Iridescent Beetle Shell" },
  description: {
    zh: "菲涅爾接 HSV 色彩空間的顏色漸變做出隨角度變色的虹彩；兩層混合著色器疊加——一層混合基底與光澤層，另一層再用層權重的 Fresnel 輸出把基底色疊在邊緣加強。",
    en: "Fresnel feeds an HSV-mode Color Ramp for the angle-shifting iridescent color, layered through two nested Mix Shaders — one blends the base with a glossy layer, the other uses Layer Weight's Fresnel output to reinforce the base color at the edges.",
  },
  graph: {
    nodes: [
      { id: "beetle_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "beetle_fresnel", typeId: "input_fresnel", x: 0, y: 100, params: { ior: 1.6 } },
      {
        id: "beetle_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 100,
        params: {
          colorMode: "hsv",
          hueInterp: "ccw",
          stops: [
            { position: 0, color: [0.05, 0.4, 0.9, 1] },
            { position: 0.33, color: [0.4, 0.9, 0.5, 1] },
            { position: 0.66, color: [0.85, 0.2, 0.9, 1] },
            { position: 1, color: [0.05, 0.4, 0.9, 1] },
          ],
        },
      },
      {
        id: "beetle_base",
        typeId: "shader_principled_bsdf",
        x: 560,
        y: 40,
        params: { baseColor: [0.03, 0.03, 0.04, 1], roughness: 0.15, metallic: 0.6 },
      },
      {
        id: "beetle_glossy",
        typeId: "shader_glossy_bsdf",
        x: 560,
        y: 260,
        params: { color: [1, 1, 1, 1], roughness: 0.05 },
      },
      { id: "beetle_mix1", typeId: "shader_mix_shader", x: 860, y: 150, params: { fac: 0.4 } },
      { id: "beetle_layerweight", typeId: "input_layer_weight", x: 560, y: 420, params: { blend: 0.35 } },
      { id: "beetle_mix2", typeId: "shader_mix_shader", x: 1060, y: 260, params: {} },
    ],
    links: [
      { id: "beetle_l1", fromNode: "beetle_fresnel", fromSocket: "fac", toNode: "beetle_ramp", toSocket: "fac" },
      { id: "beetle_l2", fromNode: "beetle_ramp", fromSocket: "color", toNode: "beetle_base", toSocket: "baseColor" },
      { id: "beetle_l3", fromNode: "beetle_ramp", fromSocket: "color", toNode: "beetle_glossy", toSocket: "color" },
      { id: "beetle_l4", fromNode: "beetle_base", fromSocket: "bsdf", toNode: "beetle_mix1", toSocket: "shader1" },
      { id: "beetle_l5", fromNode: "beetle_glossy", fromSocket: "bsdf", toNode: "beetle_mix1", toSocket: "shader2" },
      { id: "beetle_l6", fromNode: "beetle_mix1", fromSocket: "bsdf", toNode: "beetle_mix2", toSocket: "shader1" },
      { id: "beetle_l7", fromNode: "beetle_base", fromSocket: "bsdf", toNode: "beetle_mix2", toSocket: "shader2" },
      { id: "beetle_l8", fromNode: "beetle_layerweight", fromSocket: "fresnel", toNode: "beetle_mix2", toSocket: "fac" },
      { id: "beetle_l9", fromNode: "beetle_mix2", fromSocket: "bsdf", toNode: "beetle_out", toSocket: "surface" },
    ],
  },
};
