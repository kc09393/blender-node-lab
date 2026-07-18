export default {
  id: "butterfly_wing",
  name: { zh: "蝴蝶翅膀", en: "Butterfly Wing" },
  description: {
    zh: "菲涅爾接 HSV 遠端（Far）色相過渡的顏色漸變做出隨角度變色的虹彩；漫射與透明 BSDF 先混合出半透明感，再用菲涅爾驅動的光澤 BSDF 疊一層邊緣反光，兩層混合著色器疊出完整的翅膀質感。",
    en: "Fresnel feeds an HSV Color Ramp using Far hue interpolation for the angle-shifting iridescent color; Diffuse and Transparent BSDF mix first for translucency, then a Fresnel-driven Glossy BSDF layers edge reflections on top via a second Mix Shader.",
  },
  graph: {
    nodes: [
      { id: "wing_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "wing_fresnel", typeId: "input_fresnel", x: 0, y: 100, params: { ior: 2.2 } },
      {
        id: "wing_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 100,
        params: {
          colorMode: "hsv",
          hueInterp: "far",
          stops: [
            { position: 0, color: [0.9, 0.1, 0.6, 1] },
            { position: 0.5, color: [0.2, 0.3, 0.95, 1] },
            { position: 1, color: [0.9, 0.1, 0.6, 1] },
          ],
        },
      },
      { id: "wing_diffuse", typeId: "shader_diffuse_bsdf", x: 560, y: 40, params: {} },
      { id: "wing_transparent", typeId: "shader_transparent_bsdf", x: 560, y: 280, params: {} },
      { id: "wing_mix1", typeId: "shader_mix_shader", x: 860, y: 150, params: { fac: 0.12 } },
      { id: "wing_glossy", typeId: "shader_glossy_bsdf", x: 560, y: 460, params: { roughness: 0.1 } },
      { id: "wing_mix2", typeId: "shader_mix_shader", x: 1060, y: 260, params: { fac: 0.25 } },
    ],
    links: [
      { id: "wing_l1", fromNode: "wing_fresnel", fromSocket: "fac", toNode: "wing_ramp", toSocket: "fac" },
      { id: "wing_l2", fromNode: "wing_ramp", fromSocket: "color", toNode: "wing_diffuse", toSocket: "color" },
      { id: "wing_l9", fromNode: "wing_ramp", fromSocket: "color", toNode: "wing_glossy", toSocket: "color" },
      { id: "wing_l3", fromNode: "wing_diffuse", fromSocket: "bsdf", toNode: "wing_mix1", toSocket: "shader1" },
      { id: "wing_l4", fromNode: "wing_transparent", fromSocket: "bsdf", toNode: "wing_mix1", toSocket: "shader2" },
      { id: "wing_l5", fromNode: "wing_mix1", fromSocket: "bsdf", toNode: "wing_mix2", toSocket: "shader1" },
      { id: "wing_l6", fromNode: "wing_glossy", fromSocket: "bsdf", toNode: "wing_mix2", toSocket: "shader2" },
      { id: "wing_l7", fromNode: "wing_fresnel", fromSocket: "fac", toNode: "wing_mix2", toSocket: "fac" },
      { id: "wing_l8", fromNode: "wing_mix2", fromSocket: "bsdf", toNode: "wing_out", toSocket: "surface" },
    ],
  },
};
