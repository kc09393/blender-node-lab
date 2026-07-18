import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_bump_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識凹凸節點：假造出來的立體感", en: "Get to Know Bump: Faking Surface Detail" },
  description: {
    zh: "凹凸（Bump）幾乎出現在所有有質感的材質裡——用一個灰階高度值假造出表面凹凸的光影效果，不會真的改變幾何形狀。這篇帶你認識 Height、Strength 兩個插槽，還有初學者最常忘記的一件事：Bump 的輸出一定要接到法線（Normal）插槽才會有效果。",
    en: "Bump shows up in nearly every textured material — it fakes surface bumps' lighting from a grayscale height value, without actually changing the geometry. This tutorial covers Height and Strength, plus the one thing beginners most often forget: Bump's output must be connected to a Normal socket to have any effect at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_bpt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bpt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3 } },
    ],
    links: [{ id: "t_bpt_l1", fromNode: "t_bpt_principled", fromSocket: "bsdf", toNode: "t_bpt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bpt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_bpt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.3 } },
      { id: "te_bpt_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 2.5 } },
      { id: "te_bpt_voronoi", typeId: "texture_voronoi", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_bpt_l1", fromNode: "te_bpt_principled", fromSocket: "bsdf", toNode: "te_bpt_out", toSocket: "surface" },
      { id: "te_bpt_l2", fromNode: "te_bpt_bump", fromSocket: "normal", toNode: "te_bpt_principled", toSocket: "normal" },
      { id: "te_bpt_l3", fromNode: "te_bpt_voronoi", fromSocket: "distance", toNode: "te_bpt_bump", toSocket: "height" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：雜訊接 Bump 接法線", en: "Step 1: Noise → Bump → Normal" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）跟凹凸（Bump，向量 Vector 分類），把雜訊的係數（Fac）接到 Bump 的高度（Height），再把 Bump 的法線（Normal）輸出接到原理化 BSDF 的法線（Normal）插槽。⚠️ 一定要接到 Normal 插槽——接到 Base Color 或其他插槽完全不會有凹凸效果，這是最常見的誤區。",
        en: "Add a Noise Texture and a Bump node (Vector category), connect Noise's Fac to Bump's Height, then connect Bump's Normal output to Principled BSDF's Normal socket. ⚠️ It must go into the Normal socket — connecting it anywhere else (like Base Color) produces zero bump effect. This is the single most common beginner mistake with this node.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第二步：調高強度，感受凹凸變明顯", en: "Step 2: Raise Strength for a Deeper Effect" },
      instruction: {
        zh: "把強度（Strength）調到 2 以上。凹凸感會變得更明顯、更誇張——Strength 直接放大高度值換算成法線偏移的幅度，數值越高，表面看起來起伏越劇烈。",
        en: "Raise Strength above 2. The bump effect becomes noticeably more pronounced — Strength directly scales how much the height value bends the normal, so higher values give more dramatic surface relief.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_bump", "strength", (v) => v >= 2),
    },
    {
      title: { zh: "第三步：換一個高度來源，看不同的凹凸圖案", en: "Step 3: Swap the Height Source for a Different Pattern" },
      instruction: {
        zh: "把雜訊紋理換成沃羅諾伊紋理（Voronoi Texture），距離（Distance）輸出接到 Bump 的高度（Height）。凹凸的圖案完全變了——Bump 本身沒有任何花紋，它只是把「接進來的任何數值」轉換成凹凸感，花紋長什麼樣子完全取決於 Height 接的是哪個紋理節點。",
        en: "Swap in a Voronoi Texture, connecting its Distance output to Bump's Height. The bump pattern completely changes — Bump itself has no pattern of its own; it just converts whatever value feeds its Height into a bump effect. The pattern's shape depends entirely on which texture node feeds Height.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "vector_bump", "height"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "凹凸（Bump）節點接好 Height 之後，它的輸出（Normal）還必須接到哪裡才會真的看到效果？",
        en: "After wiring Bump's Height input, where must its Normal output be connected for the effect to actually show?",
      },
      options: [
        { zh: "材質輸出的 Displacement 插槽", en: "Material Output's Displacement socket" },
        { zh: "原理化 BSDF 的 Normal 插槽", en: "Principled BSDF's Normal socket" },
        { zh: "不用接任何地方，Height 接好就會自動生效", en: "Nowhere — it works automatically once Height is wired" },
        { zh: "另一個 Bump 節點的 Height 插槽", en: "Another Bump node's Height socket" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "只接 Height 完全沒有效果——Bump 真正輸出的是修改過的法線向量，一定要接到著色器（例如原理化 BSDF）的 Normal 插槽，光影才會真的呈現凹凸感。這是初學者最容易忘記的一步。",
        en: "Wiring only Height does nothing on its own — what Bump actually outputs is a modified normal vector, which must be connected to a shader's (e.g. Principled BSDF's) Normal socket for the lighting to actually show the bump. This is the step beginners forget most often.",
      },
    },
  ],
};
