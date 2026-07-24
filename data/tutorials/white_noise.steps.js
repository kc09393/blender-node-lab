import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入白噪波紋理", en: "Step 1: Add a White Noise Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入白噪波紋理（White Noise Texture），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。直接接 UV 的話，畫面看起來會像雪花雜訊，沒有規律可言。",
        en: "Drag in a White Noise Texture from the Texture category and connect it to Principled BSDF's Base Color. Fed directly from UV, the result looks like TV static with no pattern.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_white_noise", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：改用沃羅諾伊的細胞位置當座標", en: "Step 2: Use Voronoi's Cell Position as the Coordinate" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）與沃羅諾伊紋理（Voronoi Texture）。\n\n把紋理座標的 Generated 輸出，接到沃羅諾伊的向量（Vector）輸入。\n\n把沃羅諾伊的 Position 輸出，接到白噪波紋理的向量輸入。\n\n這樣「每一格細胞」會得到一個固定的隨機顏色——因為同一格細胞內，Position 都是同一個值，White Noise 對同一個座標永遠輸出同一個顏色，就不會逐像素雜亂無章了。",
        en: "Add a Texture Coordinate and a Voronoi Texture, connect Texture Coordinate's Generated to Voronoi's Vector, then connect Voronoi's Position output to White Noise Texture's Vector input. Now each cell gets one fixed random color (since Position is constant within a cell), instead of noise scattered per-pixel.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_voronoi", "vector") &&
        hasLinkBetweenTypes(graph, "texture_voronoi", "position", "texture_white_noise", "vector"),
    },
    {
      title: { zh: "第三步：觀察結果", en: "Step 3: Observe the Result" },
      instruction: {
        zh: "看看即時預覽——現在應該是一塊塊清楚的隨機色塊，而不是逐像素的雪花雜訊。這證明了 White Noise 本身沒有「格子」概念，格子感其實來自沃羅諾伊的細胞分割，White Noise 只是負責把每個座標轉成一個隨機顏色。",
        en: "Check the live preview — you should now see clean random color blocks instead of per-pixel static. This shows White Noise itself has no notion of 'cells' — the blocky look comes from Voronoi's cell division; White Noise just turns each coordinate into a random color.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_white_noise") && hasNodeOfType(graph, "texture_voronoi"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "白噪波紋理（White Noise Texture）跟雜訊紋理（Noise Texture）最大的差別是？",
        en: "What's the biggest difference between White Noise Texture and Noise Texture?",
      },
      options: [
        { zh: "白噪波有平滑漸變，雜訊沒有", en: "White Noise has smooth gradients, Noise doesn't" },
        { zh: "白噪波完全沒有平滑漸變、每個座標互不相關；雜訊紋理則是連續平滑變化", en: "White Noise has no smooth gradient at all — every coordinate is unrelated; Noise Texture varies smoothly and continuously" },
        { zh: "兩者其實是同一個節點的不同名字", en: "They're actually the same node under two different names" },
        { zh: "白噪波只能輸出黑白，雜訊可以輸出顏色", en: "White Noise can only output grayscale, Noise can output color" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "雜訊紋理（Noise Texture）的相鄰座標值是連續平滑過渡的（雲霧狀）；白噪波紋理完全相反，每個座標的值都是獨立、互不相關的隨機數，看起來像電視雜訊，適合需要「完全隨機、不要任何空間關聯性」的場合。",
        en: "Noise Texture's neighboring coordinates transition smoothly and continuously (cloud-like). White Noise Texture is the opposite — every coordinate gets an independent, unrelated random value, looking like TV static. Good for situations that need pure randomness with zero spatial correlation.",
      },
    },
  ],
};
