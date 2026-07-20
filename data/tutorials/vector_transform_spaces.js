import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_vector_transform_spaces",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "向量變換：認識座標空間", en: "Vector Transform: Understanding Coordinate Spaces" },
  description: {
    zh: "同一個方向在「物體」「世界」「攝影機」三種座標空間下的數值都不一樣。向量變換（Vector Transform）節點負責在它們之間換算——把世界座標下的「正上方」轉到攝影機座標，你會發現數值隨著鏡頭角度即時改變。",
    en: "The same direction has different numeric values in Object, World, and Camera coordinate spaces. Vector Transform converts between them — convert World-space 'straight up' into Camera space and watch the values change live as the camera orbits.",
  },
  startGraph: {
    nodes: [
      { id: "t_vt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vt_l1", fromNode: "t_vt_principled", fromSocket: "bsdf", toNode: "t_vt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.9 } },
      { id: "te_vt_transform", typeId: "vector_transform", x: 560, y: 100, params: { from: "world", to: "camera" } },
      { id: "te_vt_combine", typeId: "converter_combine_xyz", x: 320, y: 100, params: { x: 0, y: 1, z: 0 } },
    ],
    links: [
      { id: "te_vt_l1", fromNode: "te_vt_principled", fromSocket: "bsdf", toNode: "te_vt_out", toSocket: "surface" },
      { id: "te_vt_l2", fromNode: "te_vt_transform", fromSocket: "vector", toNode: "te_vt_principled", toSocket: "baseColor" },
      { id: "te_vt_l3", fromNode: "te_vt_combine", fromSocket: "vector", toNode: "te_vt_transform", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：合出一個世界方向", en: "Step 1: Combine a World-Space Direction" },
      instruction: {
        zh: "加入合併 XYZ（Combine XYZ），設成 (0, 1, 0)——代表世界座標系統下的「正上方」。",
        en: "Add a Combine XYZ set to (0, 1, 0) — representing 'straight up' in world-space coordinates.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_combine_xyz", "y", (v) => v === 1),
    },
    {
      title: { zh: "第二步：加入向量變換", en: "Step 2: Add a Vector Transform" },
      instruction: {
        zh: "從「向量 Vector」分類拖入向量變換（Vector Transform），把合併 XYZ 的向量（Vector）輸出接到它的向量輸入。",
        en: "Drag in a Vector Transform from the Vector category and connect Combine XYZ's Vector output to its Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_combine_xyz", "vector", "vector_transform", "vector"),
    },
    {
      title: { zh: "第三步：設定來源空間跟目標空間", en: "Step 3: Set the From and To Spaces" },
      instruction: {
        zh: "把向量變換的來源空間（From）設成世界（World）、目標空間（To）設成攝影機（Camera）。",
        en: "Set Vector Transform's From to World and To to Camera.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "vector_transform", "from", (v) => v === "world") &&
        anyNodeParamMatches(graph, "vector_transform", "to", (v) => v === "camera"),
    },
    {
      title: { zh: "第四步：接到底色看數值變化", en: "Step 4: Feed Base Color to See the Values Change" },
      instruction: {
        zh: "把向量變換的輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color），用顏色來視覺化這個向量。\n\n用滑鼠拖曳旋轉預覽球體——顏色應該會即時改變，因為「世界座標的正上方」換算到攝影機座標的數值，會隨著鏡頭角度而不同。",
        en: "Connect Vector Transform's output to Principled BSDF's Base Color to visualize the vector as a color.\n\nDrag to orbit the preview — the color should change live, since 'world-space up' converted into camera space depends on the camera's current angle.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_transform", "vector", "shader_principled_bsdf", "baseColor"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "同一個方向向量（例如「正上方」），在物體、世界、攝影機三種座標空間下的數值？",
        en: "Take the same direction vector (e.g. 'straight up'). Across Object, World, and Camera coordinate spaces, its numeric values are...",
      },
      options: [
        { zh: "完全一樣，座標空間只是概念，不影響實際數值", en: "Identical — coordinate space is just a concept, it doesn't affect the actual numbers" },
        { zh: "通常不一樣，攝影機空間的數值還會隨鏡頭角度即時改變", en: "Usually different, and the camera-space value even changes live as the camera orbits" },
        { zh: "只有物體座標會不一樣，世界跟攝影機一定相同", en: "Only Object space differs — World and Camera are always identical" },
        { zh: "只有顏色型別的向量才會受座標空間影響", en: "Only color-typed vectors are affected by coordinate space" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "座標空間是實際會改變數值的參考系——物體、世界、攝影機各自的軸向定義不同，同一個方向換算出來的數值通常不一樣，攝影機空間更是會隨著鏡頭角度即時變動，這正是 Vector Transform 節點存在的目的：在這些空間之間正確換算。",
        en: "Coordinate spaces are reference frames that genuinely change the numbers — Object, World, and Camera each define their axes differently, so the same direction usually converts to different values, and camera space keeps changing live as the camera orbits. That's exactly why Vector Transform exists: to correctly convert between them.",
      },
    },
  ],
};
