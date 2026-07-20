import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mapping_types_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "映射節點的 4 種 Type：Point、Vector、Texture、Normal", en: "Mapping's 4 Types: Point, Vector, Texture, Normal" },
  description: {
    zh: "映射（Mapping）節點的類型（Type）下拉選單有 4 種：Point、Texture、Vector、Normal，平常最容易被忽略。這篇專門示範這 4 種的實際差別——尤其 Point 跟 Vector 的差異只有一個：位置（Location）到底有沒有作用。",
    en: "Mapping's Type dropdown has 4 options — Point, Texture, Vector, Normal — that are easy to overlook. This tutorial specifically demonstrates what each one actually does, especially the one difference between Point and Vector: whether Location has any effect at all.",
  },
  startGraph: {
    nodes: [
      { id: "t_mtt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_mtt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
    ],
    links: [{ id: "t_mtt_l1", fromNode: "t_mtt_principled", fromSocket: "bsdf", toNode: "t_mtt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mtt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mtt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
      { id: "te_mtt_checker", typeId: "texture_checker", x: 540, y: 100, params: {} },
      { id: "te_mtt_mapping", typeId: "vector_mapping", x: 280, y: 100, params: { mappingType: "normal", location: [0.3, 0, 0], scale: [4, 4, 4] } },
      { id: "te_mtt_texcoord", typeId: "input_texture_coordinate", x: 20, y: 100, params: {} },
    ],
    links: [
      { id: "te_mtt_l1", fromNode: "te_mtt_principled", fromSocket: "bsdf", toNode: "te_mtt_out", toSocket: "surface" },
      { id: "te_mtt_l2", fromNode: "te_mtt_checker", fromSocket: "color", toNode: "te_mtt_principled", toSocket: "baseColor" },
      { id: "te_mtt_l3", fromNode: "te_mtt_mapping", fromSocket: "vector", toNode: "te_mtt_checker", toSocket: "vector" },
      { id: "te_mtt_l4", fromNode: "te_mtt_texcoord", fromSocket: "generated", toNode: "te_mtt_mapping", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接上 Checker Texture，用 Point 類型平移看效果", en: "Step 1: Wire Up Checker Texture, Shift It with Point Type" },
      instruction: {
        zh: "加入棋盤格紋理（Checker Texture）跟映射（Mapping），中間接紋理座標（Texture Coordinate）的 Generated 輸出。Mapping 預設就是點（Point）類型，把位置（Location）X 改成不是 0 的數值（例如 0.3），棋盤格會整個平移。\n\n這是 Point 類型最基本的用途。",
        en: "Add a Checker Texture and a Mapping node, feeding in Texture Coordinate's Generated output. Mapping defaults to Point type — set Location X to a non-zero value (e.g. 0.3) and the whole checker pattern shifts.\n\nThis is Point's most basic use.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "vector_mapping", "vector", "texture_checker", "vector") &&
        anyNodeParamMatches(graph, "vector_mapping", "location", (v) => Array.isArray(v) && Math.abs(v[0]) > 0.01),
    },
    {
      title: { zh: "第二步：切到 Vector 類型，位置突然失效", en: "Step 2: Switch to Vector Type — Location Stops Working" },
      instruction: {
        zh: "把類型（Type）切換成向量（Vector），位置（Location）保持不變。你會發現棋盤格「彈回」沒有平移的樣子。\n\nVector 類型故意忽略位置，因為方向（例如法線）不應該受位移影響，只有 Point（座標點）才需要位移。",
        en: "Switch Type to Vector, keeping Location unchanged. The checker pattern 'snaps back' to the unshifted look.\n\nVector type deliberately ignores Location, since a direction (like a normal) shouldn't be affected by translation; only Point (a coordinate) needs it.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_mapping", "mappingType", (v) => v === "vector"),
    },
    {
      title: { zh: "第三步：切到 Texture 類型，體驗反向映射", en: "Step 3: Switch to Texture Type for the Inverse Mapping" },
      instruction: {
        zh: "把類型切換成紋理（Texture）。\n\nTexture 類型是 Point 的「反向」版本——先減去位置、用反向旋轉、再除以縮放，效果跟 Point 相反（例如 Scale 調大時，Point 模式貼圖會變密，Texture 模式反而會變疏），適合需要把世界座標換算回貼圖座標的情境。",
        en: "Switch Type to Texture.\n\nTexture is Point's 'inverse' — it subtracts location, applies inverse rotation, then divides by scale, giving the opposite effect of Point (e.g. raising Scale makes Point mode tile denser, but Texture mode sparser) — useful when converting a world position back into texture space.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_mapping", "mappingType", (v) => v === "texture"),
    },
    {
      title: { zh: "第四步：切到 Normal 類型", en: "Step 4: Switch to Normal Type" },
      instruction: {
        zh: "把類型切換成法線（Normal）。\n\nNormal 類型除以縮放（而不是乘上）、旋轉後再正規化，是專門用來正確轉換法線方向的模式——法線在非等比例縮放下，必須用「反轉置矩陣」處理才不會歪掉，這就是為什麼它的公式跟其他 3 種都不一樣。",
        en: "Switch Type to Normal.\n\nNormal divides by scale (instead of multiplying), rotates, then normalizes — a mode specifically for correctly transforming normal directions, since normals under non-uniform scale need an inverse-transpose treatment to avoid skewing, which is why its formula differs from the other three.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_mapping", "mappingType", (v) => v === "normal"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "映射（Mapping）節點的 4 種 Type 裡，哪一種會完全忽略 Location（位置）參數？",
        en: "Which of Mapping's 4 Types completely ignores the Location parameter?",
      },
      options: [
        { zh: "Point", en: "Point" },
        { zh: "Texture", en: "Texture" },
        { zh: "Vector", en: "Vector" },
        { zh: "Normal", en: "Normal" },
      ],
      correctIndex: 2,
      explanation: {
        zh: "Point 類型的公式是「旋轉縮放後再加上 Location」；Vector 類型跟 Point 幾乎一樣，但刻意不加 Location（方向性資料如果加了位移就沒有意義了）。Texture／Normal 則是分別做反向變換／除以縮放，也都各自有 Location 的處理方式，只有 Vector 是完全不受 Location 影響的。",
        en: "Point's formula rotates and scales the input, then adds Location. Vector is almost identical to Point, but deliberately skips adding Location — offsetting a direction/vector quantity wouldn't make sense. Texture and Normal each handle Location differently (inverse transform / divide by scale respectively) — only Vector is completely unaffected by it.",
      },
    },
  ],
};
