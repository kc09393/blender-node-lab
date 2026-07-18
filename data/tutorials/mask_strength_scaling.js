import { hasNodeOfType, hasLinkBetweenTypes, findNodesOfType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mask_strength_scaling",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "把遮罩調含蓄一點：用 Math 縮小整體影響力", en: "Taming a Mask: Scale Down Its Overall Influence with Math" },
  description: {
    zh: "拿一個 0-1 的雜訊直接當混合著色器（Mix Shader）的 Fac，效果常常太搶戲——兩種材質各佔一半畫面，而不是「主要是 A、偶爾露一點 B」的含蓄效果。這篇教一個簡單技巧：在雜訊跟 Fac 中間插一個數學（Math）節點做「相乘」，把整段 0-1 的範圍直接壓扁到很小的區間（例如 0-0.15），讓次要材質只在少數地方低調地透出來。",
    en: "Feeding a raw 0-1 noise straight into a Mix Shader's Fac often looks too loud — two materials split roughly 50/50, instead of 'mostly A, with B subtly peeking through'. This tutorial teaches a simple trick: insert a Math node set to Multiply between the noise and the Fac, compressing the whole 0-1 range down to a small band (e.g. 0-0.15), so the secondary material only shows up sparingly and tastefully.",
  },
  startGraph: {
    nodes: [
      { id: "t_mss_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mss_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_mss_l1", fromNode: "t_mss_principled", fromSocket: "bsdf", toNode: "t_mss_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mss_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "te_mss_mix", typeId: "shader_mix_shader", x: 1040, y: 160, params: {} },
      { id: "te_mss_principled", typeId: "shader_principled_bsdf", x: 780, y: 40, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.6 } },
      { id: "te_mss_glossy", typeId: "shader_glossy_bsdf", x: 780, y: 300, params: { color: [1, 0.95, 0.8, 1], roughness: 0.05 } },
      { id: "te_mss_noise", typeId: "texture_noise", x: 280, y: 220, params: { scale: 8 } },
      { id: "te_mss_math", typeId: "converter_math", x: 540, y: 220, params: { operation: "multiply", value2: 0.15 } },
    ],
    links: [
      { id: "te_mss_l1", fromNode: "te_mss_mix", fromSocket: "bsdf", toNode: "te_mss_out", toSocket: "surface" },
      { id: "te_mss_l2", fromNode: "te_mss_principled", fromSocket: "bsdf", toNode: "te_mss_mix", toSocket: "shader1" },
      { id: "te_mss_l3", fromNode: "te_mss_glossy", fromSocket: "bsdf", toNode: "te_mss_mix", toSocket: "shader2" },
      { id: "te_mss_l4", fromNode: "te_mss_noise", fromSocket: "fac", toNode: "te_mss_math", toSocket: "value1" },
      { id: "te_mss_l5", fromNode: "te_mss_math", fromSocket: "value", toNode: "te_mss_mix", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先直接用雜訊驅動混合，看看太搶戲的樣子", en: "Step 1: Drive the Mix Directly with Noise — See It Overpower" },
      instruction: {
        zh: "加入光澤 BSDF（Glossy BSDF，暖白色、粗糙度調低，代表一種閃亮的金屬碎屑材質）跟混合著色器（Mix Shader），把原本的原理化 BSDF（底材質）跟光澤 BSDF 分別接到兩個著色器輸入，混合著色器接到材質輸出。\n\n加入雜訊紋理（Noise Texture），把它的係數（Fac）直接接到混合著色器的 Fac。畫面會變成兩種材質幾乎對半分——光澤材質佔比太高，看起來不像「點綴」，比較像兩種材質隨機拼接。",
        en: "Add a Glossy BSDF (warm white, low roughness — representing a shiny metal-fleck material) and a Mix Shader; connect the existing Principled BSDF (base material) and the Glossy BSDF to its two Shader inputs, and wire Mix Shader to Material Output.\n\nAdd a Noise Texture and connect its Fac directly to Mix Shader's Fac. The result splits roughly 50/50 between the two materials — the glossy material dominates far more than a mere 'accent' should, looking more like two materials randomly stitched together.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "shader_mix_shader", "fac") &&
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第二步：插入一個數學節點，運算選「相乘」", en: "Step 2: Insert a Math Node Set to Multiply" },
      instruction: {
        zh: "在雜訊紋理跟混合著色器中間插入數學（Math）節點，運算（Operation）選相乘（Multiply）。先不改第二個數值，這一步只是把接線改成「雜訊→數學→Fac」。",
        en: "Insert a Math node between Noise Texture and Mix Shader, with Operation set to Multiply. Don't change the second value yet — this step just reroutes the wiring to 'Noise → Math → Fac'.",
      },
      check: (graph) => {
        const mathNodes = findNodesOfType(graph, "converter_math");
        return (
          mathNodes.some((n) => n.params.operation === "multiply") &&
          hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_math", "value1") &&
          hasLinkBetweenTypes(graph, "converter_math", "value", "shader_mix_shader", "fac")
        );
      },
    },
    {
      title: { zh: "第三步：把第二個數值調很小，壓扁整段範圍", en: "Step 3: Shrink the Second Value to Compress the Whole Range" },
      instruction: {
        zh: "把數學節點的第二個數值調到 0.15 左右。原本 0-1 的雜訊範圍，乘上 0.15 之後全部被壓進 0-0.15 之間——這代表 Fac 幾乎永遠很小、只有極少數最亮的雜訊點才會讓光澤材質稍微露臉。畫面應該會變成「主要是原本的底材質，只在少數地方低調閃一下」，含蓄很多。",
        en: "Set the Math node's second value to around 0.15. The noise's original 0-1 range, multiplied by 0.15, all gets compressed into 0-0.15 — meaning Fac stays almost always tiny, with only the noise's brightest spots letting the glossy material peek through at all. The result should read as 'mostly the base material, with a subtle occasional glint' — much more tasteful.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_math", "value2", (v) => v > 0 && v <= 0.3),
    },
    {
      title: { zh: "第四步：理解這個技巧能用在哪裡", en: "Step 4: Know Where Else This Trick Applies" },
      instruction: {
        zh: "這個「乘一個小於 1 的數字，把範圍壓扁」的技巧不是只能用在 Mix Shader 的 Fac——任何接受 0-1 數值的插槽（例如 Bump 的 Strength、Emission 的 Strength 想要的話也可以反過來乘大於 1 的數放大），都可以用同樣的方法讓效果更含蓄或更強烈，是比映射範圍（Map Range）更簡單、專門用在「只想往 0 靠攏、不需要改變上限」這種場合的做法。",
        en: "This 'multiply by a number less than 1 to compress the range' trick isn't limited to Mix Shader's Fac — any socket that takes a 0-1 value (Bump's Strength, Emission's Strength — and multiplying by a number greater than 1 amplifies it instead) can use the same approach to dial an effect subtler or stronger. It's a simpler alternative to Map Range for the specific case of 'just pull values toward zero, no need to change the ceiling.'",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_math", "value2", (v) => v > 0 && v <= 0.3),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想把一個 0-1 的遮罩整體壓縮到只往 0 靠攏（上限不變），最簡單的做法是？",
        en: "What's the simplest way to compress a 0-1 mask toward zero overall, without changing its ceiling?",
      },
      options: [
        { zh: "接 Clamp 節點", en: "Wire in a Clamp node" },
        { zh: "用 Math 節點乘一個小於 1 的數", en: "Multiply it by a number less than 1 with a Math node" },
        { zh: "改用顏色漸變的 Constant 插值模式", en: "Switch Color Ramp to Constant interpolation" },
        { zh: "把 Randomness 調到 0", en: "Set Randomness to 0" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "把 0-1 的數值乘上一個小於 1 的數字（例如 0.15），整段範圍會被壓扁進 0 到那個數字之間——遮罩幾乎永遠很小，只有原本最大的地方才會稍微露出來，比重新設計整套遮罩邏輯或用映射範圍（Map Range）更直接。",
        en: "Multiplying a 0-1 value by a number less than 1 (e.g. 0.15) compresses the whole range into 0 to that number — the mask stays small almost everywhere, with only its original peaks poking through even slightly. It's more direct than redesigning the masking logic or reaching for Map Range.",
      },
    },
  ],
};
