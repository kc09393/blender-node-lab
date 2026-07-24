export default {
  id: "tutorial_glass",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "做出一個玻璃材質", en: "Make a Glass Material" },
  description: {
    zh: "用玻璃 BSDF（Glass BSDF）節點做出一個清澈的玻璃球，認識粗糙度（Roughness）與 IOR 這兩個關鍵參數。",
    en: "Use the Glass BSDF node to create a clear glass sphere, learning the Roughness and IOR parameters along the way.",
  },
  startGraph: {
    nodes: [
      { id: "t_glass_out", typeId: "output_material", x: 520, y: 160, params: {} },
      { id: "t_glass_principled", typeId: "shader_principled_bsdf", x: 200, y: 100, params: {} },
    ],
    links: [{ id: "t_glass_l1", fromNode: "t_glass_principled", fromSocket: "bsdf", toNode: "t_glass_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_glass_out", typeId: "output_material", x: 520, y: 160, params: {} },
      { id: "te_glass_glass", typeId: "shader_glass_bsdf", x: 200, y: 100, params: { roughness: 0.02, ior: 1.45 } },
    ],
    links: [{ id: "te_glass_l1", fromNode: "te_glass_glass", fromSocket: "bsdf", toNode: "te_glass_out", toSocket: "surface" }],
  },
  loadSteps: () => import("./glass.steps.js").then((m) => m.default),
};
