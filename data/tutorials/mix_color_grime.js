import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mix_color_grime",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合顏色：疊一層污漬", en: "Mix Color: Layering On Grime" },
  description: {
    zh: "混合顏色（Mix Color）節點的相乘（Multiply）模式只會讓顏色變暗、不會變亮——這正是疊加污漬、陰影貼圖的標準做法，概念上跟 Photoshop 圖層的「色彩增值」模式一樣。",
    en: "Mix Color's Multiply mode can only darken, never brighten — the standard technique for layering grime or shadow maps onto a base color. The same concept as Photoshop's 'Multiply' layer blend mode.",
  },
  startGraph: {
    nodes: [
      { id: "t_mc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.85, 0.8, 0.7, 1] } },
    ],
    links: [{ id: "t_mc_l1", fromNode: "t_mc_principled", fromSocket: "bsdf", toNode: "t_mc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mc_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_mc_principled", typeId: "shader_principled_bsdf", x: 1020, y: 100, params: { baseColor: [0.85, 0.8, 0.7, 1] } },
      { id: "te_mc_mix", typeId: "color_mix", x: 780, y: 100, params: { mode: "multiply", fac: 0.6 } },
      { id: "te_mc_voronoi", typeId: "texture_voronoi", x: 540, y: 100, params: { scale: 8 } },
      { id: "te_mc_texcoord", typeId: "input_texture_coordinate", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_mc_l1", fromNode: "te_mc_principled", fromSocket: "bsdf", toNode: "te_mc_out", toSocket: "surface" },
      { id: "te_mc_l2", fromNode: "te_mc_mix", fromSocket: "color", toNode: "te_mc_principled", toSocket: "baseColor" },
      { id: "te_mc_l3", fromNode: "te_mc_voronoi", fromSocket: "color", toNode: "te_mc_mix", toSocket: "b" },
      { id: "te_mc_l4", fromNode: "te_mc_texcoord", fromSocket: "generated", toNode: "te_mc_voronoi", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入沃羅諾伊紋理當作污漬圖案", en: "Step 1: Add Voronoi as the Grime Pattern" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）跟沃羅諾伊紋理（Voronoi Texture），把 Generated 接到向量（Vector），縮放（Scale）調高一點（例如 8）做出細碎的斑點。",
        en: "Add a Texture Coordinate and a Voronoi Texture, connect Generated to Vector, and raise Scale (e.g. to 8) for fine speckled spots.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_voronoi", "vector") &&
        anyNodeParamMatches(graph, "texture_voronoi", "scale", (v) => v >= 6),
    },
    {
      title: { zh: "第二步：加入混合顏色節點", en: "Step 2: Add a Mix Color Node" },
      instruction: {
        zh: "從「顏色 Color」分類拖入混合顏色（Mix Color），把 A 輸入先留著原本的底色，把沃羅諾伊的顏色（Color）輸出接到 B 輸入。",
        en: "Drag in a Mix Color from the Color category, leave A as the original base color, and connect Voronoi's Color output to the B input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "color", "color_mix", "b"),
    },
    {
      title: { zh: "第三步：切換成相乘模式", en: "Step 3: Switch to Multiply Mode" },
      instruction: {
        zh: "把混合模式改成相乘（Multiply）。這個模式的特性是「只會變暗、不會變亮」。\n\n不管 B 輸入的顏色多亮，結果都不會比原本的底色更亮，很適合做污漬、髒污。",
        en: "Change the blend mode to Multiply. Its defining trait is 'can only darken, never brighten'.\n\nNo matter how bright the B input is, the result never exceeds the original base color. Perfect for grime and dirt.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "multiply"),
    },
    {
      title: { zh: "第四步：接到底色並調整比例", en: "Step 4: Connect to Base Color and Adjust the Ratio" },
      instruction: {
        zh: "把混合顏色的輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color），把 Fac 調到 0.5 以上，讓污漬效果更明顯。",
        en: "Connect Mix Color's output to Principled BSDF's Base Color, and raise Fac above 0.5 to make the grime more visible.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "color_mix", "fac", (v) => v >= 0.5),
    },
  ],
  quiz: [
    {
      question: {
        zh: "混合顏色的相乘（Multiply）模式，有沒有可能讓顏色變得比原本更亮？",
        en: "Can Mix Color's Multiply mode ever make a color brighter than it started?",
      },
      options: [
        { zh: "可以，取決於 Fac 數值", en: "Yes, depending on the Fac value" },
        { zh: "不行，Multiply 只會讓顏色變暗或維持不變", en: "No — Multiply can only darken or leave it unchanged" },
        { zh: "可以，只要疊加的兩個顏色都很亮", en: "Yes, if both colors being combined are bright" },
        { zh: "這個模式沒有這個限制，效果不確定", en: "There's no such limit — the result is unpredictable" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Multiply 的公式是 a×b，因為顏色值範圍是 0-1，相乘的結果一定小於等於原本兩者中較小的那個，這正是它適合疊污漬、陰影貼圖的原因——想讓顏色變亮，要用它的反相版濾色（Screen）。",
        en: "Multiply's formula is a×b — since color values range 0-1, the product is always less than or equal to the smaller of the two, which is exactly why it's the standard tool for layering grime or shadows. To brighten, use its inverted counterpart, Screen.",
      },
    },
  ],
};
