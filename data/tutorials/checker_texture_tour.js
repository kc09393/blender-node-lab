import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_checker_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識棋盤格紋理：理解座標系統的最佳工具", en: "Get to Know Checker Texture: The Best Tool for Understanding Coordinates" },
  description: {
    zh: "棋盤格紋理（Checker Texture）看起來很簡單，卻是理解「座標系統」最好的工具——格子如果扭曲、拉伸、密度改變，代表座標本身在變化。這篇帶你認識 Color 1/2、Scale，還有換一個座標來源會怎麼影響格子。",
    en: "Checker Texture looks simple, but it's the best tool for understanding coordinate systems — if the squares stretch, distort, or change density, that tells you the coordinate itself is changing. This tutorial covers Color 1/2, Scale, and how swapping the coordinate source affects the pattern.",
  },
  startGraph: {
    nodes: [
      { id: "t_ctt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ctt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ctt_l1", fromNode: "t_ctt_principled", fromSocket: "bsdf", toNode: "t_ctt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ctt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_ctt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_ctt_checker", typeId: "texture_checker", x: 560, y: 100, params: { color1: [0.9, 0.2, 0.2, 1], color2: [0.1, 0.2, 0.6, 1], scale: 10 } },
      { id: "te_ctt_texcoord", typeId: "input_texture_coordinate", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_ctt_l1", fromNode: "te_ctt_principled", fromSocket: "bsdf", toNode: "te_ctt_out", toSocket: "surface" },
      { id: "te_ctt_l2", fromNode: "te_ctt_checker", fromSocket: "color", toNode: "te_ctt_principled", toSocket: "baseColor" },
      { id: "te_ctt_l3", fromNode: "te_ctt_texcoord", fromSocket: "generated", toNode: "te_ctt_checker", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入棋盤格紋理", en: "Step 1: Add a Checker Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入棋盤格紋理（Checker Texture），把顏色（Color）輸出接到原理化 BSDF 的底色（Base Color）。預設是黑白相間的格子，沒接任何座標時會自動使用 UV。",
        en: "Drag in a Checker Texture from the Texture category and connect its Color output to Principled BSDF's Base Color. The default is a black-and-white checkerboard, automatically using UV when nothing else is wired in.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：換兩個顏色", en: "Step 2: Swap in Two Colors" },
      instruction: {
        zh: "把顏色 1（Color 1）跟顏色 2（Color 2）都換成不是黑白的顏色（例如紅色跟藍色）。棋盤格不一定要是黑白的，任何兩個顏色都可以直接做出簡單的雙色材質。",
        en: "Change both Color 1 and Color 2 to non-black-and-white colors (e.g. red and blue). Checker doesn't have to be black-and-white — any two colors work as a simple two-tone material.",
      },
      check: (graph) =>
        anyNodeParamMatches(
          graph,
          "texture_checker",
          "color1",
          (v) => Array.isArray(v) && Math.max(v[0], v[1], v[2]) - Math.min(v[0], v[1], v[2]) > 0.15
        ),
    },
    {
      title: { zh: "第三步：調整縮放，看格子變密", en: "Step 3: Adjust Scale for Denser Squares" },
      instruction: {
        zh: "把縮放（Scale）調到 8 以上。格子會變得更小、更密集——Scale 支援任意正數（不限整數），數值越大，同樣的表面上塞得下越多格子。",
        en: "Raise Scale above 8. The squares get smaller and denser — Scale accepts any positive number (not just integers), and higher values fit more squares onto the same surface.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_checker", "scale", (v) => v >= 8),
    },
    {
      title: { zh: "第四步：換一個座標來源", en: "Step 4: Swap the Coordinate Source" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入 Input 分類），把它的 Generated 輸出接到棋盤格紋理的向量（Vector）輸入。格子的排列方式可能會跟著改變——這就是棋盤格紋理最重要的用途：只要格子看起來扭曲、接縫不對齊，通常就代表你接的座標系統本身有問題。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Checker Texture's Vector input. The squares' layout may shift — this is Checker Texture's most important use: whenever the squares look stretched or the seams don't line up, it usually means something's off with the coordinate system feeding it.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_checker", "vector"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "如果棋盤格的方格看起來被拉伸、扭曲、或密度不一致，這通常代表什麼？",
        en: "If the checker squares look stretched, distorted, or uneven in density, what does that usually indicate?",
      },
      options: [
        { zh: "Color 1/2 選錯顏色了", en: "The wrong colors were picked for Color 1/2" },
        { zh: "接進去的座標（Vector）本身在該處被拉伸或扭曲", en: "The coordinate (Vector) feeding it is itself stretched or distorted there" },
        { zh: "材質輸出沒有正確連接", en: "Material Output isn't wired correctly" },
        { zh: "這是正常現象，棋盤格本來就會這樣", en: "That's normal — checkerboards always look like this" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "棋盤格紋理本身只是均勻切割座標空間，它不會自己扭曲——格子看起來變形，代表接進去的座標（不管是 UV 展開還是 Generated）本身在那個區域被拉伸或壓縮，這正是它被拿來當座標系統『診斷工具』的原因。",
        en: "Checker Texture itself just uniformly divides the coordinate space — it never distorts on its own. If the squares look warped, the coordinate feeding it (whether UV unwrap or Generated) is being stretched or compressed there — exactly why it's used as a diagnostic tool for coordinate systems.",
      },
    },
  ],
};
