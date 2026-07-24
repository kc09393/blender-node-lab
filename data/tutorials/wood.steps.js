import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
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
