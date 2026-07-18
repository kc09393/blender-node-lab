import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_image_texture_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識圖像紋理：貼上你自己的圖片", en: "Get to Know Image Texture: Using Your Own Image" },
  description: {
    zh: "圖像紋理（Image Texture）是最常用的紋理節點——直接讀取你上傳的照片或素材圖當材質。這篇帶你認識三個關鍵設定：延展模式（Extension）、插值（Interpolation）、色彩空間（Color Space），尤其色彩空間選錯會讓法線貼圖、粗糙度圖整個跑掉，是很多初學者會踩的坑。",
    en: "Image Texture is the most-used texture node — it reads an uploaded photo or texture map directly. This tutorial covers three key settings: Extension, Interpolation, and Color Space. Getting Color Space wrong especially can throw off normal maps and roughness maps entirely — a common beginner trap.",
  },
  startGraph: {
    nodes: [
      { id: "t_itt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_itt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_itt_l1", fromNode: "t_itt_principled", fromSocket: "bsdf", toNode: "t_itt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_itt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_itt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_itt_img",
        typeId: "texture_image",
        x: 300,
        y: 100,
        params: { extension: "mirror", interpolation: "closest", colorSpace: "srgb" },
      },
      { id: "te_itt_mapping", typeId: "vector_mapping", x: 60, y: 100, params: { scale: [3, 3, 3] } },
    ],
    links: [
      { id: "te_itt_l1", fromNode: "te_itt_principled", fromSocket: "bsdf", toNode: "te_itt_out", toSocket: "surface" },
      { id: "te_itt_l2", fromNode: "te_itt_img", fromSocket: "color", toNode: "te_itt_principled", toSocket: "baseColor" },
      { id: "te_itt_l3", fromNode: "te_itt_mapping", fromSocket: "vector", toNode: "te_itt_img", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：上傳一張圖片", en: "Step 1: Upload an Image" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入圖像紋理（Image Texture），點節點上的「選擇圖片」上傳任何一張照片或素材圖，再把它的顏色（Color）輸出接到原理化 BSDF 的底色（Base Color）。",
        en: "Drag in an Image Texture from the Texture category, click 'Choose Image' on the node to upload any photo or texture map, then connect its Color output to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_image", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：接上 Mapping 放大貼圖", en: "Step 2: Wire In Mapping to Zoom" },
      instruction: {
        zh: "加入映射（Mapping，向量 Vector 分類），把它接在圖像紋理的向量（Vector）輸入前面，把縮放（Scale）的三個軸都調到 3 以上。貼圖會重複貼好幾次——這是為下一步的延展模式（Extension）鋪路。",
        en: "Add a Mapping node (Vector category), wire it into Image Texture's Vector input, and raise Scale's three axes above 3. The image now repeats several times — this sets up the next step's Extension demo.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "vector_mapping", "vector", "texture_image", "vector") &&
        anyNodeParamMatches(graph, "vector_mapping", "scale", (v) => Array.isArray(v) && v.some((c) => c >= 3)),
    },
    {
      title: { zh: "第三步：切換延展模式看邊界怎麼接", en: "Step 3: Switch Extension to See How Edges Join" },
      instruction: {
        zh: "把延展模式（Extension）切換成鏡像（Mirror）。跟預設的重複（Repeat）比起來，Mirror 每次重複都會左右/上下翻轉一次，圖片邊界會無縫接起來，適合用在不想看到明顯重複接縫的場合。",
        en: "Switch Extension to Mirror. Unlike the default Repeat, Mirror flips the image each time it repeats, so the seams line up smoothly — useful when you don't want an obvious repeating edge.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_image", "extension", (v) => v === "mirror"),
    },
    {
      title: { zh: "第四步：切換插值看像素感", en: "Step 4: Switch Interpolation for a Pixelated Look" },
      instruction: {
        zh: "把插值（Interpolation）切換成最近（Closest）。預設的線性（Linear）會把相鄰像素的顏色平滑混合；Closest 直接取最近的那個像素，放大後會看到清楚的方塊邊界，適合像素風格素材或需要保留銳利邊緣的資料圖。",
        en: "Switch Interpolation to Closest. The default Linear blends neighboring pixels smoothly; Closest just grabs the nearest pixel, showing hard square edges when zoomed in — good for pixel-art assets or data maps where you need to preserve sharp edges.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_image", "interpolation", (v) => v === "closest"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "圖像紋理讀取法線貼圖或粗糙度圖這種「資料貼圖」時，Color Space 該選哪一個？",
        en: "When Image Texture reads a data map like a normal map or roughness map, which Color Space should you pick?",
      },
      options: [
        { zh: "sRGB（預設）", en: "sRGB (the default)" },
        { zh: "Non-Color", en: "Non-Color" },
        { zh: "不重要，兩個效果一樣", en: "Doesn't matter — both look the same" },
        { zh: "只能選 sRGB，沒有其他選項", en: "sRGB is the only option available" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "sRGB 會對讀進來的數值做 gamma 解碼，這對「本來就是原始數值資料」的法線/粗糙度貼圖是錯的，會讓資料整個跑掉；只有真的代表視覺顏色的貼圖（例如 Base Color）才該用 sRGB，資料貼圖一律要選 Non-Color 原樣讀取。",
        en: "sRGB gamma-decodes the values it reads — wrong for data that's already raw numbers, like normal or roughness maps, and it throws the data off entirely. Only textures that represent actual visual color (like Base Color) should use sRGB; data maps should always use Non-Color to read values as-is.",
      },
    },
  ],
};
