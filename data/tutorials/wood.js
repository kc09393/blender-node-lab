import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_wood",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出程序化木紋", en: "Make Procedural Wood Grain" },
  description: {
    zh: "串接波浪紋理（Wave Texture）、顏色漸變（Color Ramp）跟原理化 BSDF（Principled BSDF），完全不用貼圖就做出木紋材質。",
    en: "Chain Wave Texture, Color Ramp, and Principled BSDF together to create wood grain without any image textures.",
  },
  startGraph: {
    nodes: [
      { id: "t_wood_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_wood_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_wood_l1", fromNode: "t_wood_principled", fromSocket: "bsdf", toNode: "t_wood_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wood_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_wood_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_wood_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.25, 0.13, 0.05, 1] }, { position: 1, color: [0.55, 0.35, 0.18, 1] }] },
      },
      { id: "te_wood_wave", typeId: "texture_wave", x: 320, y: 100, params: {} },
      { id: "te_wood_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_wood_l1", fromNode: "te_wood_principled", fromSocket: "bsdf", toNode: "te_wood_out", toSocket: "surface" },
      { id: "te_wood_l2", fromNode: "te_wood_ramp", fromSocket: "color", toNode: "te_wood_principled", toSocket: "baseColor" },
      { id: "te_wood_l3", fromNode: "te_wood_wave", fromSocket: "fac", toNode: "te_wood_ramp", toSocket: "fac" },
      { id: "te_wood_l4", fromNode: "te_wood_texcoord", fromSocket: "generated", toNode: "te_wood_wave", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Wave Texture", en: "Step 1: Add a Wave Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入波浪紋理（Wave Texture）——它產生的條紋很適合當作年輪的基礎。",
        en: "Drag in a Wave Texture from the Texture category — its bands are a great starting point for tree rings.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_wave"),
    },
    {
      title: { zh: "第二步：接上座標", en: "Step 2: Wire Up Coordinates" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入 Input 分類），把它的 Generated 輸出接到波浪紋理（Wave Texture）的向量（Vector）輸入。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Wave Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_wave", "vector"),
    },
    {
      title: { zh: "第三步：用 Color Ramp 上色", en: "Step 3: Color It with Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp，轉換器 Converter 分類），把波浪紋理（Wave Texture）的係數（Fac）接到顏色漸變的係數，然後把起點顏色改成深棕色、終點改成淺棕色。",
        en: "Add a Color Ramp (Converter category), connect Wave Texture's Fac to Color Ramp's Fac, then set the start color to dark brown and the end color to light brown.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_wave", "fac", "converter_color_ramp", "fac"),
    },
    {
      title: { zh: "第四步：接到 Base Color", en: "Step 4: Feed Base Color" },
      instruction: {
        zh: "把顏色漸變（Color Ramp）的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color），完成木紋材質。",
        en: "Connect Color Ramp's Color output to Principled BSDF's Base Color to finish the wood material.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
};
