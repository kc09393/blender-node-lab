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
  quiz: [
    {
      question: {
        zh: "這篇教學用兩個完全獨立的原理化 BSDF（一個當車漆底色、一個只發光當亮片）接到加法著色器，而不是把亮片遮罩直接接進車漆材質自己的發光插槽。這樣做的好處是什麼？",
        en: "This tutorial uses two entirely separate Principled BSDF nodes (one for the base paint, one purely for the emissive flakes) fed into an Add Shader, instead of wiring the sparkle mask directly into the paint material's own Emission input. What's the benefit?",
      },
      options: [
        {
          zh: "兩個材質的其他屬性（金屬度、粗糙度、底色）可以完全獨立設定，不會因為调整亮片而牽動底漆本身的質感，反之亦然",
          en: "Each material's other properties (metallic, roughness, base color) can be tuned completely independently — adjusting the flakes never disturbs the base paint's own look, and vice versa",
        },
        { zh: "因為原理化 BSDF 一個節點只能有一個發光插槽，沒辦法讓底漆材質同時處理底色又發光", en: "Because a single Principled BSDF can only have one emission slot, so the base paint material can't handle both base color and emission" },
        { zh: "這樣寫法效能比較好，兩個材質分開算比較快", en: "It's simply more performant to compute two separate materials than one combined one" },
        { zh: "加法著色器只能接受兩個完全獨立的材質，不能接受同一個材質的不同插槽", en: "Add Shader can only accept two fully separate materials, never different sockets of the same material" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "如果把遮罩直接接進車漆材質自己的 Emission Color，車漆的底色、金屬度、粗糙度都跟發光共用同一個節點，之後想單獨微調亮片的顏色/強度而不影響底漆質感會綁在一起、互相牽扯。分成兩個獨立材質＋加法著色器疊加，兩邊的參數各自獨立，這是材質圖裡「模組化」的實用技巧，不是效能或插槽數量的限制。",
        en: "If the mask were wired directly into the paint material's own Emission Color, the base color, metallic, and roughness would all live on the same node as the emission, so tuning the flakes' color/intensity without disturbing the paint's own look would be entangled. Splitting into two independent materials summed via Add Shader keeps both sets of parameters fully independent — a practical modularity technique in material graphs, not a performance or socket-count limitation.",
      },
    },
  ],
};
