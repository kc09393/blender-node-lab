import { hasNodeOfType, hasLinkBetweenTypes, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_detail_baking_workflow",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "細節烘焙工作流：法線貼圖＋向量位移", en: "Detail Baking Workflow: Normal Map + Vector Displacement" },
  description: {
    zh: "遊戲/影視最常見的高模轉低模流程：先在雕刻軟體做出超高精度的模型，再把細節「烘焙」成兩張貼圖——法線貼圖（Normal Map，做出光影細節，不改變輪廓）跟向量位移貼圖（Vector Displacement Map，真的把頂點往外推，改變輪廓）——貼回低模上。這篇教學示範完整接線流程：UV 貼圖（UV Map）指定座標、圖像紋理（Image Texture）讀圖、法線貼圖節點解出光影方向、向量位移節點搭配「把 0-1 貼圖數值解碼回 -1 到 1 方向」的技巧做出真正的幾何位移。",
    en: "The classic high-poly-to-low-poly pipeline: sculpt extreme detail in a dedicated app, then bake it into two textures — a Normal Map (shading detail, silhouette unchanged) and a Vector Displacement Map (actually pushes vertices, changing the silhouette) — and apply both to the low-poly mesh. This tutorial wires up the whole chain: UV Map for coordinates, Image Texture to read the maps, Normal Map to decode shading direction, and Vector Displacement paired with the 'decode a 0-1 map value back into a -1..1 direction' technique for real geometric displacement.",
  },
  startGraph: {
    nodes: [
      { id: "t_db_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_db_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_db_l1", fromNode: "t_db_principled", fromSocket: "bsdf", toNode: "t_db_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_db_out", typeId: "output_material", x: 2160, y: 260, params: {} },
      { id: "te_db_principled", typeId: "shader_principled_bsdf", x: 1860, y: 40, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.6 } },
      { id: "te_db_normalmap", typeId: "vector_normal_map", x: 1600, y: 40, params: { strength: 1 } },
      { id: "te_db_normalmap_img", typeId: "texture_image", x: 1340, y: 40, params: {} },
      { id: "te_db_uv", typeId: "input_uv_map", x: 1080, y: 40, params: {} },
      { id: "te_db_vecdisp", typeId: "vector_displacement_vec", x: 1860, y: 420, params: { scale: 0.3 } },
      { id: "te_db_combine", typeId: "converter_combine_xyz", x: 1600, y: 420, params: {} },
      { id: "te_db_mathX", typeId: "converter_math", x: 1340, y: 320, params: { operation: "multiply_add", value2: 2, value3: -1 } },
      { id: "te_db_mathY", typeId: "converter_math", x: 1340, y: 420, params: { operation: "multiply_add", value2: 2, value3: -1 } },
      { id: "te_db_mathZ", typeId: "converter_math", x: 1340, y: 520, params: { operation: "multiply_add", value2: 2, value3: -1 } },
      { id: "te_db_sep", typeId: "converter_separate_color", x: 1080, y: 420, params: {} },
      { id: "te_db_dispmap_img", typeId: "texture_image", x: 820, y: 420, params: {} },
    ],
    links: [
      { id: "te_db_l1", fromNode: "te_db_principled", fromSocket: "bsdf", toNode: "te_db_out", toSocket: "surface" },
      { id: "te_db_l2", fromNode: "te_db_normalmap", fromSocket: "normal", toNode: "te_db_principled", toSocket: "normal" },
      { id: "te_db_l3", fromNode: "te_db_normalmap_img", fromSocket: "color", toNode: "te_db_normalmap", toSocket: "color" },
      { id: "te_db_l4", fromNode: "te_db_uv", fromSocket: "uv", toNode: "te_db_normalmap_img", toSocket: "vector" },
      { id: "te_db_l5", fromNode: "te_db_vecdisp", fromSocket: "displacement", toNode: "te_db_out", toSocket: "displacement" },
      { id: "te_db_l6", fromNode: "te_db_combine", fromSocket: "vector", toNode: "te_db_vecdisp", toSocket: "vector" },
      { id: "te_db_l7", fromNode: "te_db_mathX", fromSocket: "value", toNode: "te_db_combine", toSocket: "x" },
      { id: "te_db_l8", fromNode: "te_db_mathY", fromSocket: "value", toNode: "te_db_combine", toSocket: "y" },
      { id: "te_db_l9", fromNode: "te_db_mathZ", fromSocket: "value", toNode: "te_db_combine", toSocket: "z" },
      { id: "te_db_l10", fromNode: "te_db_sep", fromSocket: "r", toNode: "te_db_mathX", toSocket: "value1" },
      { id: "te_db_l11", fromNode: "te_db_sep", fromSocket: "g", toNode: "te_db_mathY", toSocket: "value1" },
      { id: "te_db_l12", fromNode: "te_db_sep", fromSocket: "b", toNode: "te_db_mathZ", toSocket: "value1" },
      { id: "te_db_l13", fromNode: "te_db_dispmap_img", fromSocket: "color", toNode: "te_db_sep", toSocket: "color" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 UV 貼圖節點指定座標，讀取法線貼圖", en: "Step 1: Use UV Map to Set Coordinates and Read a Normal Map" },
      instruction: {
        zh: "加入 UV 貼圖（UV Map，輸入 Input 分類）。本沙盒的預覽物件只有一組 UV，效果跟紋理座標（Texture Coordinate）的 UV 一樣，但當一個模型有多組 UV 時，就是靠這個節點指定要用哪一組。\n\n加入圖像紋理（Image Texture），把 UV 貼圖接到它的向量（Vector）輸入。\n\n點圖像紋理節點上的「選擇圖片」，上傳一張法線貼圖（通常是偏紫藍色的圖）——如果手邊沒有，先跳過，之後可以用任何一張圖片測試接線流程。",
        en: "Add a UV Map node (Input category). This sandbox's preview meshes only have one UV set, so it behaves like Texture Coordinate's UV — but on a model with multiple UV sets, this node picks which one to use.\n\nAdd an Image Texture and connect UV Map to its Vector input.\n\nClick 'Choose Image' on the Image Texture node and upload a normal map (usually a purple-blue image) — if you don't have one handy, skip this for now; any image works to test the wiring.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_uv_map", "uv", "texture_image", "vector"),
    },
    {
      title: { zh: "第二步：用法線貼圖節點解出光影方向", en: "Step 2: Decode Shading Direction with Normal Map" },
      instruction: {
        zh: "加入法線貼圖（Normal Map）節點，把圖像紋理的顏色（Color）輸出接到它的顏色輸入。\n\n加入原理化 BSDF（Principled BSDF），把法線貼圖的法線（Normal）輸出接到它的法線輸入。\n\n這樣圖片上編碼的方向資訊，就會變成表面真正的光影凹凸細節——只影響光影，不會改變輪廓。",
        en: "Add a Normal Map node and connect Image Texture's Color output to its color input.\n\nAdd a Principled BSDF and connect Normal Map's Normal output to its normal input.\n\nThe direction encoded in the image now drives real shading detail on the surface — affecting only lighting, not the silhouette.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_image", "color", "vector_normal_map", "color") &&
        hasLinkBetweenTypes(graph, "vector_normal_map", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第三步：讀取第二張貼圖，準備解碼向量位移方向", en: "Step 3: Read a Second Map to Decode a Displacement Direction" },
      instruction: {
        zh: "再加入一個圖像紋理（Image Texture，這是新的一個，跟法線貼圖用的不是同一個）——一樣可以上傳任何圖片先測試接線。\n\n⚠️ 這一個先不要接 UV 貼圖：向量位移最後會即時改變頂點位置（在「頂點著色器」裡運算），但 UV 貼圖節點在本沙盒只能在「畫面著色器」用，兩者不相容。向量輸入留空不接，會自動改用相容的內建 UV 座標，效果一樣。\n\n加入分離顏色（Separate Color），把這張圖的顏色輸出接到它的顏色輸入，拆成 R、G、B 三個獨立數值。\n\n向量位移貼圖把方向存成顏色：因為顏色只能存 0 到 1，但方向需要 -1 到 1，所以貼圖裡的顏色其實是「真正方向」平移縮放過的結果——下一步要把它解碼回來。",
        en: "Add another Image Texture (a new one, separate from the Normal Map's) — any image works to test the wiring for now.\n\n⚠️ Don't connect UV Map to this one: Vector Displacement actually moves vertices in real time (computed in the 'vertex shader'), but the UV Map node in this sandbox only works in the 'surface shader' stage — the two are incompatible. Leaving Vector unconnected automatically falls back to a compatible built-in UV coordinate, with the same effect.\n\nAdd a Separate Color node and connect this new image's color output to it, splitting it into independent R, G, B values.\n\nVector displacement maps store direction as color: since color only holds 0 to 1 but direction needs -1 to 1, the stored colors are really the true direction rescaled — the next step decodes it back.",
      },
      check: (graph) => {
        const imgs = findNodesOfType(graph, "texture_image");
        return imgs.length >= 2 && hasLinkBetweenTypes(graph, "texture_image", "color", "converter_separate_color", "color");
      },
    },
    {
      title: { zh: "第四步：解碼方向、驅動真正的向量位移", en: "Step 4: Decode the Direction and Drive Real Vector Displacement" },
      instruction: {
        zh: "加入 3 個數學（Math）節點，運算都選乘加（Multiply Add），第二個數值填 2、第三個數值填 -1（也就是「原始值 × 2 － 1」，把 0-1 換算回 -1 到 1）。\n\n把分離顏色的 R、G、B 分別接到這 3 個數學節點的第一個數值。\n\n加入合併 XYZ（Combine XYZ），把 3 個數學節點的結果分別接到 X、Y、Z。\n\n加入向量位移（Vector Displacement），把合併 XYZ 的結果接到它的向量輸入，輸出接到材質輸出的位移（Displacement）插槽。\n\n這樣貼圖裡編碼的每一個方向，就會變成頂點真正往那個方向移動的位移——跟法線貼圖不同，這次輪廓會真的改變。",
        en: "Add 3 Math nodes, all set to Multiply Add, with the second value 2 and the third value -1 (i.e. 'raw value × 2 − 1', converting 0-1 back to -1 to 1).\n\nConnect Separate Color's R, G, B to these 3 Math nodes' first value respectively.\n\nAdd a Combine XYZ and connect the 3 Math nodes' results to X, Y, Z.\n\nAdd a Vector Displacement node, connect Combine XYZ's result to its vector input, and its output to the material output's Displacement socket.\n\nEvery direction encoded in the map now becomes real vertex movement in that direction — unlike Normal Map, the silhouette actually changes this time.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_combine_xyz", "vector", "vector_displacement_vec", "vector") &&
        hasLinkBetweenTypes(graph, "vector_displacement_vec", "displacement", "output_material", "displacement"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "向量位移貼圖存進圖片時，每個色版（R/G/B）的值域是 0-1，但方向需要 -1 到 1；為什麼解碼時要用「乘加（Multiply Add）：×2、－1」這個特定公式，而不是別的算法？",
        en: "A vector displacement map stores each channel (R/G/B) in the 0-1 range, but direction needs -1 to 1. Why does decoding use the specific formula 'Multiply Add: ×2, −1' rather than some other calculation?",
      },
      options: [
        {
          zh: "×2 把 0-1 的範圍拉寬成 0-2，再 －1 把整段平移，讓 0 對應到 -1、0.5 對應到 0、1 對應到 1，剛好覆蓋 -1 到 1",
          en: "×2 stretches the 0-1 range to 0-2, then −1 shifts it down so 0 maps to -1, 0.5 maps to 0, and 1 maps to 1 — exactly covering -1 to 1",
        },
        { zh: "這只是慣例寫法，換成 +1、÷2 效果完全一樣", en: "It's just convention — using +1 then ÷2 instead would give the exact same result" },
        { zh: "因為向量位移節點的輸入插槽規定只能接乘加運算的結果", en: "Because the Vector Displacement node's input socket only accepts the result of a Multiply Add operation" },
        { zh: "×2 跟 －1 只對顏色資料有效，跟數值範圍轉換無關", en: "×2 and −1 only work on color data and have nothing to do with numeric range conversion" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "這是把「儲存範圍」換算回「實際意義範圍」的標準公式：原始值域 0-1，先乘 2 變成 0-2，再減 1 讓整段往負方向平移 1，得到 -1 到 1——中點 0.5 剛好對應到 0（沒有位移），這樣色版裡「中灰」代表「不動」，偏亮/偏暗才代表往正/負方向位移，是貼圖界儲存方向性資料的通用手法，不是這個節點專屬的規定。",
        en: "This is the standard formula for converting a storage range back to its real meaning: the raw 0-1 range gets doubled to 0-2, then shifted down by 1 to land on -1 to 1 — with the midpoint 0.5 mapping exactly to 0 (no displacement). That means mid-gray in the channel represents 'no movement', while brighter/darker represents positive/negative displacement — a general technique for storing directional data in textures, not something specific to this one node.",
      },
    },
  ],
};
