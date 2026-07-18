import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_neon_sign",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "做出發光招牌效果", en: "Make a Glowing Sign Effect" },
  description: {
    zh: "用波浪紋理（Wave Texture）產生的條紋圖案驅動發光（Emission）的發光強度，做出「有些地方亮、有些地方暗」的霓虹招牌效果，而不是整片均勻發光。",
    en: "Drive Emission's brightness with a Wave Texture pattern to create a neon sign that glows unevenly — bright in some areas, dark in others — instead of a flat uniform glow.",
  },
  startGraph: {
    nodes: [
      { id: "t_ns_out", typeId: "output_material", x: 900, y: 200, params: {} },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_ns_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_ns_emission", typeId: "shader_emission", x: 620, y: 100, params: {} },
      { id: "te_ns_wave", typeId: "texture_wave", x: 340, y: 100, params: { waveType: "rings" } },
      { id: "te_ns_texcoord", typeId: "input_texture_coordinate", x: 100, y: 100, params: {} },
    ],
    links: [
      { id: "te_ns_l1", fromNode: "te_ns_emission", fromSocket: "bsdf", toNode: "te_ns_out", toSocket: "surface" },
      { id: "te_ns_l2", fromNode: "te_ns_wave", fromSocket: "fac", toNode: "te_ns_emission", toSocket: "strength" },
      { id: "te_ns_l3", fromNode: "te_ns_texcoord", fromSocket: "generated", toNode: "te_ns_wave", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Emission 節點", en: "Step 1: Add an Emission Node" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入發光（Emission）節點，先把它接到材質輸出（Material Output）的表面（Surface），這時候應該是均勻發光。",
        en: "Drag in an Emission node from the Shader category and connect it to Material Output's Surface — it should glow uniformly for now.",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_emission"),
    },
    {
      title: { zh: "第二步：加入 Wave Texture 當作圖案", en: "Step 2: Add a Wave Texture for the Pattern" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入波浪紋理（Wave Texture），把波形（Wave Type）改成環狀（Rings），等一下要用它的條紋圖案控制哪裡亮、哪裡暗。",
        en: "Drag in a Wave Texture from the Texture category and set its Wave Type to Rings — we'll use its banding pattern to control where it glows brightest.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_wave"),
    },
    {
      title: { zh: "第三步：接上座標", en: "Step 3: Wire Up Coordinates" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入分類），把它的 Generated 輸出接到波浪紋理（Wave Texture）的向量（Vector）輸入。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Wave Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_wave", "vector"),
    },
    {
      title: { zh: "第四步：用 Fac 驅動發光強度", en: "Step 4: Drive Strength with Fac" },
      instruction: {
        zh: "把波浪紋理（Wave Texture）的係數（Fac）輸出接到發光（Emission）的強度（Strength），取代原本固定的滑桿數值。現在球體表面應該會依波紋圖案呈現忽亮忽暗的霓虹感，而不是整片均勻發光。",
        en: "Connect Wave Texture's Fac output to Emission's Strength, replacing the fixed slider value. The surface should now glow brighter and dimmer following the wave pattern — a neon look instead of flat uniform light.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_wave", "fac", "shader_emission", "strength"),
    },
  ],
};
