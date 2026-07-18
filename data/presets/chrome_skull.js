export default {
  id: "chrome_skull",
  name: { zh: "鉻合金雕飾", en: "Chrome Ornament" },
  description: {
    zh: "菲涅爾接顏色漸變做出隨角度變化的鍍膜色，混合比例也由同一個菲涅爾驅動——邊緣同時「變色」又「變得更明顯」。",
    en: "Fresnel feeds a Color Ramp for an angle-dependent coating color, and that same Fresnel value also drives the blend amount — edges both shift color and become more pronounced at once.",
  },
  graph: {
    nodes: [
      { id: "chrome_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "chrome_fresnel", typeId: "input_fresnel", x: 0, y: 100, params: { ior: 2.8 } },
      {
        id: "chrome_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.7, 0.75, 0.85, 1] },
            { position: 0.5, color: [0.95, 0.4, 0.5, 1] },
            { position: 1, color: [0.3, 0.6, 0.95, 1] },
          ],
        },
      },
      { id: "chrome_base", typeId: "shader_principled_bsdf", x: 540, y: 60, params: { baseColor: [0.85, 0.85, 0.88, 1], roughness: 0.05, metallic: 1 } },
      { id: "chrome_tint", typeId: "shader_principled_bsdf", x: 540, y: 320, params: { roughness: 0.05, metallic: 1 } },
      { id: "chrome_mix", typeId: "shader_mix_shader", x: 860, y: 180, params: { fac: 0.3 } },
    ],
    links: [
      { id: "chrome_l1", fromNode: "chrome_fresnel", fromSocket: "fac", toNode: "chrome_ramp", toSocket: "fac" },
      { id: "chrome_l2", fromNode: "chrome_ramp", fromSocket: "color", toNode: "chrome_tint", toSocket: "baseColor" },
      { id: "chrome_l3", fromNode: "chrome_fresnel", fromSocket: "fac", toNode: "chrome_mix", toSocket: "fac" },
      { id: "chrome_l4", fromNode: "chrome_base", fromSocket: "bsdf", toNode: "chrome_mix", toSocket: "shader1" },
      { id: "chrome_l5", fromNode: "chrome_tint", fromSocket: "bsdf", toNode: "chrome_mix", toSocket: "shader2" },
      { id: "chrome_l6", fromNode: "chrome_mix", fromSocket: "bsdf", toNode: "chrome_out", toSocket: "surface" },
    ],
  },
};
