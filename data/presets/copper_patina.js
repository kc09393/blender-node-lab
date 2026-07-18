export default {
  id: "copper_patina",
  name: { zh: "風化銅綠", en: "Weathered Copper Patina" },
  description: {
    zh: "雜訊紋理接一條「銅色→銅色→綠色→綠色」四段式顏色漸變，同一條漸變轉黑白後直接當作混合著色器的遮罩，讓「顏色」與「該顯示哪種材質」用同一份資料保持完全一致。",
    en: "Noise Texture feeds a 4-stop 'copper→copper→green→green' Color Ramp; that same ramp (converted to grayscale) becomes the Mix Shader mask directly, keeping the coloring and the material switch perfectly in sync.",
  },
  graph: {
    nodes: [
      { id: "patina_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "patina_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "patina_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [3, 3, 3] } },
      { id: "patina_noise", typeId: "texture_noise", x: 260, y: 100, params: { detail: 5, roughness: 0.55, scale: 4 } },
      {
        id: "patina_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.4, 0.2, 0.08, 1] },
            { position: 0.45, color: [0.55, 0.3, 0.12, 1] },
            { position: 0.55, color: [0.15, 0.45, 0.4, 1] },
            { position: 1, color: [0.2, 0.55, 0.45, 1] },
          ],
        },
      },
      { id: "patina_bw", typeId: "converter_rgb_to_bw", x: 800, y: 300, params: {} },
      { id: "patina_copper", typeId: "shader_principled_bsdf", x: 800, y: 40, params: { roughness: 0.3, metallic: 1 } },
      { id: "patina_verdigris", typeId: "shader_principled_bsdf", x: 800, y: 460, params: { roughness: 0.8, metallic: 0 } },
      { id: "patina_mix", typeId: "shader_mix_shader", x: 1060, y: 220, params: {} },
    ],
    links: [
      { id: "patina_l1", fromNode: "patina_texcoord", fromSocket: "generated", toNode: "patina_mapping", toSocket: "vector" },
      { id: "patina_l2", fromNode: "patina_mapping", fromSocket: "vector", toNode: "patina_noise", toSocket: "vector" },
      { id: "patina_l3", fromNode: "patina_noise", fromSocket: "fac", toNode: "patina_ramp", toSocket: "fac" },
      { id: "patina_l4", fromNode: "patina_ramp", fromSocket: "color", toNode: "patina_copper", toSocket: "baseColor" },
      { id: "patina_l5", fromNode: "patina_ramp", fromSocket: "color", toNode: "patina_verdigris", toSocket: "baseColor" },
      { id: "patina_l6", fromNode: "patina_ramp", fromSocket: "color", toNode: "patina_bw", toSocket: "color" },
      { id: "patina_l7", fromNode: "patina_bw", fromSocket: "value", toNode: "patina_mix", toSocket: "fac" },
      { id: "patina_l8", fromNode: "patina_copper", fromSocket: "bsdf", toNode: "patina_mix", toSocket: "shader1" },
      { id: "patina_l9", fromNode: "patina_verdigris", fromSocket: "bsdf", toNode: "patina_mix", toSocket: "shader2" },
      { id: "patina_l10", fromNode: "patina_mix", fromSocket: "bsdf", toNode: "patina_out", toSocket: "surface" },
    ],
  },
};
