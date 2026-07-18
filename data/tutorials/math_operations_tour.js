import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_math_operations_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識 Math 節點：切換運算看四種效果", en: "Get to Know the Math Node: Four Operations, Four Looks" },
  description: {
    zh: "Math 節點的運算（Operation）下拉選單有 30 幾種選項，光看清單很難想像差別。這篇用同一條「雜訊→Math→發光」的線路，切換 4 種代表性運算（相加、吸附、大於、正弦），讓你直接看到「函式／捨入／比較／三角函數」這四大分類分別長什麼樣子。",
    en: "The Math node's Operation dropdown has 30-some options — hard to picture from the list alone. This tutorial keeps the same 'Noise → Math → Emission' wiring and switches through 4 representative operations (Add, Snap, Greater Than, Sine) so you can directly see what the Functions/Rounding/Comparison/Trigonometric categories each look like.",
  },
  startGraph: {
    nodes: [
      { id: "t_mot_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_mot_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: { baseColor: [0, 0, 0, 1], emissionStrength: 1 } },
    ],
    links: [{ id: "t_mot_l1", fromNode: "t_mot_principled", fromSocket: "bsdf", toNode: "t_mot_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mot_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_mot_principled", typeId: "shader_principled_bsdf", x: 1000, y: 100, params: { baseColor: [0, 0, 0, 1], emissionStrength: 1 } },
      { id: "te_mot_combine", typeId: "converter_combine_color", x: 780, y: 200, params: {} },
      { id: "te_mot_math", typeId: "converter_math", x: 540, y: 200, params: { operation: "sine" } },
      { id: "te_mot_noise", typeId: "texture_noise", x: 280, y: 200, params: {} },
    ],
    links: [
      { id: "te_mot_l1", fromNode: "te_mot_principled", fromSocket: "bsdf", toNode: "te_mot_out", toSocket: "surface" },
      { id: "te_mot_l2", fromNode: "te_mot_combine", fromSocket: "color", toNode: "te_mot_principled", toSocket: "emissionColor" },
      { id: "te_mot_l3", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "r" },
      { id: "te_mot_l4", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "g" },
      { id: "te_mot_l5", fromNode: "te_mot_math", fromSocket: "value", toNode: "te_mot_combine", toSocket: "b" },
      { id: "te_mot_l6", fromNode: "te_mot_noise", fromSocket: "fac", toNode: "te_mot_math", toSocket: "value1" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接一條「雜訊→Math→發光」的線", en: "Step 1: Wire Up 'Noise → Math → Emission'" },
      instruction: {
        zh: "把原理化 BSDF 的底色（Base Color）調成黑色、發光強度（Emission Strength）調到 1（這樣畫面只顯示 Math 節點算出來的結果，不受打光影響，方便觀察）。接著加入雜訊紋理（Noise Texture）跟數學（Math，轉換器 Converter 分類），把雜訊的係數（Fac）接到 Math 的第一個數值，再用合併顏色（Combine Color）把 Math 的結果同時接到 R/G/B，接到發光顏色（Emission Color）。Math 先保持預設的相加（Add），第二個數值調成 0.15，讓畫面比原本的雜訊稍微亮一點。",
        en: "Set Principled BSDF's Base Color to black and Emission Strength to 1 (so the screen only shows the Math node's raw result, unaffected by lighting). Add a Noise Texture and a Math node (Converter category), connect Noise's Fac to Math's first value, then use a Combine Color to feed Math's result into R/G/B, connected to Emission Color. Leave Math at the default Add, and set its second value to 0.15 so the result looks slightly brighter than the raw noise.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_math", "value1") &&
        hasLinkBetweenTypes(graph, "converter_combine_color", "color", "shader_principled_bsdf", "emissionColor"),
    },
    {
      title: { zh: "第二步：切到「吸附」看色塊化", en: "Step 2: Switch to Snap for a Posterized Look" },
      instruction: {
        zh: "把運算（Operation）切換成「捨入 Rounding」分類的吸附（Snap），第二個數值改成 0.2。雲霧狀的雜訊會被吸附成 5 個平坦的灰階（0、0.2、0.4、0.6、0.8）——Snap 把數值強制對齊到指定間隔的整數倍，很適合把連續變化「量化」成幾個明確的階層（也就是常說的 Posterize 效果）。",
        en: "Switch Operation to Snap (in the Rounding category), and set its second value to 0.2. The cloud-like noise snaps into 5 flat gray levels (0, 0.2, 0.4, 0.6, 0.8) — Snap forces a value to the nearest multiple of a given increment, great for quantizing a continuous value into distinct steps (a classic 'posterize' effect).",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "snap"),
    },
    {
      title: { zh: "第三步：切到「大於」看二值化遮罩", en: "Step 3: Switch to Greater Than for a Binary Mask" },
      instruction: {
        zh: "把運算切換成「比較 Comparison」分類的大於（Greater Than），第二個數值改成 0.5。畫面會變成純黑或純白——大於這類比較運算永遠只輸出 0 或 1，是做遮罩（哪裡要顯示 A、哪裡要顯示 B）最基本的工具，例如判斷「雜訊值是不是超過某個門檻」。",
        en: "Switch Operation to Greater Than (Comparison category), and set its second value to 0.5. The result becomes pure black-or-white — comparison operations always output either 0 or 1, making them the fundamental tool for masks (where to show A vs. B), like checking whether a noise value crosses a threshold.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "greater_than"),
    },
    {
      title: { zh: "第四步：切到「正弦」，認識它的侷限", en: "Step 4: Switch to Sine — and See Its Limits" },
      instruction: {
        zh: "把運算切換成「三角函數 Trigonometric」分類的正弦（Sine）。畫面看起來只是一段平滑的漸層，不太像「週期性」的波紋——這是因為雜訊的輸出範圍是 0 到 1（換算成弧度只有一小段），正弦函數要跨過好幾圈（大約 0 到 6 以上）才看得出規律的上下震盪。⚠️ 這是一個很有用的教訓：Sine／Cosine 要先把輸入範圍「放大」（例如接一個 Math 相乘節點乘上 10），才會顯出真正的週期性條紋。",
        en: "Switch Operation to Sine (Trigonometric category). The result just looks like a smooth gradient, not obviously 'periodic' — because Noise outputs 0 to 1 (only a small slice of a radian), and Sine needs to span several full cycles (roughly 0 to 6 or more) before its up-and-down oscillation becomes visible. ⚠️ This is a useful lesson: Sine/Cosine need their input range 'widened' first (e.g. with a Math Multiply node, scaling by 10 or so) before they show genuine periodic stripes.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "sine"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "Math 節點的「吸附 Snap」運算，把連續變化的雜訊值強制對齊到指定間隔的整數倍，這在視覺上會產生什麼效果？",
        en: "Math's Snap operation forces a continuously varying noise value to the nearest multiple of a given increment. What visual effect does this produce?",
      },
      options: [
        { zh: "更平滑的漸層", en: "An even smoother gradient" },
        { zh: "幾個平坦的階層（色塊化 / Posterize）", en: "A handful of flat bands (a posterize effect)" },
        { zh: "完全隨機、看不出規律的雜訊", en: "Fully random noise with no visible pattern" },
        { zh: "顏色被反轉", en: "The colors get inverted" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Snap 會把數值強制對齊到指定間隔的整數倍（例如間隔 0.2 時，值只會落在 0、0.2、0.4、0.6、0.8），原本雲霧狀連續變化的雜訊因此被「量化」成幾個平坦的灰階階層，就是常說的 Posterize 效果。",
        en: "Snap rounds a value to the nearest multiple of a given increment (e.g. with an increment of 0.2, values only land on 0, 0.2, 0.4, 0.6, 0.8). This quantizes the originally cloud-like continuous noise into a handful of flat gray bands — the classic posterize effect.",
      },
    },
  ],
};
