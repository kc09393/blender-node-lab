export default {
  id: "aurora",
  name: { zh: "極光", en: "Aurora" },
  description: {
    zh: "雜訊紋理先經過數值曲線（Float Curve）重新塑形，再接顏色漸變染成極光色；菲涅爾另外驅動發光強度，讓邊緣更亮。",
    en: "Noise Texture is reshaped through a Float Curve before feeding a Color Ramp for the aurora coloring; Fresnel separately drives Emission Strength so edges glow brighter.",
  },
  graph: {
    nodes: [
      { id: "aurora_out", typeId: "output_material", x: 1160, y: 200, params: {} },
      {
        id: "aurora_emission",
        typeId: "shader_emission",
        x: 900,
        y: 140,
        params: { strength: 2.5 },
      },
      { id: "aurora_noise", typeId: "texture_noise", x: 0, y: 100, params: { scale: 3, detail: 5, roughness: 0.65 } },
      {
        id: "aurora_curve",
        typeId: "converter_float_curve",
        x: 260,
        y: 100,
        params: {
          points: [
            { x: 0, y: 0.1 },
            { x: 0.35, y: 0.75 },
            { x: 0.6, y: 0.2 },
            { x: 1, y: 0.9 },
          ],
        },
      },
      {
        id: "aurora_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.1, 0.35, 1] },
            { position: 0.35, color: [0.1, 0.85, 0.55, 1] },
            { position: 0.65, color: [0.15, 0.95, 0.35, 1] },
            { position: 1, color: [0.55, 0.15, 0.85, 1] },
          ],
        },
      },
      { id: "aurora_fresnel", typeId: "input_fresnel", x: 540, y: 320, params: { ior: 1.8 } },
      { id: "aurora_mix", typeId: "converter_math", x: 780, y: 320, params: { operation: "multiply", value2: 1.5 } },
    ],
    links: [
      { id: "aurora_l1", fromNode: "aurora_emission", fromSocket: "bsdf", toNode: "aurora_out", toSocket: "surface" },
      { id: "aurora_l2", fromNode: "aurora_noise", fromSocket: "fac", toNode: "aurora_curve", toSocket: "value" },
      { id: "aurora_l3", fromNode: "aurora_curve", fromSocket: "value", toNode: "aurora_ramp", toSocket: "fac" },
      { id: "aurora_l4", fromNode: "aurora_ramp", fromSocket: "color", toNode: "aurora_emission", toSocket: "color" },
      { id: "aurora_l5", fromNode: "aurora_fresnel", fromSocket: "fac", toNode: "aurora_mix", toSocket: "value1" },
      { id: "aurora_l6", fromNode: "aurora_mix", fromSocket: "value", toNode: "aurora_emission", toSocket: "strength" },
    ],
  },
};
