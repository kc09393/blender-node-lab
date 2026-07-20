import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_clamp_node",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "夾值：防止數值跑出合理範圍", en: "Clamp: Keeping Values in Range" },
  description: {
    zh: "很多插槽（例如 Roughness）只接受 0-1，但接上其他運算節點後很容易跑出這個範圍。夾值（Clamp）節點強制把數值鎖在你指定的最小/最大之間，避免材質忽然全黑或全白。",
    en: "Many sockets (like Roughness) only expect 0-1, but wiring in other math nodes can easily push values outside that range. Clamp forces a value to stay within your chosen min/max, preventing a material from suddenly going pure black or white.",
  },
  startGraph: {
    nodes: [
      { id: "t_cl_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cl_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_cl_l1", fromNode: "t_cl_principled", fromSocket: "bsdf", toNode: "t_cl_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cl_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_cl_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_cl_clamp", typeId: "converter_clamp", x: 560, y: 100, params: { min: 0.2, max: 0.6 } },
      { id: "te_cl_math", typeId: "converter_math", x: 300, y: 100, params: { operation: "multiply", value2: 3 } },
      { id: "te_cl_noise", typeId: "texture_noise", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_cl_l1", fromNode: "te_cl_principled", fromSocket: "bsdf", toNode: "te_cl_out", toSocket: "surface" },
      { id: "te_cl_l2", fromNode: "te_cl_clamp", fromSocket: "value", toNode: "te_cl_principled", toSocket: "roughness" },
      { id: "te_cl_l3", fromNode: "te_cl_math", fromSocket: "value", toNode: "te_cl_clamp", toSocket: "value" },
      { id: "te_cl_l4", fromNode: "te_cl_noise", fromSocket: "fac", toNode: "te_cl_math", toSocket: "value1" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 Math 把雜訊誇張放大", en: "Step 1: Exaggerate the Noise with Math" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）跟一個數學（Math）節點（運算選相乘 Multiply），把雜訊的係數（Fac）接到 Math 的第一個數值，第二個數值設成 3。\n\n這樣範圍會從 0-1 誇張放大成 0-3，遠遠超出 Roughness 能接受的 0-1。",
        en: "Add a Noise Texture and a Math node (operation Multiply), connect Noise's Fac to Math's first value, and set the second value to 3.\n\nThe range exaggerates from 0-1 to 0-3, well beyond what Roughness can sensibly use.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_math", "value1") &&
        anyNodeParamMatches(graph, "converter_math", "value2", (v) => v >= 2),
    },
    {
      title: { zh: "第二步：加入夾值節點", en: "Step 2: Add a Clamp Node" },
      instruction: {
        zh: "從「轉換器 Converter」分類拖入夾值（Clamp），把 Math 節點的結果接到它的數值（Value）輸入。",
        en: "Drag in a Clamp from the Converter category and connect the Math node's result to its Value input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_math", "value", "converter_clamp", "value"),
    },
    {
      title: { zh: "第三步：設定合理的上下限", en: "Step 3: Set a Sensible Range" },
      instruction: {
        zh: "把最小（Min）設成 0.2、最大（Max）設成 0.6。\n\n不管前面算出來的數值多誇張，輸出都會被鎖在這個範圍內。",
        en: "Set Min to 0.2 and Max to 0.6.\n\nNo matter how extreme the upstream math gets, the output stays locked within this range.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "converter_clamp", "min", (v) => Math.abs(v - 0.2) < 0.05) &&
        anyNodeParamMatches(graph, "converter_clamp", "max", (v) => Math.abs(v - 0.6) < 0.05),
    },
    {
      title: { zh: "第四步：接到粗糙度", en: "Step 4: Feed Roughness" },
      instruction: {
        zh: "把夾值節點的輸出接到原理化 BSDF（Principled BSDF）的粗糙度（Roughness）。反光應該會有變化，但不會出現完全的鏡面或完全的霧面。\n\n這就是 Clamp 的保護作用。",
        en: "Connect Clamp's output to Principled BSDF's Roughness. The highlights should vary, but never hit a perfect mirror or a fully frosted look.\n\nThat's Clamp doing its job.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_clamp", "value", "shader_principled_bsdf", "roughness"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "材質在接了幾個 Math 運算節點之後，粗糙度插槽突然整片死黑或死白，最可能的原因是？",
        en: "After chaining a few Math nodes, a Roughness socket suddenly renders pure black or white across the whole surface. What's the most likely cause?",
      },
      options: [
        { zh: "Math 節點本身有 bug", en: "The Math node itself is buggy" },
        { zh: "Roughness 只接受 0-1，但運算結果可能跑出這個範圍", en: "Roughness only accepts 0-1, but the math result may fall outside that range" },
        { zh: "忘記接 Bump 節點", en: "Forgot to connect a Bump node" },
        { zh: "色彩空間選錯了", en: "The wrong Color Space was picked" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "很多插槽（像 Roughness）只接受 0-1，一連串運算後數值很容易跑出範圍，超出範圍的部分通常會被自動夾在 0 或 1，畫面因此出現大片死黑死白。Clamp 節點能提前把數值鎖在指定範圍內，避免這個問題。",
        en: "Many sockets (like Roughness) only accept 0-1, and a chain of math operations can easily push values outside that range — anything out of range typically gets auto-clamped to 0 or 1, producing large flat black or white areas. A Clamp node locks the value into a chosen range beforehand to avoid this.",
      },
    },
  ],
};
