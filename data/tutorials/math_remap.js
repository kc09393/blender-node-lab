import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_math_remap",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "用 Math 節點縮小數值範圍", en: "Narrow a Range with Math Nodes" },
  description: {
    zh: "雜訊紋理（Noise Texture）的輸出永遠是 0-1，但很多時候你只想要一個比較窄的範圍（例如 0.2-0.5）。這個教學帶你用兩個數學（Math）節點手動做出「乘＋加」的縮放平移，理解映射範圍（Map Range）背後其實在做的事。",
    en: "Noise Texture always outputs 0-1, but often you only want a narrower range (like 0.2-0.5). This tutorial walks through using two Math nodes to manually scale-and-offset — understanding what Map Range does under the hood.",
  },
  startGraph: {
    nodes: [
      { id: "t_mr_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mr_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mr_l1", fromNode: "t_mr_principled", fromSocket: "bsdf", toNode: "t_mr_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mr_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mr_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_mr_math2", typeId: "converter_math", x: 560, y: 100, params: { operation: "add", value2: 0.2 } },
      { id: "te_mr_math1", typeId: "converter_math", x: 320, y: 100, params: { operation: "multiply", value2: 0.3 } },
      { id: "te_mr_noise", typeId: "texture_noise", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_mr_l1", fromNode: "te_mr_principled", fromSocket: "bsdf", toNode: "te_mr_out", toSocket: "surface" },
      { id: "te_mr_l2", fromNode: "te_mr_math2", fromSocket: "value", toNode: "te_mr_principled", toSocket: "roughness" },
      { id: "te_mr_l3", fromNode: "te_mr_math1", fromSocket: "value", toNode: "te_mr_math2", toSocket: "value1" },
      { id: "te_mr_l4", fromNode: "te_mr_noise", fromSocket: "fac", toNode: "te_mr_math1", toSocket: "value1" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Noise Texture", en: "Step 1: Add a Noise Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入雜訊紋理（Noise Texture），它的係數（Fac）輸出範圍是 0 到 1。",
        en: "Drag in a Noise Texture from the Texture category — its Fac output ranges from 0 to 1.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_noise"),
    },
    {
      title: { zh: "第二步：用 Math 節點縮小範圍", en: "Step 2: Shrink the Range with Math" },
      instruction: {
        zh: "加入一個數學（Math）節點（轉換器 Converter 分類），運算選相乘（Multiply），把雜訊紋理的係數（Fac）接到它的第一個數值，第二個數值設成 0.3。這樣輸出範圍就從 0-1 縮小成 0-0.3。",
        en: "Add a Math node (Converter category), set its operation to Multiply, connect Noise's Fac to its first value, and set the second value to 0.3. This shrinks the output range from 0-1 down to 0-0.3.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_math", "value1") &&
        anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "multiply"),
    },
    {
      title: { zh: "第三步：再用一個 Math 節點平移範圍", en: "Step 3: Shift the Range with Another Math" },
      instruction: {
        zh: "再加入第二個數學（Math）節點，運算選相加（Add），把剛剛那個相乘（Multiply）節點的結果接進去，第二個數值設成 0.2。現在整個範圍變成 0.2-0.5，不會再有死黑（0）的部分。",
        en: "Add a second Math node, set its operation to Add, feed in the result from the Multiply node, and set the second value to 0.2. The range is now 0.2-0.5 — no more pure-black (0) areas.",
      },
      check: (graph) => {
        const mathNodes = findNodesOfType(graph, "converter_math");
        if (mathNodes.length < 2) return false;
        return nodeHasIncomingFromType(graph, "converter_math", "converter_math") &&
          anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "add");
      },
    },
    {
      title: { zh: "第四步：接到 Roughness", en: "Step 4: Feed Roughness" },
      instruction: {
        zh: "把第二個數學（Math）節點的結果接到原理化 BSDF（Principled BSDF）的粗糙度（Roughness）。跟直接接雜訊紋理（Noise Texture）比起來，現在粗糙度的變化範圍更可控、不會忽然全黑或全白。",
        en: "Connect the second Math node's result to Principled BSDF's Roughness. Compared to wiring Noise Texture directly, the roughness variation is now more controlled and won't suddenly hit pure black or white.",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "shader_principled_bsdf", "converter_math"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "這篇教學先用相乘（Multiply，×0.3）再用相加（Add，+0.2），把雜訊的 0-1 輸出換算成 0.2-0.5。如果順序反過來，先加 0.2 再乘 0.3，結果範圍會是多少？",
        en: "This tutorial multiplies by 0.3 first, then adds 0.2, turning noise's 0-1 output into 0.2-0.5. If you reversed the order — add 0.2 first, then multiply by 0.3 — what range would you get?",
      },
      options: [
        { zh: "0.06-0.36（範圍寬度變了，因為乘法在加法之後，連加上去的 0.2 也被乘小了）", en: "0.06-0.36 (the width changes too, because multiplying after adding also shrinks the +0.2 you just added)" },
        { zh: "還是 0.2-0.5，順序不影響結果", en: "Still 0.2-0.5 — order doesn't matter" },
        { zh: "0-0.3，因為加法被乘法完全蓋過去了", en: "0-0.3, because the addition gets completely overridden by the multiplication" },
        { zh: "會導致編譯錯誤，因為 Math 節點不能連續使用不同運算", en: "It would cause a compile error — Math nodes can't chain different operations" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "原始範圍 0-1；先加 0.2 變成 0.2-1.2；再乘 0.3 變成 0.06-0.36（精確算：0.2×0.3=0.06、1.2×0.3=0.36）。順序真的會影響結果，因為乘法會把「已經加上去的常數」也一起等比例縮小——這也是為什麼映射範圍（Map Range）這種內建工具通常會把「先縮放、後平移」的順序固定下來，手動兩個 Math 節點疊加時務必自己注意順序。",
        en: "Original range 0-1; adding 0.2 first gives 0.2-1.2; multiplying by 0.3 gives 0.06-0.36 (precisely: 0.2×0.3=0.06, 1.2×0.3=0.36). Order genuinely matters, because multiplying afterward also proportionally shrinks whatever constant was just added — which is exactly why a built-in tool like Map Range fixes the order to 'scale first, then shift'. When manually stacking two Math nodes, you have to track the order yourself.",
      },
    },
  ],
};
