import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_stained_glass",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "彩色玻璃窗：用顏色漸變做調色盤化", en: "Stained Glass: Using a Color Ramp to Posterize a Palette" },
  description: {
    zh: "沃羅諾伊紋理的顏色（Color）輸出，每個細胞都是一個完全隨機的顏色——顏色太雜、不像真正的彩色玻璃窗（通常只用幾種固定色調）。這篇教學示範顏色漸變（Color Ramp）的另一種用法：不是拿來做平滑漸層，而是設很多組「位置很接近、顏色卻不一樣」的停駐點，把連續的隨機值強制«量化»成少數幾種固定色調——這叫做調色盤化（Posterize），是很多风格化渲染的核心技巧。再疊一層黑色縫隙線，做出完整的彩色玻璃窗效果。",
    en: "Voronoi Texture's Color output gives every cell a fully random color — too chaotic to look like a real stained-glass window (which typically uses just a handful of fixed hues). This tutorial shows a different use of Color Ramp: instead of a smooth gradient, you set many stop-pairs positioned very close together with different colors, forcing a continuous random value to snap into a small, fixed palette — a technique called posterizing, central to a lot of stylized rendering. Then a layer of black grout lines completes the stained-glass look.",
  },
  startGraph: {
    nodes: [
      { id: "t_sg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_sg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.2 } },
    ],
    links: [{ id: "t_sg_l1", fromNode: "t_sg_principled", fromSocket: "bsdf", toNode: "t_sg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_sg_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_sg_principled", typeId: "shader_principled_bsdf", x: 1400, y: 100, params: { roughness: 0.2, emissionStrength: 0.4 } },
      { id: "te_sg_mix", typeId: "color_mix", x: 1140, y: 100, params: { mode: "multiply", fac: 1 } },
      {
        id: "te_sg_grout_ramp",
        typeId: "converter_color_ramp",
        x: 880,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.62, color: [1, 1, 1, 1] },
            { position: 0.68, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      {
        id: "te_sg_palette_ramp",
        typeId: "converter_color_ramp",
        x: 880,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.7, 0.08, 0.1, 1] },
            { position: 0.24, color: [0.7, 0.08, 0.1, 1] },
            { position: 0.26, color: [0.08, 0.25, 0.65, 1] },
            { position: 0.49, color: [0.08, 0.25, 0.65, 1] },
            { position: 0.51, color: [0.1, 0.5, 0.2, 1] },
            { position: 0.74, color: [0.1, 0.5, 0.2, 1] },
            { position: 0.76, color: [0.85, 0.65, 0.1, 1] },
            { position: 1, color: [0.85, 0.65, 0.1, 1] },
          ],
        },
      },
      { id: "te_sg_bw", typeId: "converter_rgb_to_bw", x: 620, y: 60, params: {} },
      { id: "te_sg_voronoi", typeId: "texture_voronoi", x: 380, y: 140, params: { scale: 6, randomness: 1 } },
    ],
    links: [
      { id: "te_sg_l1", fromNode: "te_sg_principled", fromSocket: "bsdf", toNode: "te_sg_out", toSocket: "surface" },
      { id: "te_sg_l2", fromNode: "te_sg_mix", fromSocket: "color", toNode: "te_sg_principled", toSocket: "baseColor" },
      { id: "te_sg_l3", fromNode: "te_sg_palette_ramp", fromSocket: "color", toNode: "te_sg_mix", toSocket: "a" },
      { id: "te_sg_l4", fromNode: "te_sg_grout_ramp", fromSocket: "color", toNode: "te_sg_mix", toSocket: "b" },
      { id: "te_sg_l5", fromNode: "te_sg_bw", fromSocket: "value", toNode: "te_sg_palette_ramp", toSocket: "fac" },
      { id: "te_sg_l6", fromNode: "te_sg_voronoi", fromSocket: "color", toNode: "te_sg_bw", toSocket: "color" },
      { id: "te_sg_l7", fromNode: "te_sg_voronoi", fromSocket: "distance", toNode: "te_sg_grout_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：把沃羅諾伊的隨機顏色轉成單一數值", en: "Step 1: Turn Voronoi's Random Color into a Single Value" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture）。\n\n加入 RGB 轉黑白（RGB to BW）。\n\n把沃羅諾伊的顏色（Color）輸出，接到 RGB 轉黑白的顏色輸入。\n\n這一步把「每格一個隨機顏色」轉成「每格一個隨機數值」，才能餵給下一步的顏色漸變。\n\n⚠️ RGB 轉黑白的數值（Val）輸出先不要接到任何地方，下一步才會用到。",
        en: "Add a Voronoi Texture, add an RGB to BW node, and connect Voronoi's Color output to its color input — this turns 'one random color per cell' into 'one random number per cell', which is what the next Color Ramp needs.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "color", "converter_rgb_to_bw", "color"),
    },
    {
      title: { zh: "第二步：用顏色漸變把隨機值量化成固定調色盤", en: "Step 2: Quantize the Random Value into a Fixed Palette" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp）。\n\n把 RGB 轉黑白的數值（Val）輸出，接到顏色漸變的係數（Fac）輸入。\n\n建立至少 4 組«位置緊鄰、顏色不同»的停駐點，例如：位置 0 跟 0.24 都是深紅、位置 0.26 跟 0.49 都是深藍。\n\n這樣一來，連續變化的隨機值只會落在少數幾個固定顏色其中之一，而不是無限多種顏色——這就是「調色盤化」。",
        en: "Add a Color Ramp, connect RGB to BW's Val to its Fac. Build at least 4 stop-pairs positioned close together with different colors — e.g. positions 0 and 0.24 both deep red, 0.26 and 0.49 both deep blue — so the continuously-varying random value snaps into one of only a few fixed colors instead of infinitely many. That's posterizing.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_rgb_to_bw", "value", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "converter_color_ramp", "stops", (v) => Array.isArray(v) && v.length >= 4),
    },
    {
      title: { zh: "第三步：用另一條顏色漸變做出黑色縫隙線", en: "Step 3: Build Black Grout Lines with a Second Ramp" },
      instruction: {
        zh: "再加入一個顏色漸變（這是第二條，跟上一步那條是不同節點）。\n\n把沃羅諾伊的距離（Distance）輸出，接到這條顏色漸變的係數（Fac）輸入。\n\n設定成「靠近細胞中心是白色，接近邊界快速變黑」。原因：Distance 離開細胞中心後數值會變大，這樣設定就會在每片玻璃靠近邊緣的地方，做出偏黑的縫隙效果。",
        en: "Add another Color Ramp, connect Voronoi's Distance to its Fac, and set it up so near the cell center is white and it quickly turns black near the boundary — since Distance increases away from the cell center, this darkens the area near each glass pane's edge, approximating grout lines.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(
          graph,
          "converter_color_ramp",
          "stops",
          (stops) => Array.isArray(stops) && stops.some((s) => s.position < 0.65 && s.color[0] > 0.7) && stops.some((s) => s.position >= 0.65 && s.color[0] < 0.3)
        ),
    },
    {
      title: { zh: "第四步：用正片疊底合併調色盤跟縫隙線", en: "Step 4: Combine Palette and Grout with Multiply" },
      instruction: {
        zh: "加入混合顏色（Mix Color）。\n\nA 接調色盤顏色漸變的顏色。B 接縫隙線顏色漸變的顏色。\n\n混合模式選正片疊底（Multiply）。\n\n把輸出接到原理化 BSDF 的底色。\n\n原理：縫隙線顏色漸變大部分是白色，正片疊底遇到白色不會有任何影響；只有邊界附近是黑色，正片疊底會把那裡直接蓋成黑色。這樣兩層合併起來，就是完整的彩色玻璃窗效果。",
        en: "Add a Mix Color node, connect A to the palette ramp's color, B to the grout ramp's color, mode Multiply, and connect the output to Principled BSDF's Base Color. Since the grout ramp is mostly white (no effect under Multiply) and only black near boundaries (Multiply stamps it black there), the two layers combine correctly into the full stained-glass look.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "multiply"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想把連續的隨機顏色值「量化」成幾種固定色調（調色盤化 Posterize），這篇教學示範的做法是？",
        en: "To quantize a continuous random color value into a handful of fixed hues (posterizing), what technique does this tutorial demonstrate?",
      },
      options: [
        { zh: "提高沃羅諾伊的 Randomness", en: "Raise Voronoi's Randomness" },
        { zh: "在顏色漸變裡設很多組「位置很接近、顏色卻不一樣」的停駐點", en: "Place many stop-pairs in Color Ramp that are positioned very close together but have different colors" },
        { zh: "切換到 F2 特徵", en: "Switch to the F2 feature" },
        { zh: "用 Math 節點的 Round 運算", en: "Use the Math node's Round operation" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "把很多組位置接近、顏色卻不一樣的停駐點擠在顏色漸變裡，連續變化的隨機值一掃過這些窄小的區間，顏色就會被強制快速跳到下一個固定色調——這是不靠 Constant 插值也能做出調色盤化效果的另一種手法，效果目的一樣但做法不同。",
        en: "Cramming many stop-pairs — positioned close together but with different colors — into a Color Ramp means a continuously varying value sweeping across those tight windows gets forced to jump quickly to the next fixed hue. It's a different way to achieve posterizing without relying on Constant interpolation, same goal via a different mechanism.",
      },
    },
  ],
};
