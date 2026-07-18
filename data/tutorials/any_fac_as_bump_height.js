import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_any_fac_as_bump_height",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "任何 0-1 輸出都能當凹凸高度：棋盤格也可以", en: "Any 0-1 Output Can Drive Bump — Even Checker" },
  description: {
    zh: "凹凸（Bump）的高度插槽（Height）常常被接上 Noise 或 Wave，但它其實只是一個普通的 0-1 數值插槽——任何節點只要輸出 0-1 的浮點數，都能直接接上去。這篇示範把棋盤格紋理（Checker Texture）平常只拿來切換顏色或驅動混合著色器的係數（Fac）輸出，改接進 Bump，方格本身就變成一格格真的有高低落差的突起，是鎖子甲金屬網（Chainmail Mesh）這個材質的核心技巧。",
    en: "Bump's Height socket is usually fed Noise or Wave, but it's really just an ordinary 0-1 float socket — any node that outputs a 0-1 float can be wired in directly. This tutorial feeds Checker Texture's Fac output — normally used only to switch colors or drive a Mix Shader — straight into Bump, turning the checker squares into a real grid of raised and recessed tiles. This is the core trick behind the Chainmail Mesh preset.",
  },
  startGraph: {
    nodes: [
      { id: "t_afab_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_afab_principled", typeId: "shader_principled_bsdf", x: 320, y: 200, params: { baseColor: [0.55, 0.56, 0.58, 1], roughness: 0.35, metallic: 1 } },
    ],
    links: [{ id: "t_afab_l1", fromNode: "t_afab_principled", fromSocket: "bsdf", toNode: "t_afab_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_afab_out", typeId: "output_material", x: 1100, y: 220 },
      { id: "te_afab_texcoord", typeId: "input_texture_coordinate", x: -80, y: 160 },
      { id: "te_afab_mapping", typeId: "vector_mapping", x: 180, y: 160, params: { scale: [18, 18, 18] } },
      { id: "te_afab_checker", typeId: "texture_checker", x: 440, y: 160, params: { scale: 1 } },
      { id: "te_afab_bump", typeId: "vector_bump", x: 700, y: 160, params: { strength: 0.6 } },
      { id: "te_afab_principled", typeId: "shader_principled_bsdf", x: 860, y: 220, params: { baseColor: [0.55, 0.56, 0.58, 1], roughness: 0.35, metallic: 1 } },
    ],
    links: [
      { id: "te_afab_l1", fromNode: "te_afab_texcoord", fromSocket: "generated", toNode: "te_afab_mapping", toSocket: "vector" },
      { id: "te_afab_l2", fromNode: "te_afab_mapping", fromSocket: "vector", toNode: "te_afab_checker", toSocket: "vector" },
      { id: "te_afab_l3", fromNode: "te_afab_checker", fromSocket: "color", toNode: "te_afab_principled", toSocket: "baseColor" },
      { id: "te_afab_l4", fromNode: "te_afab_checker", fromSocket: "fac", toNode: "te_afab_bump", toSocket: "height" },
      { id: "te_afab_l5", fromNode: "te_afab_bump", fromSocket: "normal", toNode: "te_afab_principled", toSocket: "normal" },
      { id: "te_afab_l6", fromNode: "te_afab_principled", fromSocket: "bsdf", toNode: "te_afab_out", toSocket: "surface" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入棋盤格紋理，先看平坦的黑白格", en: "Step 1: Add Checker Texture — See It Flat First" },
      instruction: {
        zh: "加入貼圖座標（Texture Coordinate）、映射（Mapping，Scale 三個分量都調到 18 左右讓格子夠密）、棋盤格紋理（Checker Texture），依序接起來，再把棋盤格紋理的顏色（Color）輸出接到原理化 BSDF 的底色（Base Color）。\n\n這一步畫面應該是規律的深淺方格，完全平坦，還看不出任何凹凸。",
        en: "Add Texture Coordinate, Mapping (set all three Scale components to around 18 for dense squares), and Checker Texture, and wire them in sequence. Then connect Checker Texture's Color output into the Principled BSDF's Base Color.\n\nAt this point you should see a regular light/dark checkerboard, completely flat — no bump yet.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：把係數（Fac）接進凹凸的高度，不是顏色", en: "Step 2: Wire Fac — Not Color — Into Bump's Height" },
      instruction: {
        zh: "加入凹凸（Bump）節點。這次不是接顏色，而是把棋盤格紋理的係數（Fac，黑白交錯的 0/1 數值）接到 Bump 的高度（Height）；再把 Bump 的法線（Normal）輸出接到原理化 BSDF 的法線（Normal）插槽。\n\n畫面應該會出現明顯變化：方格不再只是顏色平面拼貼，一格亮一格暗地看起來真的有高低落差，像是壓花或編織金屬網的顆粒感。",
        en: "Add a Bump node. This time, instead of color, wire Checker Texture's Fac output (the alternating 0/1 value) into Bump's Height. Then connect Bump's Normal output into the Principled BSDF's Normal socket.\n\nYou should see a clear change: the squares no longer read as flat colored tiles — alternating tiles now genuinely look raised and recessed, like an embossed or woven metal texture.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_checker", "fac", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第三步：調整凹凸強度，避免鋸齒感太重", en: "Step 3: Tune Bump Strength to Avoid Harsh Jaggies" },
      instruction: {
        zh: "把 Bump 的強度（Strength）調到 0.6 左右——棋盤格的邊界是硬邊（不像 Noise 那樣平滑過渡），強度太高會讓方格邊緣出現不自然的銳利陰影條紋，調低一點看起來更像真實金屬網微微的凹凸起伏。",
        en: "Set Bump's Strength to around 0.6 — Checker's edges are hard (unlike Noise's smooth transitions), so too much strength produces harsh, unnatural shadow stripes along the tile boundaries. A lower value reads more like the gentle undulation of a real metal mesh.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_bump", "strength", (v) => v > 0 && v <= 1),
    },
    {
      title: { zh: "第四步：這個技巧能用在哪裡", en: "Step 4: Where Else This Trick Applies" },
      instruction: {
        zh: "Bump 的 Height 插槽只在乎「收到一個 0-1 的數值」，完全不在乎這個數值原本的意義是什麼——棋盤格的 Fac、菲涅爾的係數、任何 Math/Color Ramp 運算的結果，甚至另一個材質原本用來當遮罩的輸出，都可以直接拿來試試看會做出什麼樣的凹凸效果，是很值得動手亂接線實驗的插槽。",
        en: "Bump's Height socket only cares about receiving a 0-1 value — it doesn't care what that value originally represented. Checker's Fac, Fresnel's coefficient, the result of any Math/Color Ramp operation, even another material's masking output — all of these are worth plugging in just to see what kind of bump effect they produce. It's a socket well worth experimenting with.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_bump", "strength", (v) => v > 0 && v <= 1),
    },
  ],
  quiz: [
    {
      question: {
        zh: "凹凸（Bump）節點的高度（Height）插槽，實際上能接受什麼樣的輸入？",
        en: "What can Bump's Height socket actually accept as input?",
      },
      options: [
        { zh: "只能接 Noise 或 Wave 這類紋理節點的輸出", en: "Only outputs from texture nodes like Noise or Wave" },
        { zh: "任何輸出 0-1 浮點數的節點都可以", en: "Any node that outputs a 0-1 float" },
        { zh: "只能接顏色（Color）型別的輸出", en: "Only color-type outputs" },
        { zh: "只能接向量（Vector）型別的輸出", en: "Only vector-type outputs" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Height 插槽只是一個普通的 0-1 浮點數插槽，完全不在乎這個數值原本代表什麼意義——棋盤格的 Fac、菲涅爾的係數、Math 運算的結果都能直接接上去試試看，不是只有 Noise/Wave 才能用。",
        en: "Height is just an ordinary 0-1 float socket — it doesn't care what the value originally represented. Checker's Fac, Fresnel's coefficient, the result of a Math operation — all of these can be wired in directly, not just Noise or Wave.",
      },
    },
  ],
};
