export default {
  id: "tutorial_wireframe_fx",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "線框特效：科技感全息", en: "Wireframe FX: Tech Hologram Look" },
  description: {
    zh: "用線框（Wireframe）節點抓出三角面的邊線，接到發光（Emission）做出電影裡常見的「發光線框」全息效果。",
    en: "Use the Wireframe node to pick out triangle edges, then feed it into Emission for the glowing-lines hologram look seen in movies.",
  },
  startGraph: {
    nodes: [{ id: "t_wf_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_wf_out", typeId: "output_material", x: 700, y: 160, params: {} },
      { id: "te_wf_emission", typeId: "shader_emission", x: 400, y: 100, params: { color: [0.2, 0.9, 1, 1] } },
      { id: "te_wf_wire", typeId: "input_wireframe", x: 100, y: 100, params: { size: 0.015 } },
    ],
    links: [
      { id: "te_wf_l1", fromNode: "te_wf_emission", fromSocket: "bsdf", toNode: "te_wf_out", toSocket: "surface" },
      { id: "te_wf_l2", fromNode: "te_wf_wire", fromSocket: "fac", toNode: "te_wf_emission", toSocket: "strength" },
    ],
  },
  loadSteps: () => import("./wireframe_fx.steps.js").then((m) => m.default),
};
