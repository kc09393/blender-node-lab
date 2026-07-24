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
  loadSteps: () => import("./channel_packing.steps.js").then((m) => m.default),
};
