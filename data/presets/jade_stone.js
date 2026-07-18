export default {
  id: "jade_stone",
  name: { zh: "翡翠玉石", en: "Jade Gemstone" },
  description: {
    zh: "次表面散射的顏色改由雜訊紋理接顏色漸變驅動，做出玉石內部深淺不一的雲霧狀翠綠紋理；Radius 讓綠色分量比紅色走得更遠，疊一層薄薄的光澤 BSDF 模擬拋光表面。",
    en: "Subsurface Scattering's color is driven by a Noise Texture through a Color Ramp, creating jade's cloudy internal green veining; Radius lets green travel further than red, with a thin Glossy layer on top for the polished surface.",
  },
  graph: {
    nodes: [
      { id: "jade_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "jade_texcoord", typeId: "input_texture_coordinate", x: -260, y: 100, params: {} },
      { id: "jade_noise", typeId: "texture_noise", x: 0, y: 100, params: { scale: 4, detail: 5, distortion: 2 } },
      {
        id: "jade_ramp",
        typeId: "converter_color_ramp",
        x: 280,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.25, 0.15, 1] },
            { position: 0.5, color: [0.15, 0.55, 0.35, 1] },
            { position: 1, color: [0.35, 0.75, 0.5, 1] },
          ],
        },
      },
      { id: "jade_sss", typeId: "shader_subsurface_scattering", x: 560, y: 60, params: { scale: 0.5, radius: [0.25, 0.6, 0.4] } },
      { id: "jade_glossy", typeId: "shader_glossy_bsdf", x: 560, y: 300, params: { color: [1, 1, 1, 1], roughness: 0.08 } },
      { id: "jade_mix", typeId: "shader_mix_shader", x: 840, y: 180, params: { fac: 0.12 } },
    ],
    links: [
      { id: "jade_l1", fromNode: "jade_texcoord", fromSocket: "generated", toNode: "jade_noise", toSocket: "vector" },
      { id: "jade_l2", fromNode: "jade_noise", fromSocket: "fac", toNode: "jade_ramp", toSocket: "fac" },
      { id: "jade_l3", fromNode: "jade_ramp", fromSocket: "color", toNode: "jade_sss", toSocket: "color" },
      { id: "jade_l4", fromNode: "jade_sss", fromSocket: "bsdf", toNode: "jade_mix", toSocket: "shader1" },
      { id: "jade_l5", fromNode: "jade_glossy", fromSocket: "bsdf", toNode: "jade_mix", toSocket: "shader2" },
      { id: "jade_l6", fromNode: "jade_mix", fromSocket: "bsdf", toNode: "jade_out", toSocket: "surface" },
    ],
  },
};
