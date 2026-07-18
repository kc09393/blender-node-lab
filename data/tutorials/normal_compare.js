import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_normal_compare",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "法線節點：手動方向比較", en: "Normal Node: Manual Direction Comparison" },
  description: {
    zh: "法線（Normal）節點讓你手動指定一個方向，再輸出它跟表面真正法線的夾角餘弦值（Dot）——可以做出「只有朝向某個方向的表面才會怎樣」的效果，例如模擬固定角度的光照方向。",
    en: "The Normal node lets you manually specify a direction and outputs the cosine of the angle (Dot) between it and the surface's real normal — useful for effects like 'only surfaces facing this direction do X', such as simulating a fixed light direction.",
  },
  startGraph: {
    nodes: [
      { id: "t_nc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_nc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.1, 0.1, 0.1, 1] } },
    ],
    links: [{ id: "t_nc_l1", fromNode: "t_nc_principled", fromSocket: "bsdf", toNode: "t_nc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_nc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_nc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.1, 0.1, 0.1, 1], emissionColor: [1, 1, 1, 1] } },
      { id: "te_nc_normal", typeId: "vector_normal", x: 300, y: 100, params: { normal: [0.5, 0.5, 0.7] } },
    ],
    links: [
      { id: "te_nc_l1", fromNode: "te_nc_principled", fromSocket: "bsdf", toNode: "te_nc_out", toSocket: "surface" },
      { id: "te_nc_l2", fromNode: "te_nc_normal", fromSocket: "dot", toNode: "te_nc_principled", toSocket: "emissionStrength" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入法線節點", en: "Step 1: Add a Normal Node" },
      instruction: {
        zh: "從「向量 Vector」分類拖入法線（Normal）節點。它有一組 X/Y/Z 數字欄位可以手動指定方向（本沙盒沒有 Blender 的 3D 方向球元件，改用數字輸入達到一樣的效果）。",
        en: "Drag in a Normal node from the Vector category. It has X/Y/Z number fields for manually specifying a direction (this sandbox doesn't have Blender's 3D direction-ball widget, so numeric input achieves the same effect).",
      },
      check: (graph) => hasNodeOfType(graph, "vector_normal"),
    },
    {
      title: { zh: "第二步：把 Dot 接到發光強度", en: "Step 2: Feed Dot Into Emission Strength" },
      instruction: {
        zh: "把法線節點的 Dot 輸出接到原理化 BSDF（Principled BSDF）的發光強度（Emission Strength）。正對著你指定方向的表面應該會發亮，背對的地方是暗的。",
        en: "Connect the Normal node's Dot output to Principled BSDF's Emission Strength. Surfaces facing your specified direction should glow, while surfaces facing away stay dark.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_normal", "dot", "shader_principled_bsdf", "emissionStrength"),
    },
    {
      title: { zh: "第三步：把發光顏色改亮一點", en: "Step 3: Brighten the Emission Color" },
      instruction: {
        zh: "把原理化 BSDF 的發光顏色（Emission Color）改成白色或亮色，這樣才看得出來發光強度的變化。",
        en: "Change Principled BSDF's Emission Color to white or a bright tone so the strength variation is visible.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "shader_principled_bsdf", "emissionColor", (v) => Array.isArray(v) && (v[0] + v[1] + v[2]) / 3 > 0.5),
    },
    {
      title: { zh: "第四步：換一個方向試試看", en: "Step 4: Try a Different Direction" },
      instruction: {
        zh: "把法線節點的 X/Y/Z 數值改成不一樣的方向（例如 (0, 1, 0) 代表正上方），旋轉預覽球體觀察發亮的區域怎麼跟著改變。",
        en: "Change the Normal node's X/Y/Z values to a different direction (e.g. (0, 1, 0) for straight up), then orbit the preview sphere to see how the glowing region shifts.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "vector_normal", "normal", (v) => Array.isArray(v) && (v[0] !== 0 || v[1] !== 0 || v[2] !== 1)),
    },
  ],
  quiz: [
    {
      question: {
        zh: "法線（Normal）節點的 Dot 輸出，代表什麼？",
        en: "What does the Normal node's Dot output represent?",
      },
      options: [
        { zh: "手動指定的方向本身", en: "The manually specified direction itself" },
        { zh: "手動指定方向跟表面真正法線之間夾角的餘弦值", en: "The cosine of the angle between the manually specified direction and the surface's real normal" },
        { zh: "表面的顏色", en: "The surface's color" },
        { zh: "光源的強度", en: "The light source's intensity" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Dot 輸出的是「手動指定方向」跟「表面實際法線」的夾角餘弦值——完全正對時是 1、垂直時是 0、背對時是負值，可以拿來做「只有朝向某個特定方向的表面才會怎樣」的效果，例如模擬固定角度的光照方向。",
        en: "Dot outputs the cosine of the angle between the manually specified direction and the surface's actual normal — 1 when directly facing it, 0 when perpendicular, negative when facing away. Useful for effects like 'only surfaces facing this specific direction do X', such as simulating a fixed light direction.",
      },
    },
  ],
};
