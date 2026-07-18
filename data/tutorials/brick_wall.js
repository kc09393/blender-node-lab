import { hasNodeOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_brick_wall",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出磚牆材質", en: "Make a Brick Wall Material" },
  description: {
    zh: "用磚塊紋理（Brick Texture）做出磚牆的顏色圖案，再用凹凸（Bump）節點讓灰泥縫看起來真的凹下去，學會怎麼把一個節點的輸出同時當顏色與凹凸兩種用途。",
    en: "Use Brick Texture for the wall's color pattern, then use Bump to make the mortar lines actually look recessed — learn how one node's output can drive both color and bump at once.",
  },
  startGraph: {
    nodes: [
      { id: "t_bw_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bw_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_bw_l1", fromNode: "t_bw_principled", fromSocket: "bsdf", toNode: "t_bw_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bw_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_bw_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_bw_bump", typeId: "vector_bump", x: 560, y: 280, params: {} },
      { id: "te_bw_brick", typeId: "texture_brick", x: 320, y: 100, params: {} },
      { id: "te_bw_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_bw_l1", fromNode: "te_bw_principled", fromSocket: "bsdf", toNode: "te_bw_out", toSocket: "surface" },
      { id: "te_bw_l2", fromNode: "te_bw_brick", fromSocket: "color", toNode: "te_bw_principled", toSocket: "baseColor" },
      { id: "te_bw_l3", fromNode: "te_bw_brick", fromSocket: "fac", toNode: "te_bw_bump", toSocket: "height" },
      { id: "te_bw_l4", fromNode: "te_bw_bump", fromSocket: "normal", toNode: "te_bw_principled", toSocket: "normal" },
      { id: "te_bw_l5", fromNode: "te_bw_texcoord", fromSocket: "generated", toNode: "te_bw_brick", toSocket: "vector" },
    ],
  },
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
        zh: "加入凹凸（Bump）節點（向量 Vector 分類），把磚塊紋理（Brick Texture）的係數（Fac）輸出（灰泥縫的位置）接到凹凸的高度（Height），再把凹凸的輸出接到原理化 BSDF（Principled BSDF）的法線（Normal）。灰泥縫現在應該會有明顯的凹陷光影，而不只是顏色比較深而已。",
        en: "Add a Bump node (Vector category), connect Brick Texture's Fac output (the mortar locations) to Bump's Height, then connect Bump's output to Principled BSDF's Normal. The mortar lines should now show real recessed shading, not just a darker color.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_brick", "fac", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
  ],
};
