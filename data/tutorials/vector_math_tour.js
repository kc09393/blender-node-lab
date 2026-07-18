import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_vector_math_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "認識向量數學：長度、正規化、外積", en: "Get to Know Vector Math: Length, Normalize, Cross Product" },
  description: {
    zh: "向量數學（Vector Math）的內積（Dot Product）已經在「羅盤材質」教學教過；這篇換個角度，帶你認識幾何（Geometry）分類的長度（Length）、正規化（Normalize），還有外積（Cross Product）——用長度做出一個以物體中心為圓心的放射狀漸層，直接看到效果。",
    en: "Vector Math's Dot Product is already covered in the 'Compass Material' tutorial. This one takes a different angle, covering the Geometry category's Length and Normalize, plus Cross Product — using Length to build a radial gradient centered on the object, so you see the effect directly.",
  },
  startGraph: {
    nodes: [
      { id: "t_vmt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_vmt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
    ],
    links: [{ id: "t_vmt_l1", fromNode: "t_vmt_principled", fromSocket: "bsdf", toNode: "t_vmt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vmt_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_vmt_principled", typeId: "shader_principled_bsdf", x: 1000, y: 100, params: {} },
      { id: "te_vmt_ramp", typeId: "converter_color_ramp", x: 740, y: 100, params: {} },
      { id: "te_vmt_vecmath", typeId: "vector_math", x: 480, y: 100, params: { operation: "cross", vector2: [0, 1, 0] } },
      { id: "te_vmt_texcoord", typeId: "input_texture_coordinate", x: 220, y: 100, params: {} },
    ],
    links: [
      { id: "te_vmt_l1", fromNode: "te_vmt_principled", fromSocket: "bsdf", toNode: "te_vmt_out", toSocket: "surface" },
      { id: "te_vmt_l2", fromNode: "te_vmt_ramp", fromSocket: "color", toNode: "te_vmt_principled", toSocket: "baseColor" },
      { id: "te_vmt_l3", fromNode: "te_vmt_vecmath", fromSocket: "value", toNode: "te_vmt_ramp", toSocket: "fac" },
      { id: "te_vmt_l4", fromNode: "te_vmt_texcoord", fromSocket: "object", toNode: "te_vmt_vecmath", toSocket: "vector1" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 Length 算出離中心的距離", en: "Step 1: Use Length to Measure Distance from Center" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）、向量數學（Vector Math）、顏色漸變（Color Ramp）。把紋理座標的 Object 輸出接到向量數學的第一個向量，運算選長度（Length，幾何 Geometry 分類），再把它的數值（Value）輸出接到顏色漸變的係數（Fac），顏色漸變接到底色（Base Color）。Length 算出每個點離物體中心有多遠，畫面會出現以中心為圓心的放射狀漸層。",
        en: "Add a Texture Coordinate, a Vector Math, and a Color Ramp. Connect Texture Coordinate's Object output to Vector Math's first vector, set the operation to Length (Geometry category), and connect its Value output to Color Ramp's Fac, then Color Ramp to Base Color. Length measures how far each point is from the object's center, producing a radial gradient centered on the object.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "object", "vector_math", "vector1") &&
        hasLinkBetweenTypes(graph, "vector_math", "value", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "vector_math", "operation", (v) => v === "length"),
    },
    {
      title: { zh: "第二步：切到「正規化」看方向不變、長度歸一", en: "Step 2: Switch to Normalize" },
      instruction: {
        zh: "把運算切換成正規化（Normalize）。Normalize 只保留方向，把向量長度統一縮放成 1——輸出的向量（Vector）欄位現在每個分量都在 -1 到 1 之間，常用來確保法線、方向向量的長度不會因為前面的運算意外跑掉。",
        en: "Switch the operation to Normalize. Normalize keeps only the direction, rescaling the vector's length to exactly 1 — the Vector output's components now stay within -1 to 1, commonly used to make sure normals or direction vectors don't accidentally drift in length after earlier math.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_math", "operation", (v) => v === "normalize"),
    },
    {
      title: { zh: "第三步：切到「縮放」用 Scale 插槽", en: "Step 3: Switch to Scale" },
      instruction: {
        zh: "把運算切換成縮放（Scale）。這個模式不吃第二個向量，改吃節點下方的縮放（Scale）數值插槽，把第一個向量整體放大或縮小——把 Scale 調到 2 以上，看看放射狀漸層的範圍怎麼變化。",
        en: "Switch the operation to Scale. This mode ignores the second vector and instead uses the Scale value input below, uniformly enlarging or shrinking the first vector — raise Scale above 2 and watch how the radial gradient's range changes.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_math", "operation", (v) => v === "scale"),
    },
    {
      title: { zh: "第四步：切到「外積」算出垂直向量", en: "Step 4: Switch to Cross Product" },
      instruction: {
        zh: "把運算切換成外積（Cross Product），並把第二個向量（Vector 2）手動改成 (0,1,0)。外積會用兩個向量算出「同時垂直於這兩者」的第三個向量。\n\n⚠️ 第二個向量預設是 (0,0,0)——外積跟一個零向量算出來永遠也是零向量，畫面會整片死黑，一定要手動填一個非零的方向才看得出效果。外積在做切線、副法線這類需要「找出垂直方向」的計算時很常用。",
        en: "Switch the operation to Cross Product, and manually set the second vector (Vector 2) to (0,1,0). Cross Product computes a third vector perpendicular to both inputs.\n\n⚠️ Vector 2 defaults to (0,0,0) — crossing anything with a zero vector always gives zero, so the result would look solid black. You must fill in a non-zero direction to see any effect. Cross Product is commonly used for tangent/bitangent calculations — anywhere you need to 'find the perpendicular direction'.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "vector_math", "operation", (v) => v === "cross") &&
        anyNodeParamMatches(graph, "vector_math", "vector2", (v) => Array.isArray(v) && v.some((c) => Math.abs(c) > 0.01)),
    },
  ],
  quiz: [
    {
      question: {
        zh: "向量數學的外積（Cross Product），如果 Vector 2 還停留在預設值 (0,0,0)，結果會是？",
        en: "In Vector Math's Cross Product, if Vector 2 is left at its default (0,0,0), what's the result?",
      },
      options: [
        { zh: "等於 Vector 1 本身", en: "Equal to Vector 1 itself" },
        { zh: "永遠是零向量 (0,0,0)", en: "Always the zero vector (0,0,0)" },
        { zh: "隨機值", en: "A random value" },
        { zh: "編譯錯誤", en: "A compile error" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "任何向量跟零向量做外積，結果恆等於零向量——這是這個節點最容易踩到的坑：忘記把 Vector 2 改成非零方向，畫面就會整片死黑。想找出兩個向量的垂直方向，兩個輸入都必須是非零向量。",
        en: "The cross product of any vector with the zero vector is always the zero vector — the classic trap with this node: forget to set Vector 2 to a non-zero direction, and the result renders solid black. Both inputs need to be non-zero to find a meaningful perpendicular direction.",
      },
    },
  ],
};
