import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_brick_texture_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "磚塊紋理完整導覽：形狀參數全解析", en: "Brick Texture Full Tour: All the Shape Parameters" },
  description: {
    zh: "做磚牆教學（`brick_wall`）只用了預設形狀，磚塊紋理（Brick Texture）其實還有一整組能改變磚塊排法的參數：寬高比、位移週期、壓縮週期、顏色偏向。這篇專門帶你把這些參數一個個轉過一輪，理解怎麼調出瘦高磚、跑道式砌法、或風化不規則的牆面。",
    en: "The brick wall tutorial only used the default shape. Brick Texture actually has a whole set of parameters that reshape the brick layout: aspect ratio, offset frequency, squash frequency, and color bias. This tutorial walks through each one so you understand how to get tall narrow bricks, running-bond masonry, or a weathered irregular wall.",
  },
  startGraph: {
    nodes: [
      { id: "t_btt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_btt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_btt_l1", fromNode: "t_btt_principled", fromSocket: "bsdf", toNode: "t_btt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_btt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_btt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_btt_brick",
        typeId: "texture_brick",
        x: 320,
        y: 100,
        params: { brickWidth: 0.3, rowHeight: 0.45, offset: 0.33, offsetFrequency: 3, squash: 0.7, squashFrequency: 4, bias: 0.6 },
      },
      { id: "te_btt_texcoord", typeId: "input_texture_coordinate", x: 60, y: 100, params: {} },
    ],
    links: [
      { id: "te_btt_l1", fromNode: "te_btt_principled", fromSocket: "bsdf", toNode: "te_btt_out", toSocket: "surface" },
      { id: "te_btt_l2", fromNode: "te_btt_brick", fromSocket: "color", toNode: "te_btt_principled", toSocket: "baseColor" },
      { id: "te_btt_l3", fromNode: "te_btt_texcoord", fromSocket: "generated", toNode: "te_btt_brick", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接好磚塊紋理", en: "Step 1: Wire Up Brick Texture" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）與磚塊紋理（Brick Texture），把 Generated 接到磚塊紋理的向量（Vector），再把磚塊紋理的顏色（Color）接到原理化 BSDF 的底色（Base Color）。應該會看到預設比例的磚牆。",
        en: "Add a Texture Coordinate and a Brick Texture, connect Generated to Brick Texture's Vector, then connect Brick Texture's Color to Principled BSDF's Base Color. You should see the default brick proportions.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_brick", "vector") &&
        hasLinkBetweenTypes(graph, "texture_brick", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：調整寬高比，做出瘦高磚", en: "Step 2: Adjust Aspect Ratio for Tall Narrow Bricks" },
      instruction: {
        zh: "把磚塊寬度（Brick Width）調低（例如 0.3）、列高（Row Height）調高（例如 0.45）。磚塊會從一般的寬扁比例變成瘦高的長條——這兩個參數是各自獨立的比例值，不是連動的縮放。",
        en: "Lower Brick Width (e.g. 0.3) and raise Row Height (e.g. 0.45). Bricks go from the usual wide-flat proportion to tall narrow columns — these two parameters are independent ratios, not a linked scale.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_brick", "brickWidth", (v) => v <= 0.35) &&
        anyNodeParamMatches(graph, "texture_brick", "rowHeight", (v) => v >= 0.4),
    },
    {
      title: { zh: "第三步：改變位移週期，做出跑道式砌法", en: "Step 3: Change Offset Frequency for a Running Bond" },
      instruction: {
        zh: "把位移量（Offset）設成 0.33、位移週期（Offset Frequency）設成 3——代表每 3 列才整體橫向位移一次，而不是預設的『每列都交錯』。磚縫看起來會呈現每 3 排重複一次的節奏，而不是逐排交錯的傳統排法。",
        en: "Set Offset to 0.33 and Offset Frequency to 3 — meaning the whole pattern shifts horizontally only once every 3 rows, instead of the default 'every row staggers'. The mortar lines now repeat their rhythm every 3 rows instead of the traditional row-by-row stagger.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_brick", "offsetFrequency", (v) => v >= 3) &&
        anyNodeParamMatches(graph, "texture_brick", "offset", (v) => v > 0.1),
    },
    {
      title: { zh: "第四步：加上壓縮週期與顏色偏向，做出風化不規則感", en: "Step 4: Add Squash Frequency and Color Bias for a Weathered Look" },
      instruction: {
        zh: "把壓縮量（Squash）設成 0.7、壓縮週期（Squash Frequency）設成 4——每 4 列磚塊寬度會被壓縮成 0.7 倍，打破完全規律的網格感。再把偏向（Bias）調到 0.6 附近，讓磚塊隨機挑選顏色 1／顏色 2 時明顯偏向其中一種，模擬長期日曬風化、顏色不均勻的老牆。",
        en: "Set Squash to 0.7 and Squash Frequency to 4 — every 4 rows, brick width compresses to 0.7×, breaking the perfectly regular grid feel. Then set Bias near 0.6 so the random Color 1/Color 2 pick leans noticeably toward one tone, mimicking a sun-weathered, unevenly colored old wall.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_brick", "squashFrequency", (v) => v >= 3) &&
        anyNodeParamMatches(graph, "texture_brick", "bias", (v) => Math.abs(v) >= 0.4),
    },
  ],
};
