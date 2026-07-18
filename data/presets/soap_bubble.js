export default {
  id: "soap_bubble",
  name: { zh: "肥皂泡薄膜", en: "Soap Bubble Film" },
  description: {
    zh: "菲涅爾值乘 8 倍再取小數部分（Fraction），把角度變化壓縮成快速重複的彩虹條紋，模擬薄膜干涉的七彩效果。",
    en: "Fresnel is multiplied by 8 then passed through Fraction, compressing angle changes into fast-repeating rainbow bands that mimic thin-film interference.",
  },
  graph: {
    nodes: [
      { id: "bubble_out", typeId: "output_material", x: 1160, y: 200, params: {} },
      {
        id: "bubble_principled",
        typeId: "shader_principled_bsdf",
        x: 900,
        y: 160,
        params: { roughness: 0.02, metallic: 0, alpha: 0.88, emissionStrength: 0.3 },
      },
      { id: "bubble_fresnel", typeId: "input_fresnel", x: 0, y: 60, params: { ior: 1.33 } },
      {
        id: "bubble_mul",
        typeId: "converter_math",
        x: 260,
        y: 60,
        params: { operation: "multiply", value2: 8 },
      },
      {
        id: "bubble_frac",
        typeId: "converter_math",
        x: 500,
        y: 60,
        params: { operation: "fraction", value1: 0.5 },
      },
      {
        id: "bubble_ramp",
        typeId: "converter_color_ramp",
        x: 500,
        y: 320,
        params: {
          stops: [
            { position: 0, color: [0.55, 0.15, 0.85, 1] },
            { position: 0.25, color: [0.1, 0.55, 0.95, 1] },
            { position: 0.5, color: [0.15, 0.9, 0.55, 1] },
            { position: 0.75, color: [0.95, 0.85, 0.1, 1] },
            { position: 1, color: [0.95, 0.2, 0.45, 1] },
          ],
        },
      },
    ],
    links: [
      { id: "bubble_l1", fromNode: "bubble_principled", fromSocket: "bsdf", toNode: "bubble_out", toSocket: "surface" },
      { id: "bubble_l2", fromNode: "bubble_fresnel", fromSocket: "fac", toNode: "bubble_mul", toSocket: "value1" },
      { id: "bubble_l3", fromNode: "bubble_mul", fromSocket: "value", toNode: "bubble_frac", toSocket: "value1" },
      { id: "bubble_l4", fromNode: "bubble_frac", fromSocket: "value", toNode: "bubble_ramp", toSocket: "fac" },
      { id: "bubble_l5", fromNode: "bubble_ramp", fromSocket: "color", toNode: "bubble_principled", toSocket: "baseColor" },
      { id: "bubble_l6", fromNode: "bubble_ramp", fromSocket: "color", toNode: "bubble_principled", toSocket: "emissionColor" },
    ],
  },
};
