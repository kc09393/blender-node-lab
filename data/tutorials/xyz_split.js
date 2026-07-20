import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_xyz_split",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "分離/合併 XYZ：只拉伸單一軸", en: "Separate/Combine XYZ: Stretch Just One Axis" },
  description: {
    zh: "用分離 XYZ（Separate XYZ）把座標拆成三個獨立數值、只對其中一軸做運算，再用合併 XYZ（Combine XYZ）接回去——這是「只想調整某一個方向」時的標準做法。",
    en: "Use Separate XYZ to split a coordinate into three independent values, operate on just one axis, then rejoin with Combine XYZ — the standard pattern when you only want to adjust one direction.",
  },
  startGraph: {
    nodes: [
      { id: "t_xyz_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_xyz_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_xyz_l1", fromNode: "t_xyz_principled", fromSocket: "bsdf", toNode: "t_xyz_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_xyz_out", typeId: "output_material", x: 1500, y: 200, params: {} },
      { id: "te_xyz_principled", typeId: "shader_principled_bsdf", x: 1220, y: 100, params: {} },
      { id: "te_xyz_checker", typeId: "texture_checker", x: 980, y: 100, params: { scale: 8 } },
      { id: "te_xyz_combine", typeId: "converter_combine_xyz", x: 740, y: 100, params: {} },
      { id: "te_xyz_math", typeId: "converter_math", x: 500, y: 60, params: { operation: "multiply", value2: 3 } },
      { id: "te_xyz_separate", typeId: "converter_separate_xyz", x: 260, y: 100, params: {} },
      { id: "te_xyz_texcoord", typeId: "input_texture_coordinate", x: 20, y: 100, params: {} },
    ],
    links: [
      { id: "te_xyz_l1", fromNode: "te_xyz_principled", fromSocket: "bsdf", toNode: "te_xyz_out", toSocket: "surface" },
      { id: "te_xyz_l2", fromNode: "te_xyz_checker", fromSocket: "color", toNode: "te_xyz_principled", toSocket: "baseColor" },
      { id: "te_xyz_l3", fromNode: "te_xyz_combine", fromSocket: "vector", toNode: "te_xyz_checker", toSocket: "vector" },
      { id: "te_xyz_l4", fromNode: "te_xyz_math", fromSocket: "value", toNode: "te_xyz_combine", toSocket: "y" },
      { id: "te_xyz_l5", fromNode: "te_xyz_separate", fromSocket: "y", toNode: "te_xyz_math", toSocket: "value1" },
      { id: "te_xyz_l6", fromNode: "te_xyz_separate", fromSocket: "x", toNode: "te_xyz_combine", toSocket: "x" },
      { id: "te_xyz_l7", fromNode: "te_xyz_texcoord", fromSocket: "generated", toNode: "te_xyz_separate", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入紋理座標與分離 XYZ", en: "Step 1: Add Texture Coordinate and Separate XYZ" },
      instruction: {
        zh: "從「輸入 Input」分類拖入紋理座標（Texture Coordinate），從「轉換器 Converter」分類拖入分離 XYZ（Separate XYZ），把紋理座標的 Generated 輸出接到分離 XYZ 的向量（Vector）輸入。",
        en: "Drag in a Texture Coordinate (Input category) and a Separate XYZ (Converter category), then connect Texture Coordinate's Generated output to Separate XYZ's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "converter_separate_xyz", "vector"),
    },
    {
      title: { zh: "第二步：用 Math 把 Y 分量放大", en: "Step 2: Scale Up the Y Component with Math" },
      instruction: {
        zh: "加入一個數學（Math）節點，運算選相乘（Multiply），把分離 XYZ 的 y 輸出接到它的第一個數值，第二個數值設成 3。",
        en: "Add a Math node, set its operation to Multiply, connect Separate XYZ's y output to its first value, and set the second value to 3.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_separate_xyz", "y", "converter_math", "value1"),
    },
    {
      title: { zh: "第三步：用合併 XYZ 接回去", en: "Step 3: Rejoin with Combine XYZ" },
      instruction: {
        zh: "加入合併 XYZ（Combine XYZ），把分離 XYZ 的 x 輸出接到它的 x，把剛剛數學節點的結果接到它的 y。\n\n這樣就做出「x 不變、y 放大 3 倍」的座標。",
        en: "Add a Combine XYZ, connect Separate XYZ's x output to its x, and the Math node's result to its y.\n\nThis produces a coordinate where x is unchanged but y is scaled 3x.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_separate_xyz", "x", "converter_combine_xyz", "x") &&
        hasLinkBetweenTypes(graph, "converter_math", "value", "converter_combine_xyz", "y"),
    },
    {
      title: { zh: "第四步：接到棋盤格紋理看效果", en: "Step 4: Feed a Checker Texture to See the Effect" },
      instruction: {
        zh: "加入棋盤格紋理（Checker Texture），把合併 XYZ 的向量（Vector）輸出接到它的向量輸入，再接到原理化 BSDF（Principled BSDF）的底色（Base Color）。\n\n格紋應該會在 Y 方向被拉長成長方形，而不是正方形——證明只有 Y 軸被放大了。",
        en: "Add a Checker Texture, connect Combine XYZ's Vector output to its Vector input, then feed it to Principled BSDF's Base Color.\n\nThe checker cells should stretch into rectangles along Y, not squares — proof that only the Y axis was scaled.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_combine_xyz", "vector", "texture_checker", "vector") &&
        hasLinkBetweenTypes(graph, "texture_checker", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "只想拉伸座標的其中一個軸（例如只放大 X 方向的貼圖密度），標準做法是？",
        en: "To stretch just one coordinate axis (e.g. only scaling texture density along X), what's the standard approach?",
      },
      options: [
        { zh: "直接調整整個向量的 Scale，三軸一起變", en: "Just adjust the whole vector's Scale, changing all three axes together" },
        { zh: "用分離 XYZ 拆開、只對該軸的數值運算，再用合併 XYZ 接回去", en: "Split with Separate XYZ, operate on just that axis, then rejoin with Combine XYZ" },
        { zh: "只能用向量旋轉（Vector Rotate）", en: "Only Vector Rotate can do this" },
        { zh: "沒有標準做法，只能手動輸入整組座標", en: "There's no standard approach — you have to hand-enter the whole coordinate" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Mapping 節點的 Scale 是三軸一起等比例縮放，沒辦法只動一軸；用分離 XYZ 把座標拆成三個獨立的數值，只對想調整的那個軸做 Math 運算，再用合併 XYZ 接回去，才是「只想調整某一個方向」的標準做法。",
        en: "Mapping's Scale scales all three axes together proportionally, with no way to isolate one. Splitting the coordinate with Separate XYZ, running a Math operation on just the axis you want, then rejoining with Combine XYZ is the standard pattern for adjusting a single direction only.",
      },
    },
  ],
};
