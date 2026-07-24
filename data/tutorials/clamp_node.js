export default {
  id: "tutorial_clamp_node",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "夾值：防止數值跑出合理範圍", en: "Clamp: Keeping Values in Range" },
  description: {
    zh: "很多插槽（例如 Roughness）只接受 0-1，但接上其他運算節點後很容易跑出這個範圍。夾值（Clamp）節點強制把數值鎖在你指定的最小/最大之間，避免材質忽然全黑或全白。",
    en: "Many sockets (like Roughness) only expect 0-1, but wiring in other math nodes can easily push values outside that range. Clamp forces a value to stay within your chosen min/max, preventing a material from suddenly going pure black or white.",
  },
  startGraph: {
    nodes: [
      { id: "t_cl_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cl_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_cl_l1", fromNode: "t_cl_principled", fromSocket: "bsdf", toNode: "t_cl_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cl_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_cl_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_cl_clamp", typeId: "converter_clamp", x: 560, y: 100, params: { min: 0.2, max: 0.6 } },
      { id: "te_cl_math", typeId: "converter_math", x: 300, y: 100, params: { operation: "multiply", value2: 3 } },
      { id: "te_cl_noise", typeId: "texture_noise", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_cl_l1", fromNode: "te_cl_principled", fromSocket: "bsdf", toNode: "te_cl_out", toSocket: "surface" },
      { id: "te_cl_l2", fromNode: "te_cl_clamp", fromSocket: "value", toNode: "te_cl_principled", toSocket: "roughness" },
      { id: "te_cl_l3", fromNode: "te_cl_math", fromSocket: "value", toNode: "te_cl_clamp", toSocket: "value" },
      { id: "te_cl_l4", fromNode: "te_cl_noise", fromSocket: "fac", toNode: "te_cl_math", toSocket: "value1" },
    ],
  },
  loadSteps: () => import("./clamp_node.steps.js").then((m) => m.default),
};
