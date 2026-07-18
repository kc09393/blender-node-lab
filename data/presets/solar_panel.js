export default {
  id: "solar_panel",
  name: { zh: "太陽能板", en: "Solar Panel" },
  description: {
    zh: "棋盤格紋理畫出矽晶電池格線，跟菲涅爾驅動的藍紫色顏色漸變用混合顏色（Mix Color，濾色 Screen 模式）疊在一起，模擬抗反射鍍膜隨視角變色的效果。",
    en: "Checker Texture draws the silicon cell grid lines, layered with a Fresnel-driven blue-purple Color Ramp via Mix Color (Screen mode), simulating an anti-reflective coating that shifts color with viewing angle.",
  },
  graph: {
    nodes: [
      { id: "solar_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "solar_texcoord", typeId: "input_texture_coordinate", x: -260, y: 100, params: {} },
      { id: "solar_checker", typeId: "texture_checker", x: 0, y: 60, params: { color1: [0.03, 0.05, 0.12, 1], color2: [0.05, 0.08, 0.18, 1], scale: 10 } },
      { id: "solar_fresnel", typeId: "input_fresnel", x: 0, y: 300, params: { ior: 1.6 } },
      {
        id: "solar_ramp",
        typeId: "converter_color_ramp",
        x: 280,
        y: 300,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.15, 0.4, 1] },
            { position: 0.5, color: [0.25, 0.1, 0.4, 1] },
            { position: 1, color: [0.05, 0.15, 0.4, 1] },
          ],
        },
      },
      { id: "solar_mixcolor", typeId: "color_mix", x: 560, y: 160, params: { mode: "screen", fac: 0.35 } },
      { id: "solar_principled", typeId: "shader_principled_bsdf", x: 840, y: 160, params: { roughness: 0.15, metallic: 0.7 } },
    ],
    links: [
      { id: "solar_l1", fromNode: "solar_texcoord", fromSocket: "generated", toNode: "solar_checker", toSocket: "vector" },
      { id: "solar_l2", fromNode: "solar_checker", fromSocket: "color", toNode: "solar_mixcolor", toSocket: "a" },
      { id: "solar_l3", fromNode: "solar_fresnel", fromSocket: "fac", toNode: "solar_ramp", toSocket: "fac" },
      { id: "solar_l4", fromNode: "solar_ramp", fromSocket: "color", toNode: "solar_mixcolor", toSocket: "b" },
      { id: "solar_l5", fromNode: "solar_mixcolor", fromSocket: "color", toNode: "solar_principled", toSocket: "baseColor" },
      { id: "solar_l6", fromNode: "solar_principled", fromSocket: "bsdf", toNode: "solar_out", toSocket: "surface" },
    ],
  },
};
