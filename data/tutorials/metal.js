export default {
  id: "tutorial_metal",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出拉絲金屬", en: "Make Brushed Metal" },
  description: {
    zh: "用雜訊紋理（Noise Texture）驅動粗糙度（Roughness），做出粗糙度有變化的金屬，比固定數值更真實。",
    en: "Drive Roughness with a Noise Texture to create metal with varying roughness — more realistic than a flat value.",
  },
  startGraph: {
    nodes: [
      { id: "t_metal_out", typeId: "output_material", x: 700, y: 160, params: {} },
      { id: "t_metal_principled", typeId: "shader_principled_bsdf", x: 380, y: 100, params: {} },
    ],
    links: [{ id: "t_metal_l1", fromNode: "t_metal_principled", fromSocket: "bsdf", toNode: "t_metal_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_metal_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_metal_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { metallic: 1 } },
      { id: "te_metal_maprange", typeId: "converter_map_range", x: 560, y: 100, params: { fromMin: 0, fromMax: 1, toMin: 0.15, toMax: 0.45 } },
      { id: "te_metal_noise", typeId: "texture_noise", x: 320, y: 100, params: { scale: 24 } },
      { id: "te_metal_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_metal_l1", fromNode: "te_metal_principled", fromSocket: "bsdf", toNode: "te_metal_out", toSocket: "surface" },
      { id: "te_metal_l2", fromNode: "te_metal_maprange", fromSocket: "value", toNode: "te_metal_principled", toSocket: "roughness" },
      { id: "te_metal_l3", fromNode: "te_metal_noise", fromSocket: "fac", toNode: "te_metal_maprange", toSocket: "value" },
      { id: "te_metal_l4", fromNode: "te_metal_texcoord", fromSocket: "generated", toNode: "te_metal_noise", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./metal.steps.js").then((m) => m.default),
};
