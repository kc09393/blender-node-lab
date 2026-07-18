import { hasNodeOfType, hasLinkBetweenTypes, findNodesOfType, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_layer_stack_blend",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "疊圖技巧：多層混合模式堆疊", en: "Layer Stacking: Chaining Multiple Blend Modes" },
  description: {
    zh: "真實的材質貼圖很少只疊一層——通常是「底色 → 正片疊底疊污漬 → 濾色疊磨損高光」這樣一層一層疊上去，跟 Photoshop 的圖層堆疊完全同一個概念。這篇教學串接兩個混合顏色（Mix Color）節點，各自用不同的混合模式，做出「又髒又有磨損高光」的複雜表面。",
    en: "Real-world material textures are rarely a single layer — usually it's 'base color → Multiply in grime → Screen in worn highlights', stacked one after another, exactly like layers in Photoshop. This tutorial chains two Mix Color nodes with different blend modes to create a surface that's both dirty and has worn highlights.",
  },
  startGraph: {
    nodes: [
      { id: "t_ls_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "t_ls_principled", typeId: "shader_principled_bsdf", x: 1100, y: 100, params: { baseColor: [0.55, 0.45, 0.35, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_ls_l0", fromNode: "t_ls_principled", fromSocket: "bsdf", toNode: "t_ls_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ls_out", typeId: "output_material", x: 1700, y: 260, params: {} },
      { id: "te_ls_principled", typeId: "shader_principled_bsdf", x: 1400, y: 100, params: { roughness: 0.6 } },
      { id: "te_ls_mix2", typeId: "color_mix", x: 1140, y: 100, params: { mode: "screen", fac: 0.35 } },
      { id: "te_ls_noise_hi", typeId: "texture_noise", x: 900, y: 260, params: { scale: 12, detail: 3 } },
      { id: "te_ls_mix1", typeId: "color_mix", x: 880, y: 60, params: { mode: "multiply", fac: 0.5, a: [0.55, 0.45, 0.35, 1] } },
      { id: "te_ls_voronoi_dirt", typeId: "texture_voronoi", x: 620, y: 60, params: { scale: 5 } },
      { id: "te_ls_texcoord", typeId: "input_texture_coordinate", x: 380, y: 60, params: {} },
    ],
    links: [
      { id: "te_ls_l1", fromNode: "te_ls_principled", fromSocket: "bsdf", toNode: "te_ls_out", toSocket: "surface" },
      { id: "te_ls_l2", fromNode: "te_ls_mix2", fromSocket: "color", toNode: "te_ls_principled", toSocket: "baseColor" },
      { id: "te_ls_l3", fromNode: "te_ls_mix1", fromSocket: "color", toNode: "te_ls_mix2", toSocket: "a" },
      { id: "te_ls_l4", fromNode: "te_ls_noise_hi", fromSocket: "color", toNode: "te_ls_mix2", toSocket: "b" },
      { id: "te_ls_l5", fromNode: "te_ls_voronoi_dirt", fromSocket: "color", toNode: "te_ls_mix1", toSocket: "b" },
      { id: "te_ls_l6", fromNode: "te_ls_texcoord", fromSocket: "generated", toNode: "te_ls_voronoi_dirt", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：第一層——用正片疊底疊上污漬", en: "Step 1: Layer One — Multiply In Grime" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）跟沃羅諾伊紋理（Voronoi Texture），當作污漬圖案。\n\n加入第一個混合顏色（Mix Color）節點。A 保留原本的底色不動，B 接沃羅諾伊的顏色（Color）輸出。\n\n混合模式選正片疊底（Multiply）。正片疊底的特性是「只會變暗、不會變亮」，很適合拿來疊污漬。",
        en: "Add a Texture Coordinate and Voronoi Texture as the grime pattern, then add a Mix Color node — keep A as the original base color, connect Voronoi's Color output to B, and set the mode to Multiply. Multiply can only darken, perfect for grime.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "color", "color_mix", "b") &&
        anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "multiply"),
    },
    {
      title: { zh: "第二步：第二層——用濾色疊上磨損高光", en: "Step 2: Layer Two — Screen In Worn Highlights" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture），當作磨損高光圖案。\n\n加入第二個混合顏色節點（這是新的一個，跟上一步那個不是同一個）。A 接第一層（正片疊底）的輸出，B 接雜訊的顏色（Color）輸出。\n\n混合模式選濾色（Screen）。濾色的特性是「只會變亮、不會變暗」，正好跟正片疊底相反，適合拿來疊高光。",
        en: "Add a Noise Texture as the worn-highlight pattern, then add a second Mix Color node — connect A to the first layer's (Multiply) output, B to Noise's Color output, and set the mode to Screen. Screen can only brighten — the opposite of Multiply, perfect for highlights.",
      },
      check: (graph) => {
        const mixNodes = findNodesOfType(graph, "color_mix");
        if (mixNodes.length < 2) return false;
        return (
          nodeHasIncomingFromType(graph, "color_mix", "color_mix") &&
          mixNodes.some((n) => n.params.mode === "screen")
        );
      },
    },
    {
      title: { zh: "第三步：接到底色，確認兩層都看得到", en: "Step 3: Connect to Base Color and Confirm Both Layers Show" },
      instruction: {
        zh: "把第二層（濾色）的輸出，接到原理化 BSDF（Principled BSDF）的底色（Base Color）。\n\n仔細看即時預覽：應該同時看得到暗色的污漬區塊、跟亮色的高光區塊，不是只有其中一種。這就是「疊圖」的重點——兩層效果同時存在，互不取代。",
        en: "Connect the second (Screen) layer's output to Principled BSDF's Base Color. Look closely at the live preview — you should see both dark grime patches AND bright highlight patches at once, not just one or the other. That's the point of layering: both effects coexist without replacing each other.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第四步：調整兩層的強度比例", en: "Step 4: Balance Both Layers' Strength" },
      instruction: {
        zh: "分別調整兩個混合顏色節點的 Fac，數值越高、該層效果越明顯。\n\n試著把第一層調高、第二層調低，感受兩層各自獨立可調的感覺。\n\n這就是分層製作材質的核心優勢：不用重新調整上游的紋理節點，只要調整每一層混合的比例就好。",
        en: "Adjust both Mix Color nodes' Fac independently — higher values make that layer's effect stronger. Try raising the first layer and lowering the second to feel how each layer is independently tunable — the core advantage of layered material authoring: you never need to touch the upstream texture nodes, just each layer's blend ratio.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "color_mix", "fac", (v) => typeof v === "number" && v > 0 && v < 1),
    },
  ],
  quiz: [
    {
      question: {
        zh: "這篇教學先用正片疊底疊上污漬圖案，再用濾色疊上磨損高光，兩個混合節點串接在一起。為什麼最後畫面會「同時」看到暗色污漬跟亮色高光，而不是其中一種蓋掉另一種？",
        en: "This tutorial chains Multiply (grime) then Screen (worn highlights). Why does the final image show both dark grime AND bright highlights at once, instead of one overwriting the other?",
      },
      options: [
        {
          zh: "因為兩層各自處理不同方向的亮度變化（正片疊底只變暗、濾色只變亮），且第二層接在第一層的輸出之後串接，是疊加在彼此的結果上，不是互相取代",
          en: "Each layer handles a different direction of brightness change (Multiply only darkens, Screen only brightens), and the second layer is chained onto the first layer's output — building on it, not replacing it",
        },
        { zh: "因為 Mix Color 節點會自動把兩張圖各取一半疊在一起", en: "Because Mix Color automatically averages the two images 50/50" },
        { zh: "因為正片疊底跟濾色其實是同一種運算，只是換了名字", en: "Because Multiply and Screen are actually the same operation under different names" },
        { zh: "因為污漬圖案跟磨損圖案剛好畫在畫面不同的區域，彼此沒有重疊", en: "Because the grime and highlight patterns happen to occupy non-overlapping areas" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "正片疊底的結果只會比原本暗（或不變）、濾色的結果只會比原本亮（或不變）。把兩者串接（不是並排、也不是取代），污漬造成的暗部保留在第一層的輸出裡，再被第二層疊加上亮部，兩種效果因此能同時共存在同一張圖上——這正是圖層疊加技法的核心。",
        en: "Multiply's result is always darker (or unchanged), Screen's is always brighter (or unchanged). Chaining them — not placing side by side, not replacing — means the first layer's darkened grime survives into the second layer's input, which then adds highlights on top. Both effects coexist. That's the core of layer stacking.",
      },
    },
  ],
};
