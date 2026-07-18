export default {
  id: "circuit_board",
  name: { zh: "電路板", en: "Circuit Board" },
  description: {
    zh: "線框節點抓出面片邊線當作電路走線，乘上倍率驅動發光強度；粗糙度另外由雜訊紋理驅動，做出板材表面的細微差異。",
    en: "Wireframe extracts the mesh's edges as circuit traces, scaled up to drive Emission Strength; Roughness is separately driven by Noise Texture for subtle board-surface variation.",
  },
  graph: {
    nodes: [
      { id: "circuit_out", typeId: "output_material", x: 1160, y: 220, params: {} },
      {
        id: "circuit_base",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 60,
        params: { baseColor: [0.03, 0.12, 0.05, 1], metallic: 0 },
      },
      { id: "circuit_wire", typeId: "input_wireframe", x: 500, y: 260, params: { size: 0.012 } },
      {
        id: "circuit_wiremul",
        typeId: "converter_math",
        x: 700,
        y: 260,
        params: { operation: "multiply", value2: 6 },
      },
      {
        id: "circuit_emission",
        typeId: "shader_emission",
        x: 900,
        y: 320,
        params: { color: [0.2, 1, 0.5, 1] },
      },
      { id: "circuit_add", typeId: "shader_add_shader", x: 1040, y: 200, params: {} },
      { id: "circuit_noise", typeId: "texture_noise", x: 260, y: 460, params: { scale: 6, detail: 3 } },
      {
        id: "circuit_maprange",
        typeId: "converter_map_range",
        x: 500,
        y: 460,
        params: { fromMin: 0, fromMax: 1, toMin: 0.35, toMax: 0.6 },
      },
    ],
    links: [
      { id: "circuit_l1", fromNode: "circuit_add", fromSocket: "bsdf", toNode: "circuit_out", toSocket: "surface" },
      { id: "circuit_l2", fromNode: "circuit_base", fromSocket: "bsdf", toNode: "circuit_add", toSocket: "shader1" },
      { id: "circuit_l3", fromNode: "circuit_emission", fromSocket: "bsdf", toNode: "circuit_add", toSocket: "shader2" },
      { id: "circuit_l4", fromNode: "circuit_wire", fromSocket: "fac", toNode: "circuit_wiremul", toSocket: "value1" },
      { id: "circuit_l5", fromNode: "circuit_wiremul", fromSocket: "value", toNode: "circuit_emission", toSocket: "strength" },
      { id: "circuit_l6", fromNode: "circuit_noise", fromSocket: "fac", toNode: "circuit_maprange", toSocket: "value" },
      { id: "circuit_l7", fromNode: "circuit_maprange", fromSocket: "value", toNode: "circuit_base", toSocket: "roughness" },
    ],
  },
};
