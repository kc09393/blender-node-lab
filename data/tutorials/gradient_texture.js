import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_gradient_texture",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "漸變紋理：最簡單的紋理節點", en: "Gradient Texture: The Simplest Texture Node" },
  description: {
    zh: "漸變紋理（Gradient Texture）沒有任何複雜參數，就是沿著一個方向從黑到白平滑漸變——最適合拿來理解「紋理節點輸出的其實就是一個 0 到 1 的數值」這件事。",
    en: "Gradient Texture has no complex parameters — it's just a smooth black-to-white transition along a direction. The simplest way to understand that a texture node's output is really just a 0-to-1 value.",
  },
  startGraph: {
    nodes: [
      { id: "t_gt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_gt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_gt_l1", fromNode: "t_gt_principled", fromSocket: "bsdf", toNode: "t_gt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_gt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_gt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_gt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.05, 0.1, 0.35, 1] }, { position: 1, color: [0.95, 0.6, 0.15, 1] }] },
      },
      { id: "te_gt_gradient", typeId: "texture_gradient", x: 300, y: 100, params: { type: "spherical" } },
    ],
    links: [
      { id: "te_gt_l1", fromNode: "te_gt_principled", fromSocket: "bsdf", toNode: "te_gt_out", toSocket: "surface" },
      { id: "te_gt_l2", fromNode: "te_gt_ramp", fromSocket: "color", toNode: "te_gt_principled", toSocket: "baseColor" },
      { id: "te_gt_l3", fromNode: "te_gt_gradient", fromSocket: "fac", toNode: "te_gt_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入漸變紋理", en: "Step 1: Add a Gradient Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入漸變紋理（Gradient Texture），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。預設是線性（Linear）漸層，應該會看到球體從一側到另一側由黑到白。",
        en: "Drag in a Gradient Texture from the Texture category and connect it to Principled BSDF's Base Color. The default is Linear, so the sphere should fade from black to white across one axis.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_gradient", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：切換成球狀", en: "Step 2: Switch to Spherical" },
      instruction: {
        zh: "把類型（Type）改成球狀（Spherical）。漸層應該會從中心點向外呈環狀擴散，而不是單一方向的線性漸變。\n\n小提醒：放射狀（Radial）是另一種類型，效果是繞著中心點「角度掃描」（像時鐘指針轉一圈），不是這裡要的環狀擴散，兩個類型不要搞混。",
        en: "Change Type to Spherical. The gradient should now radiate outward from a center point in rings, instead of fading in a single direction.\n\nNote: Radial is a different type — it sweeps by angle around the center (like a clock hand), not the ring-expansion effect used here. Don't mix the two up.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_gradient", "type", (v) => v === "spherical"),
    },
    {
      title: { zh: "第三步：接到顏色漸變上色", en: "Step 3: Color It with a Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp），把漸變紋理的係數（Fac）接到它的係數（Fac），再把顏色漸變的顏色（Color）接到底色，取代直接接的黑白漸層——這樣就能把單純的黑白漸層轉成任意配色。",
        en: "Add a Color Ramp, connect Gradient Texture's Fac to its Fac, then connect the Color Ramp's Color to Base Color instead — turning the plain black/white gradient into any color scheme you like.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_gradient", "fac", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "漸變紋理的「放射狀 Radial」類型，實際計算的是什麼？",
        en: "What does Gradient Texture's 'Radial' type actually compute?",
      },
      options: [
        { zh: "繞著中心點的角度掃描（像時鐘指針轉一圈）", en: "An angular sweep around the center (like a clock hand)" },
        { zh: "距離中心點的遠近，向外呈環狀擴散", en: "Distance from the center, radiating outward in rings" },
        { zh: "沿 Z 軸的高度", en: "Height along the Z axis" },
        { zh: "隨機雜訊", en: "Random noise" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "放射狀（Radial）是角度掃描；距離中心點呈環狀擴散的其實是球狀（Spherical）——這兩個名字很容易讓人以為反過來（本站過去真的把這兩個公式弄反過，修正過一次），使用時要特別留意分清楚。",
        en: "Radial sweeps by angle. The ring-expansion-from-center effect is actually Spherical — the two names are easy to mix up (this site once genuinely had the two formulas swapped and had to fix it), so it's worth double-checking which one you actually want.",
      },
    },
  ],
};
