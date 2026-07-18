import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_vector_curves",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "向量曲線：非線性扭曲法線", en: "Vector Curves: Nonlinearly Warp a Normal" },
  description: {
    zh: "向量曲線（Vector Curves）跟 RGB 曲線概念相同，只是套用在向量（例如法線）上而不是顏色——可以做出比線性運算更細膩的方向扭曲效果。",
    en: "Vector Curves is the same concept as RGB Curves, but applied to a vector (like a normal) instead of a color — enabling more nuanced direction warping than a linear operation.",
  },
  startGraph: {
    nodes: [
      { id: "t_vc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3, metallic: 0.6 } },
    ],
    links: [{ id: "t_vc_l1", fromNode: "t_vc_principled", fromSocket: "bsdf", toNode: "t_vc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vc_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.3, metallic: 0.6 } },
      { id: "te_vc_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 1.5 } },
      {
        id: "te_vc_curves",
        typeId: "vector_curves",
        x: 300,
        y: 300,
        params: { fac: 1, points: [{ x: -1, y: -0.3 }, { x: 1, y: 0.3 }] },
      },
      { id: "te_vc_noise", typeId: "texture_noise", x: 60, y: 300, params: { scale: 6 } },
    ],
    links: [
      { id: "te_vc_l1", fromNode: "te_vc_principled", fromSocket: "bsdf", toNode: "te_vc_out", toSocket: "surface" },
      { id: "te_vc_l2", fromNode: "te_vc_bump", fromSocket: "normal", toNode: "te_vc_principled", toSocket: "normal" },
      { id: "te_vc_l3", fromNode: "te_vc_curves", fromSocket: "vector", toNode: "te_vc_bump", toSocket: "height" },
      { id: "te_vc_l4", fromNode: "te_vc_noise", fromSocket: "fac", toNode: "te_vc_curves", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入雜訊紋理與凹凸節點", en: "Step 1: Add a Noise Texture and Bump" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）與凹凸（Bump）節點，把凹凸的輸出接到原理化 BSDF（Principled BSDF）的法線（Normal），先直接用雜訊接到凹凸的高度（Height）。",
        en: "Add a Noise Texture and a Bump node, connect Bump's output to Principled BSDF's Normal, and wire Noise directly into Bump's Height for now.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第二步：插入向量曲線", en: "Step 2: Insert Vector Curves" },
      instruction: {
        zh: "在雜訊紋理跟凹凸節點中間插入向量曲線（Vector Curves），雜訊的係數（Fac）接到向量曲線的向量（Vector）輸入，向量曲線的輸出接到凹凸的高度（Height）。",
        en: "Insert Vector Curves between Noise Texture and Bump — connect Noise's Fac to Vector Curves' Vector input, and Vector Curves' output to Bump's Height.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_curves", "vector", "vector_bump", "height"),
    },
    {
      title: { zh: "第三步：壓縮曲線範圍", en: "Step 3: Compress the Curve's Range" },
      instruction: {
        zh: "把向量曲線的控制點拖成一條比較平緩（斜率較小）的線，例如兩端從 (-1,-1)/(1,1) 改成 (-1,-0.3)/(1,0.3)。凹凸的起伏程度應該會變得更細膩、更柔和，而不是死板的線性強度。",
        en: "Drag the Vector Curves control points into a flatter (lower-slope) line, e.g. from (-1,-1)/(1,1) to (-1,-0.3)/(1,0.3). The bump's relief should become subtler and softer instead of a rigid linear intensity.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "vector_curves", "points", (pts) => {
          if (!Array.isArray(pts) || pts.length < 2) return false;
          const sorted = [...pts].sort((a, b) => a.x - b.x);
          const first = sorted[0], last = sorted[sorted.length - 1];
          const slope = (last.y - first.y) / Math.max(last.x - first.x, 0.0001);
          return slope < 0.7;
        }),
    },
  ],
  quiz: [
    {
      question: {
        zh: "把向量曲線（Vector Curves）的控制點拖成斜率較小（較平緩）的線之後，凹凸（Bump）的起伏強度會怎麼變化？",
        en: "After dragging Vector Curves' control points into a flatter (lower-slope) line, what happens to the Bump effect's intensity?",
      },
      options: [
        { zh: "變得更細膩柔和——輸出範圍被壓縮，同樣的雜訊變化量只能換來較小的高度差", en: "It becomes subtler and softer — the output range is compressed, so the same noise variation yields a smaller height difference" },
        { zh: "完全不受影響——Bump 只在乎 0/1 兩種極端狀態", en: "No effect at all — Bump only cares about the two extremes, 0 and 1" },
        { zh: "變得更劇烈——斜率愈小代表變化愈快", en: "It becomes more intense — a smaller slope means faster change" },
        { zh: "凹凸方向會左右顛倒", en: "The bump direction flips left-right" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "曲線斜率愈平緩，代表輸入的變化被壓縮成更小的輸出變化範圍；同一組雜訊資料接上壓縮過的曲線之後，驅動 Bump 產生的高度落差自然更小、更柔和，跟「劇烈」或「方向顛倒」都無關。",
        en: "A flatter curve slope compresses input variation into a smaller output range. The same noise data, run through a compressed curve, drives a smaller height difference in Bump — subtler, not more intense or reversed.",
      },
    },
  ],
};
