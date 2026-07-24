import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入 Brick Texture", en: "Step 1: Add a Brick Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入磚塊紋理（Brick Texture）。",
        en: "Drag in a Brick Texture from the Texture category.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_brick"),
    },
    {
      title: { zh: "第二步：接上座標", en: "Step 2: Wire Up Coordinates" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，輸入 Input 分類），把它的 Generated 輸出接到磚塊紋理（Brick Texture）的向量（Vector）。",
        en: "Add a Texture Coordinate (Input category) and connect its Generated output to Brick Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_brick", "vector"),
    },
    {
      title: { zh: "第三步：接到 Base Color", en: "Step 3: Feed Base Color" },
      instruction: {
        zh: "把磚塊紋理（Brick Texture）的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color），這時候應該已經能看到磚塊的顏色圖案了。",
        en: "Connect Brick Texture's Color output to Principled BSDF's Base Color — you should now see the brick color pattern.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_brick", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第四步：用 Bump 做出凹陷的灰泥縫", en: "Step 4: Recess the Mortar with Bump" },
      instruction: {
        zh: "加入凹凸（Bump）節點（向量 Vector 分類），把磚塊紋理（Brick Texture）的係數（Fac）輸出（灰泥縫的位置）接到凹凸的高度（Height），再把凹凸的輸出接到原理化 BSDF（Principled BSDF）的法線（Normal）。\n\n灰泥縫現在應該會有明顯的凹陷光影，而不只是顏色比較深而已。",
        en: "Add a Bump node (Vector category), connect Brick Texture's Fac output (the mortar locations) to Bump's Height, then connect Bump's output to Principled BSDF's Normal.\n\nThe mortar lines should now show real recessed shading, not just a darker color.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_brick", "fac", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
  ],
};
