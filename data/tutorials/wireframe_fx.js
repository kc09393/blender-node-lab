import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

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
  steps: [
    {
      title: { zh: "第一步：加入 Wireframe 節點", en: "Step 1: Add a Wireframe Node" },
      instruction: {
        zh: "從「輸入 Input」分類拖入線框（Wireframe）節點——它的係數（Fac）輸出在三角面邊線附近會接近 1，其餘地方接近 0。",
        en: "Drag in a Wireframe node from the Input category — its Fac output is near 1 close to triangle edges and near 0 elsewhere.",
      },
      check: (graph) => hasNodeOfType(graph, "input_wireframe"),
    },
    {
      title: { zh: "第二步：加入 Emission 並接到輸出", en: "Step 2: Add Emission and Connect to Output" },
      instruction: {
        zh: "拖入發光（Emission）節點，接到材質輸出（Material Output）的表面（Surface）。顏色（Color）可以先改成喜歡的螢光色（例如青色）。",
        en: "Drag in an Emission node and connect it to Material Output's Surface. Set Color to a glowing tone you like (e.g. cyan).",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_emission"),
    },
    {
      title: { zh: "第三步：用 Fac 驅動發光強度", en: "Step 3: Drive Strength with Fac" },
      instruction: {
        zh: "把線框（Wireframe）的係數（Fac）輸出接到發光（Emission）的強度（Strength）。現在應該只有三角面邊線在發光，其餘表面是黑的。",
        en: "Connect Wireframe's Fac output to Emission's Strength. Now only the triangle edges should glow, with the rest of the surface dark.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_wireframe", "fac", "shader_emission", "strength"),
    },
    {
      title: { zh: "第四步：調細線框", en: "Step 4: Thin Out the Lines" },
      instruction: {
        zh: "把線框（Wireframe）的粗細（Size）調到 0.02 以下，線條會變得更細緻銳利，比較像精密的全息投影，而不是粗糙的網格線。",
        en: "Set Wireframe's Size below 0.02 — the lines become thinner and crisper, closer to a precise hologram than a chunky mesh overlay.",
      },
      check: (graph) => anyNodeParamMatches(graph, "input_wireframe", "size", (v) => typeof v === "number" && v <= 0.02),
    },
  ],
};
