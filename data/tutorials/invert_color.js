import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_invert_color",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "反色：快速做出互補色遮罩", en: "Invert Color: Instant Complementary Masks" },
  description: {
    zh: "反色（Invert Color）節點把顏色變成 1 減去原本的值，常用來把黑白遮罩反過來用——例如把「哪裡有雜訊」變成「哪裡沒有雜訊」，不用重新調整上游節點。",
    en: "Invert Color computes 1 minus the original value — commonly used to flip a black/white mask, e.g. turning 'where there's noise' into 'where there isn't', without touching the upstream nodes at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_iv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_iv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_iv_l1", fromNode: "t_iv_principled", fromSocket: "bsdf", toNode: "t_iv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_iv_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_iv_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_iv_invert", typeId: "color_invert", x: 560, y: 100, params: { fac: 1 } },
      { id: "te_iv_checker", typeId: "texture_checker", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_iv_l1", fromNode: "te_iv_principled", fromSocket: "bsdf", toNode: "te_iv_out", toSocket: "surface" },
      { id: "te_iv_l2", fromNode: "te_iv_invert", fromSocket: "color", toNode: "te_iv_principled", toSocket: "baseColor" },
      { id: "te_iv_l3", fromNode: "te_iv_checker", fromSocket: "color", toNode: "te_iv_invert", toSocket: "color" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入棋盤格紋理", en: "Step 1: Add a Checker Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入棋盤格紋理（Checker Texture），先接到原理化 BSDF（Principled BSDF）的底色（Base Color），記住黑白格子的排列方式。",
        en: "Drag in a Checker Texture from the Texture category and connect it to Principled BSDF's Base Color for now — take note of which squares are black and which are white.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_checker"),
    },
    {
      title: { zh: "第二步：插入反色節點", en: "Step 2: Insert an Invert Color" },
      instruction: {
        zh: "從「顏色 Color」分類拖入反色（Invert Color），插在棋盤格紋理跟底色之間——棋盤格的顏色（Color）輸出接到反色的顏色輸入，反色的輸出接到底色。",
        en: "Drag in an Invert Color from the Color category and insert it between Checker Texture and Base Color — Checker's Color output feeds Invert's Color input, and Invert's output feeds Base Color.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_checker", "color", "color_invert", "color") &&
        hasLinkBetweenTypes(graph, "color_invert", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第三步：確認顏色對調了", en: "Step 3: Confirm the Colors Swapped" },
      instruction: {
        zh: "看看即時預覽，原本黑色的格子現在應該變白色、白色的格子變黑色。\n\n完全不用去改棋盤格紋理本身的任何設定，只靠反色節點就對調了。",
        en: "Check the live preview — squares that were black should now be white, and vice versa.\n\nWithout touching a single setting on the Checker Texture itself, Invert Color alone did the swap.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_invert", "fac", (v) => typeof v === "number" && v >= 0.8),
    },
  ],
  quiz: [
    {
      question: {
        zh: "反色（Invert Color）節點的運算公式是？",
        en: "What formula does Invert Color compute?",
      },
      options: [
        { zh: "顏色乘以 -1", en: "Color multiplied by -1" },
        { zh: "1 減去原本的顏色值", en: "1 minus the original color value" },
        { zh: "顏色除以 2", en: "Color divided by 2" },
        { zh: "顏色的平方根", en: "The square root of the color" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Invert Color 就是 1 減去原本的值，是最簡單的「把黑白遮罩反過來用」手法——例如把『哪裡有雜訊』變成『哪裡沒有雜訊』，完全不用回頭改上游節點的任何設定。",
        en: "Invert Color simply computes 1 minus the original value — the simplest way to flip a black/white mask, e.g. turning 'where there's noise' into 'where there isn't', without touching any upstream node's settings.",
      },
    },
  ],
};
