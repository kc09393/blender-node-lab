import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_voronoi_color_subtle_blend",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "讓沃羅諾伊色塊變得若隱若現：低比例混色", en: "Making Voronoi Cells Subtle: Low-Ratio Color Blending" },
  description: {
    zh: "沃羅諾伊紋理（Voronoi Texture）的顏色（Color）輸出直接接到底色，每個細胞會是一塊隨機的鮮豔色塊——很搶眼，但很少有真實材質長這樣。這篇教鍍鋅浪板（Galvanized Zinc）這個材質用的技巧：不要直接顯示 Voronoi 的顏色，而是用混合顏色（Mix Color）把它以很低的比例（例如 0.22）疊回一個基底色，色塊立刻從「拼貼馬賽克」變成金屬表面本身那種若隱若現的結晶紋路。",
    en: "Wiring Voronoi Texture's Color output straight into a base color gives each cell a bold random flat color — striking, but few real materials actually look like that. This tutorial teaches the trick used in the Galvanized Zinc preset: instead of showing Voronoi's Color directly, blend it into a base tone at a low ratio (e.g. 0.22) using Mix Color. The cells instantly go from looking like a tiled mosaic to the subtle crystalline pattern a real metal surface has.",
  },
  startGraph: {
    nodes: [
      { id: "t_vcsb_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_vcsb_principled", typeId: "shader_principled_bsdf", x: 320, y: 200, params: { baseColor: [0.72, 0.73, 0.75, 1], roughness: 0.4, metallic: 1 } },
    ],
    links: [{ id: "t_vcsb_l1", fromNode: "t_vcsb_principled", fromSocket: "bsdf", toNode: "t_vcsb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vcsb_out", typeId: "output_material", x: 1160, y: 220 },
      { id: "te_vcsb_texcoord", typeId: "input_texture_coordinate", x: -80, y: 160 },
      { id: "te_vcsb_mapping", typeId: "vector_mapping", x: 180, y: 160, params: { scale: [12, 12, 12] } },
      { id: "te_vcsb_voronoi", typeId: "texture_voronoi", x: 440, y: 160, params: { feature: "f1", randomness: 1, scale: 18 } },
      { id: "te_vcsb_mix", typeId: "color_mix", x: 700, y: 100, params: { fac: 0.22, a: [0.72, 0.73, 0.75, 1], mode: "mix" } },
      { id: "te_vcsb_bump", typeId: "vector_bump", x: 700, y: 320, params: { strength: 0.25 } },
      { id: "te_vcsb_principled", typeId: "shader_principled_bsdf", x: 920, y: 220, params: { roughness: 0.4, metallic: 1 } },
    ],
    links: [
      { id: "te_vcsb_l1", fromNode: "te_vcsb_texcoord", fromSocket: "generated", toNode: "te_vcsb_mapping", toSocket: "vector" },
      { id: "te_vcsb_l2", fromNode: "te_vcsb_mapping", fromSocket: "vector", toNode: "te_vcsb_voronoi", toSocket: "vector" },
      { id: "te_vcsb_l3", fromNode: "te_vcsb_voronoi", fromSocket: "color", toNode: "te_vcsb_mix", toSocket: "b" },
      { id: "te_vcsb_l4", fromNode: "te_vcsb_mix", fromSocket: "color", toNode: "te_vcsb_principled", toSocket: "baseColor" },
      { id: "te_vcsb_l5", fromNode: "te_vcsb_voronoi", fromSocket: "distance", toNode: "te_vcsb_bump", toSocket: "height" },
      { id: "te_vcsb_l6", fromNode: "te_vcsb_bump", fromSocket: "normal", toNode: "te_vcsb_principled", toSocket: "normal" },
      { id: "te_vcsb_l7", fromNode: "te_vcsb_principled", fromSocket: "bsdf", toNode: "te_vcsb_out", toSocket: "surface" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：直接顯示 Voronoi 顏色，看看太搶眼的樣子", en: "Step 1: Show Voronoi's Color Directly — See It Overpower" },
      instruction: {
        zh: "加入貼圖座標、映射（Scale 調到 12 左右）、沃羅諾伊紋理（Feature 選 F1，Scale 調到 18），把它的顏色（Color）輸出直接接到原理化 BSDF 的底色（Base Color）。\n\n畫面會變成一塊塊隨機顏色的多邊形拼貼，很像馬賽克磁磚，但完全不像任何真實金屬表面。",
        en: "Add Texture Coordinate, Mapping (Scale around 12), and a Voronoi Texture (Feature set to F1, Scale around 18). Connect its Color output directly into the Principled BSDF's Base Color.\n\nYou'll get a patchwork of randomly colored polygons — looks like mosaic tile, nothing like any real metal surface.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：改用混合顏色，把比例壓得很低", en: "Step 2: Switch to Mix Color at a Low Ratio" },
      instruction: {
        zh: "加入混合顏色（Mix Color）節點：A 填回原本的鋼灰色底色、B 接沃羅諾伊的 Color 輸出、混合模式維持正常（Mix）、Fac 調到 0.22 左右。把原理化 BSDF 的底色改接混合顏色的輸出（取代原本沃羅諾伊直接接過去的線）。\n\n色塊應該立刻變得含蓄很多——底色仍然是主體，只在每個細胞邊界透出一點點若隱若現的色差，比較像真實金屬表面的結晶紋理，不再是明顯的拼貼色塊。",
        en: "Add a Mix Color node: set A to the original steel-gray base color, wire B from Voronoi's Color output, keep the blend mode at Mix, and set Fac to around 0.22. Reconnect the Principled BSDF's Base Color from Mix Color's output (replacing Voronoi's direct connection).\n\nThe cells should immediately look far more subtle — the base tone still dominates, with just a faint hint of color variance at each cell boundary, closer to a real metal's crystalline texture than an obvious tiled pattern.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "color", "color_mix", "b") &&
        hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "color_mix", "fac", (v) => v > 0 && v <= 0.35),
    },
    {
      title: { zh: "第三步：用同一顆 Voronoi 的距離加一點點凹凸", en: "Step 3: Add a Touch of Bump from the Same Voronoi's Distance" },
      instruction: {
        zh: "加入凹凸（Bump）節點，把同一顆沃羅諾伊紋理的距離（Distance）輸出接到 Bump 的高度（Height），強度調低（例如 0.25），再把 Bump 的法線接到原理化 BSDF 的法線插槽。\n\n現在細胞邊界不只顏色若隱若現，摸起來（光影反應）也有一點點顆粒感，兩種線索疊在一起更像實際金屬表面。",
        en: "Add a Bump node, wire the same Voronoi Texture's Distance output into Bump's Height, keep the strength low (around 0.25), and connect Bump's Normal into the Principled BSDF's Normal socket.\n\nNow the cell boundaries carry a faint textural grain in addition to the subtle color variance — the two cues together read much closer to an actual metal surface.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第四步：這個技巧能用在哪裡", en: "Step 4: Where Else This Trick Applies" },
      instruction: {
        zh: "只要一個遮罩或紋理的原始輸出「太搶戲、太像人工拼貼」，先別急著換掉整個技法——試試看用混合顏色把它以低比例疊回基底色，往往比重新設計整套紋理更快、更接近真實材質那種細膩、不張揚的變化感。",
        en: "Whenever a mask or texture's raw output feels too loud or artificially tiled, don't rush to swap out the whole technique — try blending it back into a base tone at a low ratio with Mix Color first. It's often faster than redesigning the texture from scratch, and gets you closer to the subtle, understated variation real materials actually have.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_mix", "fac", (v) => v > 0 && v <= 0.35),
    },
  ],
  quiz: [
    {
      question: {
        zh: "沃羅諾伊紋理的顏色（Color）輸出直接接到底色時效果太搶眼、太像拼貼馬賽克，這篇教的解法是？",
        en: "When Voronoi's Color output looks too bold and mosaic-like when wired straight to base color, what's this tutorial's fix?",
      },
      options: [
        { zh: "把 Randomness 調到 0", en: "Set Randomness to 0" },
        { zh: "用混合顏色以低比例（例如 0.22）疊回基底色", en: "Blend it into a base tone at a low ratio (e.g. 0.22) with Mix Color" },
        { zh: "切換到 F2 特徵", en: "Switch to the F2 feature" },
        { zh: "直接刪掉 Voronoi，改用純色", en: "Delete Voronoi entirely and use a flat color" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "用混合顏色（Mix Color）把 Voronoi 的 Color 以低比例（例如 0.22）疊回一個基底色，基底色仍是主體，色塊只在細胞邊界透出一點點若隱若現的變化，比直接顯示鮮豔色塊更接近真實金屬表面的結晶紋理。",
        en: "Blending Voronoi's Color into a base tone at a low ratio (e.g. 0.22) with Mix Color keeps the base tone dominant, with only a faint hint of variance at cell boundaries — much closer to a real metal surface's crystalline texture than showing the bold cell colors directly.",
      },
    },
  ],
};
