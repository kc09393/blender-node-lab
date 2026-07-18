import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_uv_mapping",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "座標與 Mapping 入門", en: "Coordinates & Mapping Basics" },
  description: {
    zh: "用棋盤格紋理認識 UV 座標，學會用紋理座標（Texture Coordinate）跟映射（Mapping）節點控制貼圖怎麼貼、貼幾次、貼在哪裡。",
    en: "Use a checker pattern to understand UV coordinates, and learn to control how a texture wraps, tiles, and positions using Texture Coordinate and Mapping.",
  },
  startGraph: {
    nodes: [
      { id: "t_uv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_uv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_uv_l1", fromNode: "t_uv_principled", fromSocket: "bsdf", toNode: "t_uv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_uv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_uv_principled", typeId: "shader_principled_bsdf", x: 660, y: 100, params: {} },
      { id: "te_uv_checker", typeId: "texture_checker", x: 440, y: 100, params: {} },
      { id: "te_uv_mapping", typeId: "vector_mapping", x: 220, y: 100, params: { scale: [4, 4, 4], location: [0.3, 0, 0] } },
      { id: "te_uv_texcoord", typeId: "input_texture_coordinate", x: 0, y: 100, params: {} },
    ],
    links: [
      { id: "te_uv_l1", fromNode: "te_uv_principled", fromSocket: "bsdf", toNode: "te_uv_out", toSocket: "surface" },
      { id: "te_uv_l2", fromNode: "te_uv_checker", fromSocket: "color", toNode: "te_uv_principled", toSocket: "baseColor" },
      { id: "te_uv_l3", fromNode: "te_uv_mapping", fromSocket: "vector", toNode: "te_uv_checker", toSocket: "vector" },
      { id: "te_uv_l4", fromNode: "te_uv_texcoord", fromSocket: "generated", toNode: "te_uv_mapping", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Checker Texture", en: "Step 1: Add a Checker Texture" },
      instruction: {
        zh: "從「紋理」分類拖入棋盤格紋理（Checker Texture），把它的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color）。這時候貼圖預設用物體的 UV，還沒有經過任何座標調整。",
        en: "Drag in a Checker Texture from the Texture category and connect its Color output to Principled BSDF's Base Color. Right now it defaults to the object's UV, with no coordinate adjustment yet.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：接上 Texture Coordinate", en: "Step 2: Wire Up Texture Coordinate" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入分類），把它的 Generated 輸出接到棋盤格紋理（Checker Texture）的向量（Vector）輸入。Generated 座標會跟著物體形狀走，即使物體移動旋轉，花紋也不會跑掉——這是它跟 UV 最大的差異。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Checker Texture's Vector input. Generated coordinates follow the object's shape — even if the object moves or rotates, the pattern won't shift. That's its key difference from UV.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_checker", "vector"),
    },
    {
      title: { zh: "第三步：加入 Mapping 調整密度", en: "Step 3: Add Mapping to Control Density" },
      instruction: {
        zh: "在紋理座標（Texture Coordinate）跟棋盤格紋理（Checker Texture）中間插入一個映射（Mapping）節點，把縮放（Scale）的三個軸都調到 3 以上——格紋應該會變得更密集。縮放越大，代表同樣的貼圖在同一塊表面上重複越多次。",
        en: "Insert a Mapping node between Texture Coordinate and Checker Texture, and set all three Scale axes to 3 or higher — the checker pattern should get noticeably denser. Higher Scale means the texture repeats more times across the same surface.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "vector_mapping", "vector") &&
        hasLinkBetweenTypes(graph, "vector_mapping", "vector", "texture_checker", "vector") &&
        anyNodeParamMatches(graph, "vector_mapping", "scale", (v) => Array.isArray(v) && v.some((c) => c >= 3)),
    },
    {
      title: { zh: "第四步：用 Location 平移貼圖", en: "Step 4: Shift the Texture with Location" },
      instruction: {
        zh: "把映射（Mapping）節點的位置（Location）X 調成不是 0 的數值（例如 0.3），花紋應該會整個平移。位置用來微調貼圖的起始位置，常用在需要對齊貼圖細節的時候。",
        en: "Change Mapping's Location X to a non-zero value (e.g. 0.3) — the whole pattern should shift over. Location fine-tunes where the texture starts, often used when you need to align texture details precisely.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_mapping", "location", (v) => Array.isArray(v) && Math.abs(v[0]) > 0.01),
    },
  ],
  quiz: [
    {
      question: {
        zh: "把映射（Mapping）節點的 Scale 調高，棋盤格圖案看起來會怎麼變化？",
        en: "If you raise Mapping's Scale, how does the checker pattern change?",
      },
      options: [
        { zh: "圖案變大、重複次數變少", en: "The pattern gets bigger, repeating fewer times" },
        { zh: "圖案變小、重複次數變多", en: "The pattern gets smaller, repeating more times" },
        { zh: "完全不影響圖案大小，只影響顏色", en: "No effect on pattern size — only affects color" },
        { zh: "圖案會旋轉", en: "The pattern rotates" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Scale 是直接乘上座標數值——數值越大，代表在同樣的物體表面範圍內，紋理被要求以更密集的頻率取樣，圖案因此看起來更小、重複貼上的次數更多。",
        en: "Scale directly multiplies the coordinate values — a larger value means the texture is sampled at a denser frequency across the same surface area, so the pattern appears smaller and tiles more times.",
      },
    },
  ],
};
