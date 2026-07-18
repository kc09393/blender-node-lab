import { hasLinkBetweenTypes, hasAnyLinkInto, findNodesOfType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_add_shader_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "認識加法著色器：跟 Mix Shader 差在哪", en: "Get to Know Add Shader: How It Differs from Mix Shader" },
  description: {
    zh: "加法著色器（Add Shader）長得跟混合著色器（Mix Shader）很像，都是把兩個材質接在一起，但 Add 沒有 Fac 比例——兩個輸入是直接相加，不是內插。這篇用兩個發光（Emission）節點直接示範這個差異：同樣兩個輸入，Add 出來的畫面會比 Mix（50/50）明顯更亮。",
    en: "Add Shader looks similar to Mix Shader — both combine two shaders — but Add has no Fac ratio: the two inputs are summed directly, not blended. This tutorial demonstrates the difference directly with two Emission nodes: for the same two inputs, Add's result is noticeably brighter than Mix at a 50/50 split.",
  },
  startGraph: {
    nodes: [
      { id: "t_ast_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ast_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ast_l1", fromNode: "t_ast_principled", fromSocket: "bsdf", toNode: "t_ast_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ast_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_ast_emit_r", typeId: "shader_emission", x: 400, y: 60, params: { color: [1, 0, 0, 1], strength: 2 } },
      { id: "te_ast_emit_g", typeId: "shader_emission", x: 400, y: 300, params: { color: [0, 1, 0, 1], strength: 1 } },
      { id: "te_ast_add", typeId: "shader_add_shader", x: 700, y: 180, params: {} },
      { id: "te_ast_mix", typeId: "shader_mix_shader", x: 700, y: 420, params: { fac: 0.5 } },
    ],
    links: [
      { id: "te_ast_l1", fromNode: "te_ast_mix", fromSocket: "bsdf", toNode: "te_ast_out", toSocket: "surface" },
      { id: "te_ast_l2", fromNode: "te_ast_emit_r", fromSocket: "bsdf", toNode: "te_ast_add", toSocket: "shader1" },
      { id: "te_ast_l3", fromNode: "te_ast_emit_g", fromSocket: "bsdf", toNode: "te_ast_add", toSocket: "shader2" },
      { id: "te_ast_l4", fromNode: "te_ast_emit_r", fromSocket: "bsdf", toNode: "te_ast_mix", toSocket: "shader1" },
      { id: "te_ast_l5", fromNode: "te_ast_emit_g", fromSocket: "bsdf", toNode: "te_ast_mix", toSocket: "shader2" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：兩個發光節點，用 Add Shader 合併", en: "Step 1: Two Emission Nodes, Combined with Add Shader" },
      instruction: {
        zh: "加入兩個發光（Emission）節點：一個顏色改成紅色、一個改成綠色，強度（Strength）都先設成 1。加入加法著色器（Add Shader，著色器 Shader 分類），把兩個發光節點分別接到它的兩個輸入，再接到材質輸出（Material Output）的表面（Surface）。因為 Emission 沒有底色（Base Color），Add Shader 這裡就是單純把紅色跟綠色的發光直接加起來——你應該會看到黃色（紅+綠）。",
        en: "Add two Emission nodes: set one to red, one to green, both with Strength 1. Add an Add Shader (Shader category), connect both Emission nodes into its two inputs, then connect it to Material Output's Surface. Since Emission has no Base Color, Add Shader here simply sums red and green light directly — you should see yellow (red + green).",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_add_shader", "bsdf", "output_material", "surface") &&
        hasAnyLinkInto(graph, "shader_add_shader", "shader1") &&
        hasAnyLinkInto(graph, "shader_add_shader", "shader2") &&
        findNodesOfType(graph, "shader_emission").length >= 2,
    },
    {
      title: { zh: "第二步：提高其中一個強度，看比例跟著變", en: "Step 2: Raise One Strength, Watch the Balance Shift" },
      instruction: {
        zh: "把紅色發光節點的強度（Strength）調到 2 以上。畫面的顏色會明顯偏向橘紅色——因為 Add Shader 是真的把兩份光「加總」，哪一份強度更高，最終顏色就會更偏向那一份，不是像 Mix Shader 那樣固定切一半一半。",
        en: "Raise the red Emission node's Strength above 2. The color noticeably shifts toward orange-red — because Add Shader genuinely sums the two lights together, whichever side has higher strength pulls the final color toward it, unlike Mix Shader's fixed 50/50 split.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_emission", "strength", (v) => v >= 2),
    },
    {
      title: { zh: "第三步：接一份 Mix Shader 版本做對比", en: "Step 3: Wire Up a Mix Shader Version to Compare" },
      instruction: {
        zh: "加入混合著色器（Mix Shader），把同樣的紅色、綠色發光節點也各接到它的兩個輸入（Fac 保持預設 0.5）。先不要接到 Material Output——這一步只是把 Mix 版本接好，放在旁邊，下一步再切換過去比較。",
        en: "Add a Mix Shader, and connect the same red and green Emission nodes into its two inputs (leave Fac at the default 0.5). Don't connect it to Material Output yet — this step just wires up the Mix version so you can compare it in the next step.",
      },
      check: (graph) =>
        hasAnyLinkInto(graph, "shader_mix_shader", "shader1") && hasAnyLinkInto(graph, "shader_mix_shader", "shader2"),
    },
    {
      title: { zh: "第四步：切到 Mix Shader，比較亮度差異", en: "Step 4: Switch to Mix Shader and Compare Brightness" },
      instruction: {
        zh: "把 Material Output 的表面（Surface）改接到混合著色器（Mix Shader）的輸出。畫面會明顯變暗——Mix Shader 在 Fac=0.5 時是「各半」（兩份光的平均值），Add Shader 卻是「全部加總」，所以同樣的輸入，Add 版本會是 Mix 版本的兩倍亮。這也是為什麼 Add Shader 常用來在材質上面「疊加」一層額外反光（例如 Sheen），而不是拿來混合兩個完整的材質。",
        en: "Reconnect Material Output's Surface to the Mix Shader's output instead. The screen noticeably dims — at Fac=0.5, Mix Shader gives you 'half of each' (the average), while Add Shader gives you the full sum, so for the same inputs, Add is twice as bright as Mix. This is why Add Shader is typically used to layer extra reflection (like Sheen) on top of a material, rather than blending two complete materials together.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "同樣兩個發光強度相同的 Emission 節點，加法著色器（Add Shader）跟混合著色器（Mix Shader，Fac=0.5）比較起來，哪一個結果比較亮？",
        en: "Given two Emission nodes of equal strength, which combines them to be brighter: Add Shader, or Mix Shader at Fac=0.5?",
      },
      options: [
        { zh: "Add Shader 比較亮", en: "Add Shader is brighter" },
        { zh: "Mix Shader 比較亮", en: "Mix Shader is brighter" },
        { zh: "兩者一樣亮", en: "They're equally bright" },
        { zh: "取決於顏色，無法一概而論", en: "Depends on the color — can't generalize" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "Add Shader 沒有 Fac 比例，兩個輸入的發光直接相加；Mix Shader 在 Fac=0.5 時是內插（取兩者平均）。同樣兩個強度相同的輸入，Add 的結果剛好是 Mix 的兩倍亮。",
        en: "Add Shader has no Fac ratio — the two inputs' emission is summed directly. Mix Shader at Fac=0.5 interpolates (averages) them instead. For two equal-strength inputs, Add's result ends up exactly twice as bright as Mix's.",
      },
    },
  ],
};
