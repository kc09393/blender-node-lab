import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_stone",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出石頭材質", en: "Make a Stone Material" },
  description: {
    zh: "用沃羅諾伊紋理（Voronoi Texture）的細胞圖案做出石頭的斑駁感，並用同一份資料同時驅動顏色跟粗糙度，讓縫隙看起來更真實。",
    en: "Use Voronoi Texture's cellular pattern to create a mottled stone look, driving both color and roughness from the same data so the cracks read as more realistic.",
  },
  startGraph: {
    nodes: [
      { id: "t_st_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_st_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_st_l1", fromNode: "t_st_principled", fromSocket: "bsdf", toNode: "t_st_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_st_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_st_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_st_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.2, 0.2, 0.22, 1] }, { position: 1, color: [0.6, 0.58, 0.55, 1] }] },
      },
      { id: "te_st_voronoi", typeId: "texture_voronoi", x: 320, y: 100, params: {} },
      { id: "te_st_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_st_l1", fromNode: "te_st_principled", fromSocket: "bsdf", toNode: "te_st_out", toSocket: "surface" },
      { id: "te_st_l2", fromNode: "te_st_ramp", fromSocket: "color", toNode: "te_st_principled", toSocket: "baseColor" },
      { id: "te_st_l3", fromNode: "te_st_voronoi", fromSocket: "distance", toNode: "te_st_ramp", toSocket: "fac" },
      { id: "te_st_l4", fromNode: "te_st_voronoi", fromSocket: "distance", toNode: "te_st_principled", toSocket: "roughness" },
      { id: "te_st_l5", fromNode: "te_st_texcoord", fromSocket: "generated", toNode: "te_st_voronoi", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Voronoi Texture", en: "Step 1: Add a Voronoi Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入沃羅諾伊紋理（Voronoi Texture）——它產生的細胞邊界很適合做石頭表面的裂紋。",
        en: "Drag in a Voronoi Texture from the Texture category — its cell boundaries are a great basis for stone-surface cracks.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_voronoi"),
    },
    {
      title: { zh: "第二步：接上座標", en: "Step 2: Wire Up Coordinates" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入 Input 分類），把它的 Generated 輸出接到沃羅諾伊紋理（Voronoi Texture）的向量（Vector）。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Voronoi Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_voronoi", "vector"),
    },
    {
      title: { zh: "第三步：用 Color Ramp 上色", en: "Step 3: Color It with Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp，轉換器 Converter 分類），把沃羅諾伊紋理（Voronoi）的距離（Distance）輸出接到顏色漸變的係數（Fac）——細胞中心距離的深淺就會變成顏色深淺，做出石頭的斑駁色調。",
        en: "Add a Color Ramp (Converter category) and connect Voronoi's Distance output to Color Ramp's Fac — the cell-center distance becomes color variation, creating a mottled stone tone.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac"),
    },
    {
      title: { zh: "第四步：接到 Base Color", en: "Step 4: Feed Base Color" },
      instruction: {
        zh: "把顏色漸變（Color Ramp）的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Connect Color Ramp's Color output to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第五步：讓縫隙處反光不同", en: "Step 5: Vary Reflectivity at the Cracks" },
      instruction: {
        zh: "把沃羅諾伊紋理（Voronoi）的距離（Distance）輸出「再接一條線」到原理化 BSDF（Principled BSDF）的粗糙度（Roughness）（一個輸出可以同時接到好幾個地方）。這樣細胞縫隙處的粗糙度會跟著變化，比整個表面用同一個粗糙度更接近真實石頭。",
        en: "Connect Voronoi's Distance output with a second wire to Principled BSDF's Roughness (one output can feed multiple destinations). Now roughness varies at the cell cracks too — closer to real stone than a single uniform roughness value.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "shader_principled_bsdf", "roughness"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "這篇教學把沃羅諾伊的距離（Distance）輸出，同時接到底色（透過顏色漸變）跟粗糙度兩個地方。這是怎麼做到的？",
        en: "This tutorial wires Voronoi's Distance output into both Base Color (via a Color Ramp) and Roughness at the same time. How is that possible?",
      },
      options: [
        { zh: "一個輸出插槽本來就可以同時拉出好幾條線，接到好幾個不同的輸入，不需要複製節點", en: "A single output socket can always have multiple wires coming out of it, feeding several different inputs — no need to duplicate the node" },
        { zh: "需要先用一個特殊的「分流」節點把 Distance 複製成兩份，才能分別接到兩個地方", en: "You first need a special 'splitter' node to duplicate Distance into two copies before wiring it to two places" },
        { zh: "其實只有最後一條線會生效，前面接的線會被自動斷開", en: "Actually only the last-made connection takes effect — earlier ones get automatically disconnected" },
        { zh: "這樣接線在本沙盒是不被允許的操作，會顯示錯誤", en: "This kind of wiring isn't allowed in this sandbox and would show an error" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "材質圖裡的輸出插槽（跟大部分節點編輯器一樣）本來就支援「一對多」：同一份資料可以原封不動地同時餵給任意多個輸入插槽，不需要任何複製或分流節點。這篇教學正是利用這個特性，讓「細胞邊界」這個概念同時影響顏色（透過顏色漸變）跟粗糙度，兩種效果來自同一份底層資料，天生就會對齊、不會各自獨立飄移，比分別用兩份不相關的雜訊更真實。",
        en: "An output socket in a material graph (like in most node editors) natively supports fan-out: the same data can feed any number of input sockets unchanged, with no duplication or splitter node required. This tutorial exploits exactly that — letting the same 'cell boundary' concept drive both color (via the Color Ramp) and roughness at once. Because both effects come from the same underlying data, they naturally stay aligned instead of drifting independently, which reads more realistically than using two unrelated noise sources.",
      },
    },
  ],
};
