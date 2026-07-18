import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_channel_packing",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "色彩通道打包：一張貼圖塞三個遮罩", en: "Channel Packing: Three Masks in One Texture" },
  description: {
    zh: "遊戲美術常把三個各自獨立的黑白遮罩（例如粗糙度、金屬度、AO）分別塞進一張貼圖的 R、G、B 三個色版，存成一張圖而不是三張，省空間也省讀取次數——這叫做「通道打包」。這篇教學用合併顏色（Combine Color）把三個不相關的紋理各自塞進一個顏色的 R/G/B，再用分離顏色（Separate Color）把它們各自拆回來、分別驅動材質的不同參數，示範打包前後資訊完全沒有遺失。",
    en: "Game art often packs three independent black/white masks (e.g. roughness, metallic, AO) into a single texture's R, G, B channels instead of three separate images — saving space and texture reads. This is called channel packing. This tutorial uses Combine Color to stuff three unrelated textures into one color's R/G/B, then Separate Color to pull them back apart and drive different material parameters — proving no information is lost in the round trip.",
  },
  startGraph: {
    nodes: [
      { id: "t_cpk_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cpk_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.6, 0.6, 0.65, 1] } },
    ],
    links: [{ id: "t_cpk_l1", fromNode: "t_cpk_principled", fromSocket: "bsdf", toNode: "t_cpk_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cpk_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_cpk_principled", typeId: "shader_principled_bsdf", x: 1400, y: 140, params: { baseColor: [0.6, 0.6, 0.65, 1] } },
      { id: "te_cpk_separate", typeId: "converter_separate_color", x: 1140, y: 140, params: {} },
      { id: "te_cpk_combine", typeId: "converter_combine_color", x: 880, y: 140, params: {} },
      { id: "te_cpk_voronoi", typeId: "texture_voronoi", x: 600, y: 20, params: { scale: 8 } },
      { id: "te_cpk_noise", typeId: "texture_noise", x: 600, y: 140, params: { scale: 4, detail: 3 } },
      { id: "te_cpk_checker", typeId: "texture_checker", x: 600, y: 260, params: { scale: 6 } },
    ],
    links: [
      { id: "te_cpk_l1", fromNode: "te_cpk_principled", fromSocket: "bsdf", toNode: "te_cpk_out", toSocket: "surface" },
      { id: "te_cpk_l2", fromNode: "te_cpk_separate", fromSocket: "r", toNode: "te_cpk_principled", toSocket: "roughness" },
      { id: "te_cpk_l3", fromNode: "te_cpk_separate", fromSocket: "g", toNode: "te_cpk_principled", toSocket: "metallic" },
      { id: "te_cpk_l4", fromNode: "te_cpk_combine", fromSocket: "color", toNode: "te_cpk_separate", toSocket: "color" },
      { id: "te_cpk_l5", fromNode: "te_cpk_voronoi", fromSocket: "distance", toNode: "te_cpk_combine", toSocket: "r" },
      { id: "te_cpk_l6", fromNode: "te_cpk_noise", fromSocket: "fac", toNode: "te_cpk_combine", toSocket: "g" },
      { id: "te_cpk_l7", fromNode: "te_cpk_checker", fromSocket: "fac", toNode: "te_cpk_combine", toSocket: "b" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：準備三個各自獨立的遮罩", en: "Step 1: Prepare Three Independent Masks" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture）、雜訊紋理（Noise Texture）、棋盤格紋理（Checker Texture）各一個。\n\n這三個節點完全不相關，之後會分別代表三種不同的遮罩用途（例如粗糙度、金屬度、AO）。\n\n先不用接到任何地方，下一步才會用到。",
        en: "Add one each of Voronoi Texture, Noise Texture, and Checker Texture.\n\nThese three nodes are completely unrelated — they'll each stand in for a different mask (e.g. roughness, metallic, AO).\n\nDon't connect them anywhere yet — the next step needs them.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "texture_voronoi") && hasNodeOfType(graph, "texture_noise") && hasNodeOfType(graph, "texture_checker"),
    },
    {
      title: { zh: "第二步：用合併顏色把三個遮罩塞進一個顏色", en: "Step 2: Pack the Three Masks with Combine Color" },
      instruction: {
        zh: "加入合併顏色（Combine Color）節點。\n\n把沃羅諾伊的距離（Distance）輸出，接到合併顏色的 R 輸入。\n\n把雜訊紋理的係數（Fac）輸出，接到 G 輸入。\n\n把棋盤格紋理的係數（Fac）輸出，接到 B 輸入。\n\n現在這一個顏色節點裡，同時裝著三個完全不相關的遮罩——這就是「通道打包」。",
        en: "Add a Combine Color node.\n\nConnect Voronoi's Distance output to Combine Color's R input.\n\nConnect Noise Texture's Fac output to G.\n\nConnect Checker Texture's Fac output to B.\n\nNow this single color node carries three completely unrelated masks at once — that's channel packing.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_combine_color", "r") &&
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_combine_color", "g") &&
        hasLinkBetweenTypes(graph, "texture_checker", "fac", "converter_combine_color", "b"),
    },
    {
      title: { zh: "第三步：用分離顏色把遮罩拆回來", en: "Step 3: Unpack with Separate Color" },
      instruction: {
        zh: "加入分離顏色（Separate Color）節點。\n\n把合併顏色的顏色（Color）輸出，接到分離顏色的顏色輸入。\n\n分離顏色會輸出 R、G、B、A 四個獨立數值——這正好是剛剛打包進去的沃羅諾伊、雜訊、棋盤格三個遮罩，一個都沒有混在一起或遺失。",
        en: "Add a Separate Color node.\n\nConnect Combine Color's Color output to Separate Color's color input.\n\nSeparate Color outputs four independent values, R/G/B/A — these are exactly the Voronoi, Noise, and Checker masks you packed in, none mixed together or lost.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_combine_color", "color", "converter_separate_color", "color"),
    },
    {
      title: { zh: "第四步：用拆出來的兩個通道各自驅動不同參數", en: "Step 4: Drive Different Parameters from Different Channels" },
      instruction: {
        zh: "把分離顏色的 R 輸出，接到原理化 BSDF 的粗糙度（Roughness）。\n\n把分離顏色的 G 輸出，接到原理化 BSDF 的金屬度（Metallic）。\n\n看看即時預覽：球體表面應該同時出現沃羅諾伊細胞形狀的粗糙度變化、跟雜訊形狀的金屬度變化，兩者互不干擾——證明打包、拆開的整個過程完全沒有把資訊搞混。",
        en: "Connect Separate Color's R output to Principled BSDF's Roughness.\n\nConnect Separate Color's G output to Principled BSDF's Metallic.\n\nCheck the live preview: the sphere should show both Voronoi-cell-shaped roughness variation and Noise-shaped metallic variation, independent of each other — proof that packing and unpacking didn't scramble anything.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_separate_color", "r", "shader_principled_bsdf", "roughness") &&
        hasLinkBetweenTypes(graph, "converter_separate_color", "g", "shader_principled_bsdf", "metallic"),
    },
  ],
};
