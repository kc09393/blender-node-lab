import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_map_range_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識映射範圍：4 種插值方式一次看懂", en: "Get to Know Map Range: 4 Interpolation Modes" },
  description: {
    zh: "映射範圍（Map Range）把數值從一個範圍等比例換算到另一個範圍，是整理材質圖的重要工具。這篇帶你認識它的插值方式——線性（Linear）、階梯（Stepped）、平滑／更平滑（Smoothstep／Smootherstep）——還有夾值（Clamp）開關，用同一張雜訊紋理一次一種切換給你看差異。",
    en: "Map Range rescales a value from one range into another — an important tool for tidying up a material graph. This tutorial covers its interpolation modes — Linear, Stepped, Smoothstep/Smootherstep — and the Clamp toggle, switching through them one at a time on the same Noise Texture so you can see the difference.",
  },
  startGraph: {
    nodes: [
      { id: "t_mrt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mrt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mrt_l1", fromNode: "t_mrt_principled", fromSocket: "bsdf", toNode: "t_mrt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mrt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mrt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_mrt_maprange", typeId: "converter_map_range", x: 560, y: 100, params: { interpolationType: "smootherstep", clamp: true } },
      { id: "te_mrt_noise", typeId: "texture_noise", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_mrt_l1", fromNode: "te_mrt_principled", fromSocket: "bsdf", toNode: "te_mrt_out", toSocket: "surface" },
      { id: "te_mrt_l2", fromNode: "te_mrt_maprange", fromSocket: "value", toNode: "te_mrt_principled", toSocket: "roughness" },
      { id: "te_mrt_l3", fromNode: "te_mrt_noise", fromSocket: "fac", toNode: "te_mrt_maprange", toSocket: "value" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接上雜訊紋理", en: "Step 1: Wire Up a Noise Texture" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）跟映射範圍（Map Range，轉換器 Converter 分類），把雜訊的係數（Fac）接到映射範圍的數值（Value），再把映射範圍的結果接到原理化 BSDF 的粗糙度（Roughness）。預設是線性（Linear）插值，效果等同於原封不動地換算範圍。",
        en: "Add a Noise Texture and a Map Range (Converter category), connect Noise's Fac to Map Range's Value, then connect Map Range's result to Principled BSDF's Roughness. The default Linear interpolation just rescales the range as-is.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_map_range", "value") &&
        hasLinkBetweenTypes(graph, "converter_map_range", "value", "shader_principled_bsdf", "roughness"),
    },
    {
      title: { zh: "第二步：切到「階梯」看量化效果", en: "Step 2: Switch to Stepped for Quantized Levels" },
      instruction: {
        zh: "把插值方式（Interpolation）切換成階梯（Stepped），階數（Steps）設成 4。粗糙度的變化會被強制分成 4 個明確的階層，不再是連續漸變——反光的清晰程度會出現「一塊一塊」跳動的感覺，而不是平滑過渡。",
        en: "Switch Interpolation to Stepped, and set Steps to 4. Roughness variation gets forced into 4 distinct levels instead of a smooth gradient — the reflection sharpness will jump between a few discrete looks rather than blending continuously.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_map_range", "interpolationType", (v) => v === "stepped"),
    },
    {
      title: { zh: "第三步：切到「更平滑」比較曲線", en: "Step 3: Switch to Smootherstep" },
      instruction: {
        zh: "把插值方式切換成更平滑（Smootherstep）。這是平滑（Smoothstep）的進階版——兩端變化速度趨近於零，而且連「變化速度改變的速度」也趨近於零，過渡感又更柔和一階，兩者都比線性更「有機」，常用來讓數值過渡不要那麼死板生硬。",
        en: "Switch Interpolation to Smootherstep. This is Smoothstep's upgraded sibling — velocity approaches zero at both ends, and even the rate of change of that velocity approaches zero too, making the transition one notch softer still. Both are more organic-feeling than a flat linear ramp.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_map_range", "interpolationType", (v) => v === "smootherstep"),
    },
    {
      title: { zh: "第四步：打開夾值，鎖住範圍", en: "Step 4: Turn On Clamp to Lock the Range" },
      instruction: {
        zh: "打開夾值（Clamp）開關。這會把最終結果強制鎖在目標最小（To Min）與目標最大（To Max）之間——如果上游數值意外超出你預期的範圍（例如疊加了好幾層運算後跑到 1.2），Clamp 能避免它繼續往下傳、把後面的材質參數弄壞。",
        en: "Turn on the Clamp toggle. This locks the final result between To Min and To Max — if an upstream value unexpectedly exceeds your intended range (e.g. drifting to 1.2 after several layers of math), Clamp stops it from propagating further and corrupting downstream material parameters.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_map_range", "clamp", (v) => v === true),
    },
  ],
  quiz: [
    {
      question: {
        zh: "映射範圍的「階梯 Stepped」插值模式，會產生什麼視覺效果？",
        en: "What visual effect does Map Range's 'Stepped' interpolation mode produce?",
      },
      options: [
        { zh: "平滑的連續漸層", en: "A smooth continuous gradient" },
        { zh: "分成幾個離散的階層，像樓梯一樣一階一階跳", en: "A handful of discrete levels, jumping step by step like a staircase" },
        { zh: "完全隨機的雜訊", en: "Fully random noise" },
        { zh: "顏色被反轉", en: "The colors get inverted" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Stepped 插值會把連續數值強制對齊到指定的階數，視覺上呈現一階一階跳躍的階梯效果，不是平滑過渡——這跟顏色漸變的 Constant 插值目的相似（都是做出色塊化效果），但 Map Range 是對數值本身量化，不是對顏色。",
        en: "Stepped interpolation forces a continuous value to snap to a set number of discrete levels, producing a staircase-like jump rather than a smooth transition — similar in spirit to Color Ramp's Constant interpolation (both posterize), but Map Range quantizes the raw value itself rather than a color.",
      },
    },
  ],
};
