export default {
  id: "rust_metal",
  name: { zh: "生鏽金屬（程序化風化）", en: "Rusted Metal (Procedural Weathering)" },
  description: {
    zh: "雜訊紋理驅動一個硬邊顏色漸變當作遮罩，決定每個位置該顯示「乾淨金屬」還是「生鏽」兩個原理化 BSDF 中的哪一個。",
    en: "Noise Texture drives a hard-edged Color Ramp used as a mask, deciding whether each spot shows the 'clean metal' or 'rusted' Principled BSDF.",
  },
  graph: {
    nodes: [
      { id: "rust_out", typeId: "output_material", x: 1160, y: 200, params: {} },
      {
        id: "rust_clean",
        typeId: "shader_principled_bsdf",
        x: 700,
        y: 40,
        params: { baseColor: [0.75, 0.76, 0.78, 1], roughness: 0.25, metallic: 1 },
      },
      {
        id: "rust_rusty",
        typeId: "shader_principled_bsdf",
        x: 700,
        y: 280,
        params: { baseColor: [0.42, 0.18, 0.08, 1], roughness: 0.85, metallic: 0 },
      },
      { id: "rust_texcoord", typeId: "input_texture_coordinate", x: 0, y: 460, params: {} },
      { id: "rust_noise", typeId: "texture_noise", x: 220, y: 460, params: { scale: 4.5, detail: 4, roughness: 0.6 } },
      {
        id: "rust_ramp",
        typeId: "converter_color_ramp",
        x: 460,
        y: 460,
        params: {
          stops: [
            { position: 0.42, color: [0, 0, 0, 0] },
            { position: 0.58, color: [1, 1, 1, 1] },
          ],
        },
      },
      { id: "rust_mix", typeId: "shader_mix_shader", x: 940, y: 200, params: {} },
    ],
    links: [
      { id: "rust_l1", fromNode: "rust_texcoord", fromSocket: "generated", toNode: "rust_noise", toSocket: "vector" },
      { id: "rust_l2", fromNode: "rust_noise", fromSocket: "fac", toNode: "rust_ramp", toSocket: "fac" },
      { id: "rust_l3", fromNode: "rust_ramp", fromSocket: "alpha", toNode: "rust_mix", toSocket: "fac" },
      { id: "rust_l4", fromNode: "rust_clean", fromSocket: "bsdf", toNode: "rust_mix", toSocket: "shader1" },
      { id: "rust_l5", fromNode: "rust_rusty", fromSocket: "bsdf", toNode: "rust_mix", toSocket: "shader2" },
      { id: "rust_l6", fromNode: "rust_mix", fromSocket: "bsdf", toNode: "rust_out", toSocket: "surface" },
    ],
  },
};
