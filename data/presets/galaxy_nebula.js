export default {
  id: "galaxy_nebula",
  name: { zh: "星雲球體", en: "Galaxy Nebula Sphere" },
  description: {
    zh: "雜訊紋理接 HSV 遠端色相過渡的顏色漸變做出星雲的雲霧色彩；白噪波紋理配合「大於某個閾值」的判斷式，篩出零星的亮點當作星星，兩層發光用加法著色器疊在一起。",
    en: "Noise Texture feeds an HSV Far-hue Color Ramp for the nebula's cloud coloring; White Noise combined with a 'greater than' threshold picks out scattered bright points as stars — both Emission layers are summed via Add Shader.",
  },
  graph: {
    nodes: [
      { id: "nebula_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "nebula_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "nebula_noise", typeId: "texture_noise", x: 0, y: 60, params: { detail: 6, roughness: 0.55, scale: 2.5, distortion: 2 } },
      {
        id: "nebula_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 60,
        params: {
          colorMode: "hsv",
          hueInterp: "far",
          stops: [
            { position: 0, color: [0.03, 0.02, 0.1, 1] },
            { position: 0.4, color: [0.5, 0.05, 0.5, 1] },
            { position: 0.7, color: [0.9, 0.3, 0.1, 1] },
            { position: 1, color: [0.03, 0.02, 0.1, 1] },
          ],
        },
      },
      { id: "nebula_whitenoise", typeId: "texture_white_noise", x: 0, y: 340, params: {} },
      { id: "nebula_stars_math", typeId: "converter_math", x: 260, y: 340, params: { operation: "greater_than", value2: 0.985 } },
      { id: "nebula_emit_base", typeId: "shader_emission", x: 540, y: 60, params: { strength: 1.5 } },
      { id: "nebula_emit_stars", typeId: "shader_emission", x: 540, y: 340, params: { color: [1, 1, 1, 1], strength: 8 } },
      { id: "nebula_add", typeId: "shader_add_shader", x: 800, y: 200, params: {} },
    ],
    links: [
      { id: "nebula_l1", fromNode: "nebula_texcoord", fromSocket: "generated", toNode: "nebula_noise", toSocket: "vector" },
      { id: "nebula_l2", fromNode: "nebula_texcoord", fromSocket: "generated", toNode: "nebula_whitenoise", toSocket: "vector" },
      { id: "nebula_l3", fromNode: "nebula_noise", fromSocket: "fac", toNode: "nebula_ramp", toSocket: "fac" },
      { id: "nebula_l4", fromNode: "nebula_ramp", fromSocket: "color", toNode: "nebula_emit_base", toSocket: "color" },
      { id: "nebula_l5", fromNode: "nebula_whitenoise", fromSocket: "value", toNode: "nebula_stars_math", toSocket: "value1" },
      { id: "nebula_l6", fromNode: "nebula_stars_math", fromSocket: "value", toNode: "nebula_emit_stars", toSocket: "strength" },
      { id: "nebula_l7", fromNode: "nebula_emit_base", fromSocket: "bsdf", toNode: "nebula_add", toSocket: "shader1" },
      { id: "nebula_l8", fromNode: "nebula_emit_stars", fromSocket: "bsdf", toNode: "nebula_add", toSocket: "shader2" },
      { id: "nebula_l9", fromNode: "nebula_add", fromSocket: "bsdf", toNode: "nebula_out", toSocket: "surface" },
    ],
  },
};
