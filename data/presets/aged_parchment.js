export default {
  id: "aged_parchment",
  name: { zh: "羊皮紙", en: "Aged Parchment" },
  description: {
    zh: "跟既有的舊皮革書封（兩顆雜訊各管顏色跟凹凸）不同技法：這裡用菲涅爾驅動混合顏色的正片疊底，讓紙張邊緣（側視角度）自動疊上一圈焦褐色的燒邊，模擬老舊紙張常見的邊緣氧化痕跡——中央維持雜訊染出的米黃色斑，邊緣則自動變暗，不用手動畫漸層遮罩。",
    en: "A different technique from the existing Old Leather Book (two noises for color and bump): here Fresnel drives a Mix Color Multiply blend, automatically darkening the parchment's silhouette edges into a burnt-brown tint — mimicking the oxidized edges common on old paper. The center keeps its noise-driven cream mottling while the rim darkens on its own, with no hand-painted gradient mask needed.",
  },
  graph: {
    nodes: [
      { id: "pch_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "pch_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "pch_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [7, 7, 7] } },
      { id: "pch_noise", typeId: "texture_noise", x: 260, y: 60, params: { scale: 5, detail: 6, roughness: 0.55 } },
      {
        id: "pch_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.72, 0.62, 0.42, 1] },
            { position: 0.5, color: [0.85, 0.76, 0.56, 1] },
            { position: 1, color: [0.93, 0.87, 0.7, 1] },
          ],
        },
      },
      { id: "pch_fresnel", typeId: "input_fresnel", x: 260, y: 260, params: { ior: 1.33 } },
      { id: "pch_edge_scale", typeId: "converter_math", x: 540, y: 260, params: { value2: 0.7, operation: "multiply" } },
      { id: "pch_mix", typeId: "color_mix", x: 800, y: 140, params: { b: [0.35, 0.24, 0.14, 1], mode: "multiply" } },
      { id: "pch_noise_grain", typeId: "texture_noise", x: 260, y: 420, params: { scale: 40, detail: 3 } },
      { id: "pch_bump", typeId: "vector_bump", x: 540, y: 420, params: { strength: 0.15 } },
      { id: "pch_principled", typeId: "shader_principled_bsdf", x: 1060, y: 220, params: { roughness: 0.75, metallic: 0 } },
    ],
    links: [
      { id: "pch_l1", fromNode: "pch_texcoord", fromSocket: "generated", toNode: "pch_mapping", toSocket: "vector" },
      { id: "pch_l2", fromNode: "pch_mapping", fromSocket: "vector", toNode: "pch_noise", toSocket: "vector" },
      { id: "pch_l3", fromNode: "pch_noise", fromSocket: "fac", toNode: "pch_ramp", toSocket: "fac" },
      { id: "pch_l4", fromNode: "pch_fresnel", fromSocket: "fac", toNode: "pch_edge_scale", toSocket: "value1" },
      { id: "pch_l5", fromNode: "pch_ramp", fromSocket: "color", toNode: "pch_mix", toSocket: "a" },
      { id: "pch_l6", fromNode: "pch_edge_scale", fromSocket: "value", toNode: "pch_mix", toSocket: "fac" },
      { id: "pch_l7", fromNode: "pch_mix", fromSocket: "color", toNode: "pch_principled", toSocket: "baseColor" },
      { id: "pch_l8", fromNode: "pch_mapping", fromSocket: "vector", toNode: "pch_noise_grain", toSocket: "vector" },
      { id: "pch_l9", fromNode: "pch_noise_grain", fromSocket: "fac", toNode: "pch_bump", toSocket: "height" },
      { id: "pch_l10", fromNode: "pch_bump", fromSocket: "normal", toNode: "pch_principled", toSocket: "normal" },
      { id: "pch_l11", fromNode: "pch_principled", fromSocket: "bsdf", toNode: "pch_out", toSocket: "surface" },
    ],
  },
};
