import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_displacement_terrain",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "真正的位移：凹凸地形", en: "True Displacement: Bumpy Terrain" },
  description: {
    zh: "凹凸（Bump）只是假的光影，位移（Displacement）會真的把頂點往外推。用沃羅諾伊紋理（Voronoi Texture）驅動位移節點，做出真的凹凸不平、輪廓也會改變的地形表面。",
    en: "Bump only fakes the lighting — Displacement actually pushes vertices outward. Drive a Displacement node with Voronoi Texture to create a surface whose silhouette genuinely bumps and warps.",
  },
  startGraph: {
    nodes: [
      { id: "t_dt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_dt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
    ],
    links: [{ id: "t_dt_l1", fromNode: "t_dt_principled", fromSocket: "bsdf", toNode: "t_dt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_dt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_dt_principled", typeId: "shader_principled_bsdf", x: 820, y: 60, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
      { id: "te_dt_disp", typeId: "vector_displacement", x: 560, y: 260, params: { midlevel: 0.5, scale: 0.15 } },
      { id: "te_dt_voronoi", typeId: "texture_voronoi", x: 320, y: 260, params: { scale: 4 } },
    ],
    links: [
      { id: "te_dt_l1", fromNode: "te_dt_principled", fromSocket: "bsdf", toNode: "te_dt_out", toSocket: "surface" },
      { id: "te_dt_l2", fromNode: "te_dt_disp", fromSocket: "displacement", toNode: "te_dt_out", toSocket: "displacement" },
      { id: "te_dt_l3", fromNode: "te_dt_voronoi", fromSocket: "distance", toNode: "te_dt_disp", toSocket: "height" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Voronoi Texture", en: "Step 1: Add a Voronoi Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入沃羅諾伊紋理（Voronoi Texture），等一下用它的細胞邊界圖案當作凹凸的高度來源。",
        en: "Drag in a Voronoi Texture from the Texture category — we'll use its cell-boundary pattern as the height source for the bumps.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_voronoi"),
    },
    {
      title: { zh: "第二步：加入 Displacement，接上高度", en: "Step 2: Add Displacement and Feed Height" },
      instruction: {
        zh: "從「向量 Vector」分類拖入位移（Displacement）節點，把沃羅諾伊紋理（Voronoi）的距離（Distance）輸出接到它的高度（Height）輸入。",
        en: "Drag in a Displacement node from the Vector category, and connect Voronoi's Distance output to its Height input.",
      },
      check: (graph) => hasNodeOfType(graph, "vector_displacement") && hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "vector_displacement", "height"),
    },
    {
      title: { zh: "第三步：接到 Material Output 的 Displacement", en: "Step 3: Connect to Material Output's Displacement" },
      instruction: {
        zh: "把位移（Displacement）節點的輸出接到材質輸出（Material Output）的位移（Displacement）插槽（注意不是表面 Surface）。\n\n這條插槽是在頂點著色器裡運算的，能接的節點種類比表面少——如果接了不支援的節點會有清楚的錯誤訊息。",
        en: "Connect the Displacement node's output to Material Output's Displacement socket (not Surface).\n\nThis socket runs in the vertex shader, so it accepts fewer node types than Surface — wiring in an unsupported node produces a clear error message.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_displacement", "displacement", "output_material", "displacement"),
    },
    {
      title: { zh: "第四步：調大 Scale 讓位移更明顯", en: "Step 4: Raise Scale for a More Obvious Bump" },
      instruction: {
        zh: "把位移（Displacement）節點的縮放（Scale）調到 0.1 以上。旋轉一下預覽球體，應該能看到輪廓本身真的凹凸不平，不是只有光影假象。\n\n這是它跟凹凸（Bump）節點最根本的差異。",
        en: "Raise the Displacement node's Scale above 0.1. Orbit the preview sphere and you should see the silhouette itself genuinely bumping in and out, not just faked shading.\n\nThe fundamental difference from the Bump node.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_displacement", "scale", (v) => typeof v === "number" && v >= 0.1),
    },
  ],
};
