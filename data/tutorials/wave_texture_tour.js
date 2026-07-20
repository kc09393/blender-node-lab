import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_wave_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識波浪紋理：Bands、Rings、剖面一次搞懂", en: "Get to Know Wave Texture: Bands, Rings, and Profile" },
  description: {
    zh: "波浪紋理（Wave Texture）能做出規律的條紋或環狀波紋，是木紋、水波、金屬拉絲的常見基礎。這篇帶你認識波形（Bands/Rings）、剖面（Profile）、扭曲（Distortion）這幾個關鍵設定，一次一個切給你看。",
    en: "Wave Texture produces regular bands or rings — a common basis for wood grain, water ripples, or brushed metal. This tutorial covers Wave Type (Bands/Rings), Profile, and Distortion, switching one at a time so you can see each effect.",
  },
  startGraph: {
    nodes: [
      { id: "t_wtt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_wtt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_wtt_l1", fromNode: "t_wtt_principled", fromSocket: "bsdf", toNode: "t_wtt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wtt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_wtt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_wtt_wave",
        typeId: "texture_wave",
        x: 300,
        y: 100,
        params: { waveType: "rings", profile: "saw", distortion: 3 },
      },
    ],
    links: [
      { id: "te_wtt_l1", fromNode: "te_wtt_principled", fromSocket: "bsdf", toNode: "te_wtt_out", toSocket: "surface" },
      { id: "te_wtt_l2", fromNode: "te_wtt_wave", fromSocket: "fac", toNode: "te_wtt_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入波浪紋理", en: "Step 1: Add a Wave Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入波浪紋理（Wave Texture），把係數（Fac）輸出接到原理化 BSDF 的底色（Base Color）。\n\n預設是條紋（Bands）波形＋正弦（Sine）剖面，畫面會是規律的黑白條紋。",
        en: "Drag in a Wave Texture from the Texture category and connect its Fac output to Principled BSDF's Base Color.\n\nThe default is Bands wave type with a Sine profile, giving regular black-and-white stripes.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_wave", "fac", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：切到「環狀」看波紋變同心圓", en: "Step 2: Switch to Rings for Concentric Circles" },
      instruction: {
        zh: "把波形（Wave Type）切換成環狀（Rings）。條紋會變成一圈一圈的同心圓，像水面漣漪或年輪。\n\nBands 跟 Rings 差別在於：Bands 沿著一個方向線性排列，Rings 則是以中心點為圓心往外擴散。",
        en: "Switch Wave Type to Rings. The bands become concentric circles, like ripples on water or tree rings.\n\nThe difference is Bands lay out linearly along one direction, while Rings radiate outward from a center point.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_wave", "waveType", (v) => v === "rings"),
    },
    {
      title: { zh: "第三步：切到「鋸齒」剖面看邊緣變銳利", en: "Step 3: Switch to Saw Profile for Sharp Edges" },
      instruction: {
        zh: "把剖面（Profile）切換成鋸齒（Saw）。原本柔和的正弦波紋會變成邊緣銳利的鋸齒狀。\n\nProfile 決定每一圈波紋「由暗到亮」的過渡方式：正弦（Sine）平滑、鋸齒（Saw）是直線陡降、三角（Triangle）則是對稱的斜坡。",
        en: "Switch Profile to Saw. The soft sine wave turns into sharp-edged sawtooth ridges.\n\nProfile determines how each wave transitions from dark to light: Sine is smooth, Saw drops off in a straight line, and Triangle is a symmetric ramp.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_wave", "profile", (v) => v === "saw"),
    },
    {
      title: { zh: "第四步：加上扭曲，模擬木紋年輪", en: "Step 4: Add Distortion for Wood-Grain Rings" },
      instruction: {
        zh: "把扭曲（Distortion）調到 2 以上。原本工整的圓圈會變得不規則、有機。\n\n這正是程序化木紋最常見的做法：環狀波形＋扭曲，模擬樹木年輪自然生長時的歪斜感。",
        en: "Raise Distortion above 2. The once-perfect circles become irregular and organic.\n\nThis is the classic recipe for procedural wood grain: Rings wave type plus Distortion, mimicking how tree rings naturally warp as they grow.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_wave", "distortion", (v) => v >= 2),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想用波浪紋理做出像年輪、水波那樣的同心圓紋路，波形（Wave Type）該選哪一種？",
        en: "To get concentric-ring patterns like tree rings or water ripples from Wave Texture, which Wave Type should you pick?",
      },
      options: [
        { zh: "條紋 Bands", en: "Bands" },
        { zh: "環狀 Rings", en: "Rings" },
        { zh: "兩者效果一樣", en: "Both produce the same result" },
        { zh: "都不行，要另外接沃羅諾伊", en: "Neither — you'd need Voronoi instead" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Bands 沿單一方向產生平行條紋（像木板紋、金屬拉絲）；Rings 以中心點向外產生同心圓波紋（像年輪、水波）——兩者的座標運算基礎完全不同，選錯類型會做出完全不同方向感的圖案。",
        en: "Bands produces parallel stripes along a single direction (like wood planks or brushed metal). Rings produces concentric circles radiating from a center point (like tree rings or ripples) — the two use fundamentally different coordinate math, and picking the wrong one gives a pattern with a completely different sense of direction.",
      },
    },
  ],
};
