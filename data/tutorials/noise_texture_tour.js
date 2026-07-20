import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_noise_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識雜訊紋理：Detail、Distortion、Type 一次搞懂", en: "Get to Know Noise Texture: Detail, Distortion, and Type" },
  description: {
    zh: "雜訊紋理（Noise Texture）幾乎是所有程序化材質的起點，但 Detail／Roughness／Distortion 這些插槽、還有 5 種 Noise Type 到底差在哪，光看名字很難想像。這篇用最直接的方式，一個一個調給你看。",
    en: "Noise Texture is the starting point for nearly every procedural material, but it's hard to picture what Detail/Roughness/Distortion actually do, or how the 5 Noise Types differ, just from their names. This tutorial adjusts them one at a time so you can see directly.",
  },
  startGraph: {
    nodes: [
      { id: "t_ntt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_ntt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_ntt_l1", fromNode: "t_ntt_principled", fromSocket: "bsdf", toNode: "t_ntt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ntt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ntt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_ntt_noise",
        typeId: "texture_noise",
        x: 300,
        y: 100,
        params: { noiseType: "multifractal", detail: 8, distortion: 3, scale: 4 },
      },
    ],
    links: [
      { id: "te_ntt_l1", fromNode: "te_ntt_principled", fromSocket: "bsdf", toNode: "te_ntt_out", toSocket: "surface" },
      { id: "te_ntt_l2", fromNode: "te_ntt_noise", fromSocket: "color", toNode: "te_ntt_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入雜訊紋理", en: "Step 1: Add a Noise Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入雜訊紋理（Noise Texture），把顏色（Color）輸出接到原理化 BSDF 的底色（Base Color）。\n\n預設是 fBM 類型，畫面會是一團柔和的雲霧狀圖案。",
        en: "Drag in a Noise Texture from the Texture category and connect its Color output to Principled BSDF's Base Color.\n\nThe default fBM type gives a soft, cloud-like pattern.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：調高細節，看花紋變複雜", en: "Step 2: Raise Detail for More Complexity" },
      instruction: {
        zh: "把細節（Detail）調到 6 以上。\n\nDetail 是疊代次數：每多一層疊代，就會疊加一層更細碎的花紋，數值越高，圖案看起來越有層次、越複雜（但算得也越久）。",
        en: "Raise Detail above 6.\n\nDetail is the octave count: each extra octave layers in a finer level of pattern, so higher values look more layered and complex (at the cost of more computation).",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_noise", "detail", (v) => v >= 6),
    },
    {
      title: { zh: "第三步：加上扭曲，打散規律感", en: "Step 3: Add Distortion to Break Up Regularity" },
      instruction: {
        zh: "把扭曲（Distortion）調到 2 以上。\n\nDistortion 會先用另一組雜訊把座標本身「揉皺」，再拿揉皺後的座標去取樣——花紋會變得更不規則、更自然，常用來讓過於工整的圖案看起來更有機。",
        en: "Raise Distortion above 2.\n\nDistortion first warps the coordinate itself using another layer of noise, then samples using the warped coordinate — the pattern becomes more irregular and organic, useful for breaking up patterns that look too uniform.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_noise", "distortion", (v) => v >= 2),
    },
    {
      title: { zh: "第四步：切換類型到 Multifractal", en: "Step 4: Switch Type to Multifractal" },
      instruction: {
        zh: "把類型（Type）切換成多重分形（Multifractal）。\n\n跟預設 fBM 逐層「相加」振幅不同，Multifractal 逐層「相乘」——畫面通常會比 fBM 更明亮、對比更強烈，是另一種常見的地形/雲霧生成基礎。",
        en: "Switch Type to Multifractal.\n\nUnlike the default fBM, which adds amplitude layer by layer, Multifractal multiplies them — the result is usually brighter with stronger contrast than fBM, another common basis for terrain or cloud generation.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_noise", "noiseType", (v) => v === "multifractal"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "雜訊紋理的 Distortion（扭曲）參數，實際上做的是什麼？",
        en: "What does Noise Texture's Distortion parameter actually do?",
      },
      options: [
        { zh: "增加疊代層數，讓花紋更複雜細碎", en: "Adds more octaves, making the pattern more complex and fine-grained" },
        { zh: "用另一組雜訊先把座標本身「揉皺」，再拿揉皺後的座標取樣", en: "Warps the coordinate itself with another layer of noise, then samples using the warped result" },
        { zh: "直接讓顏色變得更飽和", en: "Directly increases color saturation" },
        { zh: "改變整體亮度", en: "Changes overall brightness" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Distortion 跟 Detail 做的是完全不同的事：Detail 是疊代次數，讓圖案更有層次；Distortion 是先扭曲座標本身，再拿扭曲後的座標取樣，讓過於工整規律的圖案變得更不規則、更有機。",
        en: "Distortion and Detail do entirely different things: Detail adds more octaves for a more layered pattern, while Distortion warps the coordinate itself before sampling, breaking up overly regular patterns into something more irregular and organic.",
      },
    },
  ],
};
