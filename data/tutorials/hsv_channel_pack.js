import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_hsv_channel_pack",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "分離顏色：只調飽和度不動色相", en: "Separate Color: Adjust Only Saturation" },
  description: {
    zh: "分離顏色（Separate Color）跟合併顏色（Combine Color）現在支援 HSV／HSL 模式，可以把色相、飽和度、明度拆開單獨處理——這裡示範只把飽和度調高，讓沃羅諾伊紋理的隨機色塊變得更鮮豔，色相跟明暗完全不受影響。",
    en: "Separate Color and Combine Color now support HSV/HSL modes, letting you split hue, saturation, and value apart and adjust just one. Here we boost only saturation on a Voronoi Texture's random cell colors, making them more vivid without touching hue or brightness.",
  },
  startGraph: {
    nodes: [
      { id: "t_hcp_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_hcp_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_hcp_l1", fromNode: "t_hcp_principled", fromSocket: "bsdf", toNode: "t_hcp_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_hcp_out", typeId: "output_material", x: 1300, y: 160, params: {} },
      { id: "te_hcp_principled", typeId: "shader_principled_bsdf", x: 1040, y: 100, params: {} },
      { id: "te_hcp_combine", typeId: "converter_combine_color", x: 800, y: 100, params: { mode: "hsv" } },
      { id: "te_hcp_math", typeId: "converter_math", x: 560, y: 220, params: { operation: "multiply", value2: 2.5, clamp: true } },
      { id: "te_hcp_separate", typeId: "converter_separate_color", x: 320, y: 100, params: { mode: "hsv" } },
      { id: "te_hcp_voronoi", typeId: "texture_voronoi", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_hcp_l1", fromNode: "te_hcp_principled", fromSocket: "bsdf", toNode: "te_hcp_out", toSocket: "surface" },
      { id: "te_hcp_l2", fromNode: "te_hcp_combine", fromSocket: "color", toNode: "te_hcp_principled", toSocket: "baseColor" },
      { id: "te_hcp_l3", fromNode: "te_hcp_voronoi", fromSocket: "color", toNode: "te_hcp_separate", toSocket: "color" },
      { id: "te_hcp_l4", fromNode: "te_hcp_separate", fromSocket: "r", toNode: "te_hcp_combine", toSocket: "r" },
      { id: "te_hcp_l5", fromNode: "te_hcp_separate", fromSocket: "g", toNode: "te_hcp_math", toSocket: "value1" },
      { id: "te_hcp_l6", fromNode: "te_hcp_math", fromSocket: "value", toNode: "te_hcp_combine", toSocket: "g" },
      { id: "te_hcp_l7", fromNode: "te_hcp_separate", fromSocket: "b", toNode: "te_hcp_combine", toSocket: "b" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入沃羅諾伊紋理", en: "Step 1: Add a Voronoi Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入沃羅諾伊紋理（Voronoi Texture），它的顏色（Color）輸出是每個細胞一個隨機顏色，很適合拿來測試飽和度調整。",
        en: "Drag in a Voronoi Texture from the Texture category. Its Color output gives each cell a random color — great for testing a saturation tweak.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_voronoi"),
    },
    {
      title: { zh: "第二步：用分離顏色拆開 HSV", en: "Step 2: Split HSV with Separate Color" },
      instruction: {
        zh: "加入分離顏色（Separate Color，轉換器 Converter 分類），把模式（Mode）切換成 HSV，然後把沃羅諾伊紋理的顏色（Color）接到它的顏色輸入。三個輸出的標籤會自動變成「色相 H／飽和度 S／明度 V」。",
        en: "Add a Separate Color (Converter category), switch its Mode to HSV, and connect Voronoi Texture's Color to its Color input. The three outputs will relabel themselves to Hue (H)/Saturation (S)/Value (V).",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "color", "converter_separate_color", "color") &&
        anyNodeParamMatches(graph, "converter_separate_color", "mode", (v) => v === "hsv"),
    },
    {
      title: { zh: "第三步：用 Math 節點放大飽和度", en: "Step 3: Boost Saturation with a Math Node" },
      instruction: {
        zh: "加入數學（Math，轉換器 Converter 分類），運算選「相乘 Multiply」，把分離顏色的飽和度 S 輸出接到它的第一個數值，第二個數值改成 2 以上（例如 2.5），並打開夾值（Clamp）避免超出範圍。這樣飽和度會被放大，但色相跟明度完全不受影響。",
        en: "Add a Math node (Converter category), set its operation to Multiply, connect Separate Color's Saturation (S) output to its first value, and set the second value to 2 or higher (e.g. 2.5). Turn on Clamp to keep it in range. This amplifies saturation while leaving hue and value completely untouched.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_separate_color", "g", "converter_math", "value1") &&
        anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "multiply"),
    },
    {
      title: { zh: "第四步：用合併顏色接回去", en: "Step 4: Reassemble with Combine Color" },
      instruction: {
        zh: "加入合併顏色（Combine Color），模式也切換成 HSV。把分離顏色的色相 H 接到它的第一個輸入、放大後的飽和度接到第二個輸入、分離顏色的明度 V 接到第三個輸入，再把合併顏色的顏色（Color）輸出接到原理化 BSDF 的底色（Base Color）。畫面應該會變得比原本鮮豔很多，但花紋（色相分布）看起來完全一樣。",
        en: "Add a Combine Color, also set to HSV mode. Connect Separate Color's Hue to its first input, the boosted saturation to its second input, and Separate Color's Value to its third input — then connect Combine Color's Color output to Principled BSDF's Base Color. The result should look noticeably more vivid, while the pattern (hue distribution) looks exactly the same.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_combine_color", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "converter_combine_color", "mode", (v) => v === "hsv"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "用分離顏色（HSV 模式）拆開沃羅諾伊紋理的顏色、只把飽和度（S）乘以 2.5 後再合併回去，畫面的「花紋分布」（哪個細胞屬於哪個顏色區域）會怎麼變化？",
        en: "After splitting Voronoi's color with Separate Color (HSV), boosting only Saturation ×2.5, then recombining — how does the 'pattern' (which cell belongs to which color region) change?",
      },
      options: [
        {
          zh: "花紋分布完全不變，因為色相（H）沒有被動到，只有每個細胞原本的顏色變得更鮮豔",
          en: "The pattern is unchanged — Hue (H) was never touched, only each cell's existing color became more vivid",
        },
        { zh: "花紋分布會被打亂，因為調整飽和度連帶讓每個細胞重新隨機選色", en: "The pattern gets scrambled — adjusting saturation re-randomizes each cell's color" },
        { zh: "花紋會整個消失，變成單一顏色", en: "The pattern disappears entirely into a single flat color" },
        { zh: "花紋分布會反轉（原本亮的細胞變暗，暗的變亮）", en: "The pattern inverts — cells that were bright become dark and vice versa" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "HSV 三個分量互相獨立——色相（H）決定「是哪個顏色」、飽和度（S）決定「顏色多鮮豔」。只調整 S 並重新合併，H 完全原封不動，所以哪個細胞屬於哪種色系的花紋分布不會改變，只有整體變得更飽和鮮豔。",
        en: "HSV's three components are independent — Hue (H) decides 'which color', Saturation (S) decides 'how vivid'. Adjusting only S and recombining leaves H completely untouched, so which cell belongs to which hue never changes — only the overall vividness increases.",
      },
    },
  ],
};
