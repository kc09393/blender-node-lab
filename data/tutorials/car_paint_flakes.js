import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_car_paint_flakes",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "金屬車漆：疊上細小亮片", en: "Metallic Car Paint: Adding Tiny Flakes" },
  description: {
    zh: "真正的金屬烤漆不是均勻的一片顏色——漆裡混了無數微小的金屬亮片，只有極少數角度/位置會反出銳利的小亮點。這篇教學用沃羅諾伊紋理（Voronoi Texture）的距離（Distance）輸出配上顏色漸變（Color Ramp）做出「大部分是黑、只有細胞中心是白」的稀疏亮點遮罩，再用加法著色器（Add Shader）把亮點當發光疊在原本的車漆底色上——這是兩個獨立材質相加、而不是取代彼此的疊圖概念。",
    en: "Real metallic car paint isn't a flat color — it's full of microscopic metal flakes, and only a few spots catch a sharp bright glint. This tutorial uses Voronoi Texture's Distance output with a Color Ramp to build a sparse 'mostly black, bright only at cell centers' mask, then uses an Add Shader to layer that as glow on top of the base paint color — two independent materials summed together, not replacing one another.",
  },
  startGraph: {
    nodes: [
      { id: "t_cp_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cp_base", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.02, 0.05, 1], metallic: 0.85, roughness: 0.3 } },
    ],
    links: [{ id: "t_cp_l1", fromNode: "t_cp_base", fromSocket: "bsdf", toNode: "t_cp_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cp_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_cp_add", typeId: "shader_add_shader", x: 1400, y: 140, params: {} },
      { id: "te_cp_base", typeId: "shader_principled_bsdf", x: 1100, y: 60, params: { baseColor: [0.5, 0.02, 0.05, 1], metallic: 0.85, roughness: 0.3 } },
      { id: "te_cp_flake", typeId: "shader_principled_bsdf", x: 1100, y: 260, params: { baseColor: [0, 0, 0, 1], metallic: 1, roughness: 0.05, emissionStrength: 6 } },
      {
        id: "te_cp_ramp",
        typeId: "converter_color_ramp",
        x: 820,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.05, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      { id: "te_cp_voronoi", typeId: "texture_voronoi", x: 560, y: 260, params: { scale: 30, randomness: 1 } },
    ],
    links: [
      { id: "te_cp_l1", fromNode: "te_cp_add", fromSocket: "bsdf", toNode: "te_cp_out", toSocket: "surface" },
      { id: "te_cp_l2", fromNode: "te_cp_base", fromSocket: "bsdf", toNode: "te_cp_add", toSocket: "shader1" },
      { id: "te_cp_l3", fromNode: "te_cp_flake", fromSocket: "bsdf", toNode: "te_cp_add", toSocket: "shader2" },
      { id: "te_cp_l4", fromNode: "te_cp_ramp", fromSocket: "color", toNode: "te_cp_flake", toSocket: "emissionColor" },
      { id: "te_cp_l5", fromNode: "te_cp_voronoi", fromSocket: "distance", toNode: "te_cp_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用沃羅諾伊的距離做亮點遮罩", en: "Step 1: Build a Sparkle Mask from Voronoi Distance" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture）。把縮放（Scale）調高，例如 30，細胞會變小變多。\n\n加入顏色漸變（Color Ramp）。把沃羅諾伊的距離（Distance）輸出，接到顏色漸變的係數（Fac）輸入。\n\n設定顏色漸變：位置 0 設成白色、位置 0.05 設成黑色、位置 1 也設成黑色。原因：Distance 在每個細胞正中心是 0，離開中心後數值會快速變大。這樣設定之後，畫面只會在每個細胞的正中心留下一個小白點，其餘全部是黑色——這就是亮片的遮罩。\n\n⚠️ 顏色漸變的顏色（Color）輸出先不要接到任何地方，下一步才會用到。",
        en: "Add a Voronoi Texture with a high Scale (e.g. 30) for many small cells. Add a Color Ramp, connect Voronoi's Distance to its Fac, and set it up so position 0 is white, it drops to black quickly by around 0.05, and stays black after — since Distance is 0 at each cell center and rises quickly away from it, this leaves only small white dots near cell centers with everything else black.\n\nDon't connect the Color Ramp's Color output anywhere yet — the next step needs it.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(
          graph,
          "converter_color_ramp",
          "stops",
          (stops) => Array.isArray(stops) && stops.some((s) => s.position <= 0.1 && s.color[0] > 0.7) && stops.some((s) => s.position > 0.1 && s.color[0] < 0.3)
        ),
    },
    {
      title: { zh: "第二步：把遮罩接到第二個材質的發光", en: "Step 2: Feed the Mask into a Second Material's Emission" },
      instruction: {
        zh: "再加入一個原理化 BSDF（Principled BSDF）。這是一個全新、獨立的材質節點，先不要接到材質輸出。\n\n把它的底色（Base Color）設成黑色、金屬度（Metallic）設成 1、粗糙度（Roughness）調到接近 0。\n\n把上一步顏色漸變的顏色（Color）輸出，接到這個新節點的發光顏色（Emission Color）輸入。\n\n把發光強度（Emission Strength）調高，例如 6。\n\n這樣一來，這個材質只有在遮罩是白色的小點上才會發光，其餘地方（遮罩是黑色）完全不發光。",
        en: "Add another Principled BSDF — a brand new, separate material node. Don't connect it to the material output yet.\n\nSet its Base Color to black, Metallic to 1, and Roughness close to 0.\n\nConnect the Color Ramp's Color output from the previous step into this new node's Emission Color input.\n\nRaise Emission Strength, e.g. to 6.\n\nNow this material only glows where the mask is white; everywhere else (mask black) it stays dark.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "emissionColor") &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "emissionStrength", (v) => typeof v === "number" && v > 1),
    },
    {
      title: { zh: "第三步：用加法著色器疊加，不是取代", en: "Step 3: Layer with Add Shader, Not Replace" },
      instruction: {
        zh: "加入加法著色器（Add Shader）。它有兩個著色器輸入插槽。\n\n把一開始的車漆底色材質，接到其中一個輸入。\n\n把剛剛做的發光材質，接到另一個輸入。\n\n把加法著色器的輸出，接到材質輸出。\n\n轉動預覽球體看看：應該同時看到深色烤漆底色、跟隨機分布的細小亮點，兩者一起出現，不是只有其中一個。這就是 Add Shader 跟 Mix Shader 最大的不同：Add Shader 是「兩個都要、疊在一起」，Mix Shader 是「只選一個、依比例混合」。",
        en: "Add an Add Shader, connect the base paint material to one input and the sparkle-emission material you just built to the other, then connect Add Shader's output to the material output. Orbit the preview — you should see both the dark paint base color AND scattered tiny bright specks at once. That's the key difference between Add Shader (sums) and Mix Shader (blends/replaces).",
      },
      check: (graph) => hasNodeOfType(graph, "shader_add_shader") && nodeHasIncomingFromType(graph, "shader_add_shader", "shader_principled_bsdf"),
    },
  ],
};
