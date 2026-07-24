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
  loadSteps: () => import("./image_texture_tour.steps.js").then((m) => m.default),
};
