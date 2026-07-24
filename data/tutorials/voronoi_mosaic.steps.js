import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入沃羅諾伊紋理", en: "Step 1: Add a Voronoi Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入沃羅諾伊紋理（Voronoi Texture）。",
        en: "Drag in a Voronoi Texture from the Texture category.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_voronoi"),
    },
    {
      title: { zh: "第二步：接上座標", en: "Step 2: Wire Up Coordinates" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入 Input 分類），把它的 Generated 輸出接到沃羅諾伊紋理的向量（Vector）。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Voronoi Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_voronoi", "vector"),
    },
    {
      title: { zh: "第三步：接 Color 而不是 Distance", en: "Step 3: Use Color, Not Distance" },
      instruction: {
        zh: "這次把沃羅諾伊紋理的顏色（Color）輸出（不是距離 Distance）接到原理化 BSDF（Principled BSDF）的底色（Base Color）。\n\n每一格細胞現在應該各自是一個隨機的純色。",
        en: "This time connect Voronoi Texture's Color output (not Distance) to Principled BSDF's Base Color.\n\nEach cell should now be its own random solid color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_voronoi", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第四步：調高縮放做出更多小磁磚", en: "Step 4: Raise Scale for More, Smaller Tiles" },
      instruction: {
        zh: "把縮放（Scale）調到 8 以上，磁磚會變得更小更密集，更像真的馬賽克拼貼。",
        en: "Raise Scale above 8 — the tiles become smaller and denser, closer to a real mosaic.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "scale", (v) => v >= 8),
    },
  ],
};
