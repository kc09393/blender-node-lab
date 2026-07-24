export default {
  id: "tutorial_sss_texture_driven_color",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "次表面散射也能接紋理：雲霧狀玉石", en: "Subsurface Scattering Can Take a Texture Too: Cloudy Jade" },
  description: {
    zh: "次表面散射（Subsurface Scattering）的顏色（Color）插槽平常都是接一個固定顏色，但它跟其他顏色輸入一樣，也可以接紋理。這篇用雜訊紋理＋顏色漸變驅動 SSS 的顏色，做出玉石內部深淺不一的雲霧狀翠綠紋理，而不是死板的單一綠色。",
    en: "Subsurface Scattering's Color socket is usually wired to one fixed color, but like any other color input, it can take a texture too. This tutorial drives SSS's color with a Noise Texture through a Color Ramp, creating jade's cloudy internal green veining instead of one flat, lifeless green.",
  },
  startGraph: {
    nodes: [{ id: "t_stdc_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_stdc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_stdc_sss", typeId: "shader_subsurface_scattering", x: 820, y: 100, params: { scale: 0.5, radius: [0.25, 0.6, 0.4] } },
      {
        id: "te_stdc_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.25, 0.15, 1] },
            { position: 0.5, color: [0.15, 0.55, 0.35, 1] },
            { position: 1, color: [0.35, 0.75, 0.5, 1] },
          ],
        },
      },
      { id: "te_stdc_noise", typeId: "texture_noise", x: 300, y: 100, params: { scale: 4, detail: 5, distortion: 2 } },
    ],
    links: [
      { id: "te_stdc_l1", fromNode: "te_stdc_sss", fromSocket: "bsdf", toNode: "te_stdc_out", toSocket: "surface" },
      { id: "te_stdc_l2", fromNode: "te_stdc_ramp", fromSocket: "color", toNode: "te_stdc_sss", toSocket: "color" },
      { id: "te_stdc_l3", fromNode: "te_stdc_noise", fromSocket: "fac", toNode: "te_stdc_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./sss_texture_driven_color.steps.js").then((m) => m.default),
};
